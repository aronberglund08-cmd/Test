import { requireIdentity } from "../../cursor/identity.js";

export type Viewer = {
  sub: string;
  name: string;
  kind: "person" | "key";
  stage: "production" | "preview";
};

export async function viewerFrom(request: Request): Promise<Viewer | Response> {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) {
    const headers = new Headers(identity.headers);
    headers.set("cache-control", "private, no-store");
    return new Response(identity.body, { status: identity.status, headers });
  }
  if (identity.sub.length > 200) {
    return Response.json({ error: "unauthorized" }, { status: 401, headers: { "cache-control": "private, no-store" } });
  }
  const name = identity.name.trim();
  return {
    sub: identity.sub,
    name,
    kind: identity.kind,
    stage: identity.stage === "preview" ? "preview" : "production",
  };
}

/** Preview traffic must not read or write the published wardrobe. */
export function ownerOf(viewer: Viewer): string {
  return `${viewer.stage}:${viewer.sub}`;
}
