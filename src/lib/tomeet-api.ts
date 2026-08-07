import { createClient } from "@/lib/supabase/client";

const API_BASE_URL = "/api/tomeet";
const MULTIMODAL_BUCKET = "tomeet-multimodal";

export type JobStatus =
  | "pending"
  | "processing"
  | "retry"
  | "completed"
  | "failed";

export type LlmJob = {
  id: string;
  type:
    | "agent_reply"
    | "agent_event_reply"
    | "multimodal_understanding"
    | "matchmaking"
    | "match_round_generate"
    | "match_round_settle"
    | "match_status_notify"
    | "room_change_notify"
    | "feedback_update"
    | "memory_extract"
    | "memory_consolidate";
  status: JobStatus;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  attempts: number;
  maxAttempts: number;
  partitionKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AgentMessage = {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type ApiErrorBody = {
  error: string;
  message: string;
  requestId?: string;
  details?: unknown;
};

export type SignedUpload = {
  path: string;
  token: string;
};

export class TomeetApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody
  ) {
    super(body.message || `TOMEET API request failed: ${status}`);
    this.name = "TomeetApiError";
  }
}

export class TomeetJobTimeoutError extends Error {
  constructor() {
    super("The Agent is still working. Refresh the conversation in a moment.");
    this.name = "TomeetJobTimeoutError";
  }
}

export class TomeetJobError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TomeetJobError";
  }
}

let browserClient: ReturnType<typeof createClient> | undefined;

function getSupabase() {
  browserClient ??= createClient();
  return browserClient;
}

async function getAccessToken() {
  const {
    data: { session },
    error,
  } = await getSupabase().auth.getSession();

  if (error) throw error;
  if (!session) {
    throw new TomeetApiError(401, {
      error: "UNAUTHENTICATED",
      message: "Your session has expired. Please sign in again.",
    });
  }

  return session.access_token;
}

export async function tomeetApi<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const accessToken = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });
  const body = (await response.json().catch(() => ({}))) as Partial<ApiErrorBody>;

  if (!response.ok) {
    throw new TomeetApiError(response.status, {
      error: body.error || "REQUEST_FAILED",
      message: body.message || `TOMEET API request failed: ${response.status}`,
      requestId: body.requestId,
      details: body.details,
    });
  }

  return body as T;
}

export function getAgentMessages(userId: string, signal?: AbortSignal) {
  return tomeetApi<{ messages: AgentMessage[] }>(
    `/agent/messages/${encodeURIComponent(userId)}`,
    { signal }
  );
}

export function sendAgentMessage(input: {
  userId: string;
  displayName: string;
  content: string;
  idempotencyKey: string;
}) {
  return tomeetApi<{ userMessage: AgentMessage; job: LlmJob }>(
    "/agent/messages",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export function signImageUpload(input: {
  userId: string;
  fileName: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  sizeBytes: number;
}) {
  return tomeetApi<SignedUpload>("/uploads/sign", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function uploadSignedImage(
  signedUpload: SignedUpload,
  file: File
) {
  const { error } = await getSupabase()
    .storage.from(MULTIMODAL_BUCKET)
    .uploadToSignedUrl(signedUpload.path, signedUpload.token, file, {
      contentType: file.type,
    });

  if (error) throw error;
}

export function registerImageInput(input: {
  userId: string;
  storagePath: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  sizeBytes: number;
  hint?: string;
}) {
  return tomeetApi<{ inputId: string; job: LlmJob }>(
    "/agent/multimodal-inputs",
    {
      method: "POST",
      body: JSON.stringify({
        ...input,
        kind: "image",
      }),
    }
  );
}

function abortableDelay(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }

    const handleAbort = () => {
      window.clearTimeout(timeout);
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    };
    const timeout = window.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, milliseconds);
    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

export async function waitForJob(
  job: LlmJob,
  options: { timeoutMs?: number; signal?: AbortSignal } = {}
) {
  if (job.status === "completed") return job;
  if (job.status === "failed") {
    throw new TomeetJobError(
      job.error || "The Agent could not finish this request."
    );
  }

  const deadline = Date.now() + (options.timeoutMs ?? 60_000);

  while (Date.now() < deadline) {
    await abortableDelay(1_500, options.signal);
    const { job: currentJob } = await tomeetApi<{ job: LlmJob }>(
      `/jobs/${encodeURIComponent(job.id)}`,
      { signal: options.signal }
    );

    if (currentJob.status === "completed") return currentJob;
    if (currentJob.status === "failed") {
      throw new TomeetJobError(
        currentJob.error || "The Agent could not finish this request."
      );
    }
  }

  throw new TomeetJobTimeoutError();
}
