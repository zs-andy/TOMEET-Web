const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_JSON_BODY_BYTES = 64 * 1024;

type RouteHandlerContext = {
  params: Promise<{ path: string[] }>;
};

function isAllowedRoute(method: string, path: string[]) {
  if (method === "POST") {
    return (
      (path.length === 2 && path[0] === "agent" && path[1] === "messages") ||
      (path.length === 2 &&
        path[0] === "agent" &&
        path[1] === "multimodal-inputs") ||
      (path.length === 2 && path[0] === "uploads" && path[1] === "sign")
    );
  }

  if (method === "GET") {
    return (
      (path.length === 3 &&
        path[0] === "agent" &&
        path[1] === "messages" &&
        UUID_PATTERN.test(path[2])) ||
      (path.length === 2 &&
        path[0] === "jobs" &&
        UUID_PATTERN.test(path[1]))
    );
  }

  return false;
}

function jsonError(status: number, error: string, message: string) {
  return Response.json(
    { error, message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

async function proxyToTomeet(
  request: Request,
  context: RouteHandlerContext
) {
  const { path } = await context.params;
  if (!isAllowedRoute(request.method, path)) {
    return jsonError(404, "NOT_FOUND", "接口不存在");
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonError(401, "UNAUTHENTICATED", "缺少 Bearer access token");
  }

  const configuredBaseUrl =
    process.env.TOMEET_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configuredBaseUrl) {
    return jsonError(
      503,
      "API_NOT_CONFIGURED",
      "TOMEET Agent service is not configured."
    );
  }

  let apiBaseUrl: URL;
  try {
    apiBaseUrl = new URL(configuredBaseUrl);
  } catch {
    return jsonError(
      503,
      "API_NOT_CONFIGURED",
      "TOMEET Agent service is not configured."
    );
  }
  if (
    apiBaseUrl.protocol !== "https:" &&
    !(apiBaseUrl.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(apiBaseUrl.hostname))
  ) {
    return jsonError(
      503,
      "API_NOT_CONFIGURED",
      "TOMEET Agent service is not configured."
    );
  }

  apiBaseUrl.pathname = `${apiBaseUrl.pathname.replace(/\/+$/, "")}/${path.join("/")}`;
  apiBaseUrl.search = "";
  apiBaseUrl.hash = "";
  const upstreamUrl = apiBaseUrl;
  const upstreamHeaders = new Headers({
    Accept: "application/json",
    Authorization: authorization,
  });
  const requestId = request.headers.get("x-request-id");
  if (requestId) upstreamHeaders.set("x-request-id", requestId);

  let body: string | undefined;
  if (request.method === "POST") {
    body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_JSON_BODY_BYTES) {
      return jsonError(413, "PAYLOAD_TOO_LARGE", "请求体过大");
    }
    upstreamHeaders.set("Content-Type", "application/json");
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: request.method,
      headers: upstreamHeaders,
      body,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(30_000),
    });
    const responseHeaders = new Headers({
      "Cache-Control": "no-store",
      "Content-Type":
        upstreamResponse.headers.get("content-type") ??
        "application/json; charset=utf-8",
    });
    const upstreamRequestId = upstreamResponse.headers.get("x-request-id");
    const retryAfter = upstreamResponse.headers.get("retry-after");
    if (upstreamRequestId) {
      responseHeaders.set("x-request-id", upstreamRequestId);
    }
    if (retryAfter) responseHeaders.set("retry-after", retryAfter);

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch {
    return jsonError(502, "UPSTREAM_UNAVAILABLE", "Agent 服务暂时不可用");
  }
}

export function GET(request: Request, context: RouteHandlerContext) {
  return proxyToTomeet(request, context);
}

export function POST(request: Request, context: RouteHandlerContext) {
  return proxyToTomeet(request, context);
}
