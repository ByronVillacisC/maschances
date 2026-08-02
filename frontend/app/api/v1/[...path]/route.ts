export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

async function proxyRequest(request: Request, { params }: { params: { path: string[] } }) {
  const pathSegments = params?.path ?? [];
  const path = pathSegments.join("/");
  const url = new URL(request.url);
  const targetUrl = `${BACKEND_URL}/api/v1/${path}${url.search}`;

  const headers = new Headers();
  
  // CRÍTICO: Extraer y preservar explícitamente las cookies
  const cookieHeader = request.headers.get("cookie");
  
  request.headers.forEach((value: string, key: string) => {
    const lower = key.toLowerCase();
    // NO enviar host, connection NI origin
    if (lower !== "host" && lower !== "connection" && lower !== "origin") {
      headers.set(key, value);
    }
  });

  // CRÍTICO: Asegurar que las cookies se reenvíen explícitamente
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
    credentials: "include",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const body = await request.text();
      if (body) init.body = body;
    } catch { /* empty body */ }
  }

  try {
    const response = await fetch(targetUrl, init);
    const responseHeaders = new Headers();
    
    // CRÍTICO: Preservar Set-Cookie headers del backend
    response.headers.forEach((value: string, key: string) => {
      const lower = key.toLowerCase();
      if (lower !== "transfer-encoding" && lower !== "content-encoding") {
        responseHeaders.set(key, value);
      }
    });

    const responseBody = await response.arrayBuffer();
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error("[PROXY ERROR]", err);
    return new Response(
      JSON.stringify({ error: "Error de conexión con el servidor", detail: err?.message ?? "" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(req: Request, ctx: { params: { path: string[] } }) {
  return proxyRequest(req, ctx);
}
export async function POST(req: Request, ctx: { params: { path: string[] } }) {
  return proxyRequest(req, ctx);
}
export async function PUT(req: Request, ctx: { params: { path: string[] } }) {
  return proxyRequest(req, ctx);
}
export async function PATCH(req: Request, ctx: { params: { path: string[] } }) {
  return proxyRequest(req, ctx);
}
export async function DELETE(req: Request, ctx: { params: { path: string[] } }) {
  return proxyRequest(req, ctx);
}