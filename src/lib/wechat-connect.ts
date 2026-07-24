const API_BASE_URL = "/api/tomeet";

export type WechatConnectStatus =
  | "pending"
  | "scanned"
  | "verification_required"
  | "active"
  | "expired"
  | "failed";

export type WechatConnectSession = {
  sessionId: string;
  status: WechatConnectStatus;
  expiresAt: string;
  confirmedAt: string | null;
  errorCode: string | null;
  errorMessage: string | null;
};

export type CreatedWechatConnectSession = WechatConnectSession & {
  sessionToken: string;
  qrCodeContent: string;
  qrCodeDataUrl: string;
};

type WechatApiErrorBody = {
  error?: string;
  message?: string;
};

type WechatSessionStreamHandlers = {
  onSession(session: WechatConnectSession): void;
};

export class WechatConnectError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly retryAfterMs?: number
  ) {
    super(message);
    this.name = "WechatConnectError";
  }
}

function retryAfterMilliseconds(value: string | null) {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1_000);

  const date = Date.parse(value);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, date - Date.now());
}

async function wechatRequest<T>(path: string, init: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as WechatApiErrorBody;

  if (!response.ok) {
    throw new WechatConnectError(
      response.status,
      body.error ?? "wechat_request_failed",
      body.message ?? "微信入口暂时不可用",
      retryAfterMilliseconds(response.headers.get("retry-after"))
    );
  }

  return body as T;
}

export function createWechatConnectSession(signal?: AbortSignal) {
  return wechatRequest<CreatedWechatConnectSession>(
    "/wechat/connect/sessions",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal,
    }
  );
}

export function getWechatConnectSession(
  sessionId: string,
  sessionToken: string,
  signal?: AbortSignal
) {
  return wechatRequest<WechatConnectSession>(
    `/wechat/connect/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: "GET",
      headers: { "x-wechat-session-token": sessionToken },
      signal,
    }
  );
}

function parseSseBlock(
  block: string,
  handlers: WechatSessionStreamHandlers
) {
  let event = "message";
  const data: string[] = [];

  for (const line of block.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    const separator = line.indexOf(":");
    const field = separator === -1 ? line : line.slice(0, separator);
    const rawValue = separator === -1 ? "" : line.slice(separator + 1);
    const value = rawValue.startsWith(" ") ? rawValue.slice(1) : rawValue;
    if (field === "event") event = value;
    if (field === "data") data.push(value);
  }

  if (!data.length) return;
  const payload = JSON.parse(data.join("\n")) as WechatConnectSession & WechatApiErrorBody;
  if (event === "session" || event === "done" || event === "message") {
    handlers.onSession(payload);
    return;
  }
  if (event === "error") {
    throw new WechatConnectError(
      502,
      payload.error ?? "wechat_session_stream_failed",
      payload.message ?? "微信状态推送暂时中断"
    );
  }
}

export async function streamWechatConnectSession(
  sessionId: string,
  sessionToken: string,
  handlers: WechatSessionStreamHandlers,
  signal?: AbortSignal
) {
  const response = await fetch(
    `${API_BASE_URL}/wechat/connect/sessions/${encodeURIComponent(sessionId)}/events`,
    {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        "x-wechat-session-token": sessionToken,
      },
      cache: "no-store",
      signal,
    }
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as WechatApiErrorBody;
    throw new WechatConnectError(
      response.status,
      body.error ?? "wechat_session_stream_failed",
      body.message ?? "微信状态推送暂时中断",
      retryAfterMilliseconds(response.headers.get("retry-after"))
    );
  }
  if (!response.body) {
    throw new WechatConnectError(
      502,
      "wechat_session_stream_unavailable",
      "微信状态推送暂时不可用"
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      parseSseBlock(block, handlers);
      boundary = buffer.indexOf("\n\n");
    }

    if (done) break;
  }
  if (buffer.trim()) parseSseBlock(buffer, handlers);
}

export function verifyWechatConnectSession(
  sessionId: string,
  sessionToken: string,
  code: string,
  signal?: AbortSignal
) {
  return wechatRequest<WechatConnectSession>(
    `/wechat/connect/sessions/${encodeURIComponent(sessionId)}/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wechat-session-token": sessionToken,
      },
      body: JSON.stringify({ code }),
      signal,
    }
  );
}
