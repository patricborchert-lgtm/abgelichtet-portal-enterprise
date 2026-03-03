const allowedOrigins = new Set([
  "https://portal.abgelichtet.ch",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

export function getCorsHeaders(origin: string | null): HeadersInit {
  const allowOrigin = origin && allowedOrigins.has(origin) ? origin : "https://portal.abgelichtet.ch";

  return {
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": allowOrigin,
    "Content-Type": "application/json",
    Vary: "Origin",
  };
}

export function createJsonResponse(origin: string | null, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: getCorsHeaders(origin),
    status,
  });
}

export function handleOptions(origin: string | null): Response {
  return new Response("ok", {
    headers: getCorsHeaders(origin),
    status: 200,
  });
}
