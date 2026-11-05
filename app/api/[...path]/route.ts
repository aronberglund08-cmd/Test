import { handle } from "@/src/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function dispatch(method: string, request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  return handle(method, request, params.path ?? []);
}

export function GET(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return dispatch("GET", request, ctx);
}

export function POST(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return dispatch("POST", request, ctx);
}

export function PUT(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return dispatch("PUT", request, ctx);
}

export function DELETE(request: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  return dispatch("DELETE", request, ctx);
}
