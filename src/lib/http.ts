import { advise } from "./advise";
import { ownerOf, viewerFrom, type Viewer } from "./auth";
import { categoryLabel, isId, type Garment, type Occasion } from "./domain";
import { decodeImage } from "./images";
import { suggestLooks, type Look } from "./engine";
import {
  addStyleImage,
  countGarments,
  countOutfits,
  countStyleImages,
  countWishes,
  deleteExamples,
  deleteGarment,
  deleteOutfit,
  deleteStyleImage,
  deleteWish,
  getProfile,
  getStyle,
  insertExamples,
  insertGarment,
  insertOutfit,
  insertWish,
  listGarments,
  listOutfits,
  listStyleImages,
  listWishes,
  resetOwner,
  saveProfile,
  saveStyle,
  updateGarment,
  updateStyleImageCaption,
} from "./store";
import { greetingForHour, seasonLabel, stockholmNow } from "./time";
import { parseOccasion, validateCaption, validateGarment, validateOutfit, validateProfile, validateStyle, validateWish } from "./validate";

const LIMITS = { garments: 150, images: 20, outfits: 60, wishes: 60 };

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { "cache-control": "private, no-store" } });
}

function rejectCrossSite(request: Request): Response | null {
  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      return json({ error: "Ogiltig förfrågan" }, 403);
    }
    if (!host || originHost !== host) return json({ error: "Ogiltig förfrågan" }, 403);
  }
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return json({ error: "Ogiltig förfrågan" }, 403);
  return null;
}

async function readBody(request: Request): Promise<{ body: unknown } | Response> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 1_500_000) return json({ error: "För stor förfrågan" }, 413);
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) return json({ error: "Ogiltig förfrågan" }, 415);
  const raw = await request.text();
  if (raw.length > 1_500_000) return json({ error: "För stor förfrågan" }, 413);
  if (!raw) return { body: {} };
  try {
    return { body: JSON.parse(raw) as unknown };
  } catch {
    return json({ error: "Ogiltig förfrågan" }, 400);
  }
}

function balance(garments: Garment[]) {
  const counts: Record<string, number> = {};
  for (const garment of garments) {
    if (garment.category === "accessoar") continue;
    counts[garment.category] = (counts[garment.category] ?? 0) + 1;
  }
  return (["overdel", "underdel", "heldragt", "ytterplagg", "skor"] as const).map((id) => ({
    id,
    label: categoryLabel(id),
    count: counts[id] ?? 0,
  }));
}

function publicGarment(garment: Garment) {
  return garment;
}

function hydrate(look: Look, garments: Garment[]) {
  const byId = new Map(garments.map((garment) => [garment.id, garment]));
  return {
    title: look.title,
    why: look.why,
    occasion: look.occasion,
    pieces: look.pieces.map((piece) => {
      const full = byId.get(piece.id);
      return {
        id: piece.id,
        name: piece.name,
        brand: piece.brand,
        category: piece.category,
        subcategory: piece.subcategory,
        color: piece.color,
        slot: piece.slot,
        source: piece.source,
        photoMime: full?.photoMime ?? null,
        photoData: full?.photoData ?? null,
      };
    }),
  };
}

async function suggestions(owner: string, occasion: Occasion, anchorId?: string) {
  const [garments, style, profile] = await Promise.all([listGarments(owner), getStyle(owner), getProfile(owner)]);
  const { month } = stockholmNow();
  const result = suggestLooks({
    pieces: garments,
    occasion,
    month,
    avoid: style.avoid,
    prefer: style.palette,
    anchorId,
    fit: profile.fit,
    limit: anchorId ? 3 : 8,
  });
  return {
    looks: result.looks.map((look) => hydrate(look, garments)),
    missing: result.missing,
    note: result.note,
    month,
    season: seasonLabel(month),
  };
}

export async function handle(method: string, request: Request, parts: string[]): Promise<Response> {
  const viewerResult = await viewerFrom(request);
  if (viewerResult instanceof Response) return viewerResult;
  const viewer = viewerResult;
  const owner = ownerOf(viewer);
  if (method !== "GET" && method !== "HEAD") {
    const rejected = rejectCrossSite(request);
    if (rejected) return rejected;
  }

  try {
    return await route(method, request, parts, viewer, owner);
  } catch (error) {
    console.error("api error", parts.join("/"), error instanceof Error ? error.message : "unknown");
    return json({ error: "Något gick fel" }, 500);
  }
}

async function route(method: string, request: Request, parts: string[], viewer: Viewer, owner: string): Promise<Response> {
  const key = `${method} ${parts.join("/")}`;
  const url = new URL(request.url);

  if (key === "GET me") {
    return json({ name: viewer.kind === "key" ? viewer.name || "Nyckel" : viewer.name, stage: viewer.stage });
  }

  if (key === "GET home") {
    const occasion = parseOccasion(url.searchParams.get("occasion"));
    const [profile, style, garments, suggested] = await Promise.all([
      getProfile(owner),
      getStyle(owner),
      listGarments(owner),
      suggestions(owner, occasion),
    ]);
    const advice = advise({
      pieces: garments,
      aesthetics: style.aesthetics,
      system: profile.sizeSystem,
      avoid: style.avoid,
      itemBudget: style.itemBudgetSek,
      monthBudget: style.monthBudgetSek,
      month: suggested.month,
    });
    const images = await listStyleImages(owner);
    return json({
      viewer: { name: viewer.name, stage: viewer.stage },
      greeting: greetingForHour(stockholmNow().hour),
      dateLabel: stockholmNow().label,
      season: suggested.season,
      occasion,
      profile,
      style,
      balance: balance(garments),
      exampleCount: garments.filter((garment) => garment.source === "example").length,
      ownCount: garments.filter((garment) => garment.source === "own").length,
      looks: suggested.looks,
      missing: suggested.missing,
      gaps: advice.gaps.slice(0, 3),
      pace: advice.pace,
      images: images.slice(0, 8),
    });
  }

  if (key === "GET profile") return json(await getProfile(owner));
  if (key === "PUT profile") {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const parsed = validateProfile(body.body);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    return json(await saveProfile(owner, parsed.value));
  }

  if (key === "GET style") return json({ ...(await getStyle(owner)), images: await listStyleImages(owner) });
  if (key === "PUT style") {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const parsed = validateStyle(body.body);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    return json(await saveStyle(owner, parsed.value));
  }

  if (key === "GET style-images") return json(await listStyleImages(owner));
  if (key === "POST style-images") {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const record = body.body as Record<string, unknown>;
    const kind = record.kind === "budget" ? "budget" : record.kind === "stil" ? "stil" : null;
    if (!kind) return json({ error: "Välj om bilden är stil eller budget." }, 400);
    const caption = typeof record.caption === "string" ? record.caption.trim().slice(0, 140) : "";
    const image = decodeImage(record.photo);
    if (!image) return json({ error: "Bilden behöver vara en JPEG, PNG eller WebP, och inte för stor." }, 400);
    if ((await countStyleImages(owner)) >= LIMITS.images) return json({ error: "Du kan spara högst 20 bilder. Ta bort en först." }, 400);
    const id = crypto.randomUUID();
    await addStyleImage(owner, { id, kind, caption, mime: image.mime, data: image.data });
    return json({ id, kind, caption, mime: image.mime, data: image.data }, 201);
  }

  if (method === "PUT" && parts[0] === "style-images" && parts[1] && isId(parts[1]) && parts.length === 2) {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const parsed = validateCaption(body.body);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    const updated = await updateStyleImageCaption(owner, parts[1], parsed.value.caption);
    if (!updated) return json({ error: "Bilden finns inte." }, 404);
    return json({ ok: true });
  }
  if (method === "DELETE" && parts[0] === "style-images" && parts[1] && isId(parts[1]) && parts.length === 2) {
    const removed = await deleteStyleImage(owner, parts[1]);
    if (!removed) return json({ error: "Bilden finns inte." }, 404);
    return json({ ok: true });
  }

  if (key === "GET garments") return json(await listGarments(owner));
  if (key === "POST garments") {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const parsed = validateGarment(body.body);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    if ((await countGarments(owner)) >= LIMITS.garments) return json({ error: "Garderoben är full. Ta bort något först." }, 400);
    const garment = await insertGarment(owner, crypto.randomUUID(), parsed.value, "own");
    return json(publicGarment(garment), 201);
  }
  if (method === "PUT" && parts[0] === "garments" && parts[1] && isId(parts[1]) && parts.length === 2) {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const parsed = validateGarment(body.body);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    const garment = await updateGarment(owner, parts[1], parsed.value);
    if (!garment) return json({ error: "Plagget finns inte." }, 404);
    return json(garment);
  }
  if (method === "DELETE" && parts[0] === "garments" && parts[1] && isId(parts[1]) && parts.length === 2) {
    const removed = await deleteGarment(owner, parts[1]);
    if (!removed) return json({ error: "Plagget finns inte." }, 404);
    return json({ ok: true });
  }

  if (key === "GET suggestions") {
    const occasion = parseOccasion(url.searchParams.get("occasion"));
    const anchor = url.searchParams.get("anchor");
    if (anchor && !isId(anchor)) return json({ error: "Ogiltigt plagg." }, 400);
    return json(await suggestions(owner, occasion, anchor || undefined));
  }

  if (key === "GET outfits") {
    const [outfits, garments] = await Promise.all([listOutfits(owner), listGarments(owner)]);
    const byId = new Map(garments.map((garment) => [garment.id, garment]));
    return json(
      outfits.map((outfit) => ({
        ...outfit,
        pieces: outfit.pieceIds.map((id) => byId.get(id) ?? null),
        incomplete: outfit.pieceIds.some((id) => !byId.has(id)),
      })),
    );
  }
  if (key === "POST outfits") {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const parsed = validateOutfit(body.body);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    const garments = await listGarments(owner);
    const owned = new Set(garments.map((garment) => garment.id));
    if (parsed.value.pieceIds.some((id) => !owned.has(id))) return json({ error: "Looken innehåller ett plagg som inte är ditt." }, 400);
    const signature = [...parsed.value.pieceIds].sort().join(",");
    const existing = await listOutfits(owner);
    if (existing.some((outfit) => [...outfit.pieceIds].sort().join(",") === signature)) return json({ ok: true, duplicate: true });
    if ((await countOutfits(owner)) >= LIMITS.outfits) return json({ error: "Du har sparat för många looks. Ta bort en först." }, 400);
    await insertOutfit(owner, { id: crypto.randomUUID(), ...parsed.value });
    return json({ ok: true }, 201);
  }
  if (method === "DELETE" && parts[0] === "outfits" && parts[1] && isId(parts[1]) && parts.length === 2) {
    const removed = await deleteOutfit(owner, parts[1]);
    if (!removed) return json({ error: "Looken finns inte." }, 404);
    return json({ ok: true });
  }

  if (key === "GET shopping") {
    const [garments, style, profile, wishes] = await Promise.all([
      listGarments(owner),
      getStyle(owner),
      getProfile(owner),
      listWishes(owner),
    ]);
    const { month } = stockholmNow();
    const advice = advise({
      pieces: garments,
      aesthetics: style.aesthetics,
      system: profile.sizeSystem,
      avoid: style.avoid,
      itemBudget: style.itemBudgetSek,
      monthBudget: style.monthBudgetSek,
      month,
    });
    return json({ ...advice, wishes, style, month, season: seasonLabel(month), images: await listStyleImages(owner) });
  }

  if (key === "GET wishes") return json(await listWishes(owner));
  if (key === "POST wishes") {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const parsed = validateWish(body.body);
    if (!parsed.ok) return json({ error: parsed.error }, 400);
    if ((await countWishes(owner)) >= LIMITS.wishes) return json({ error: "Inköpslistan är full." }, 400);
    const existing = await listWishes(owner);
    if (existing.some((wish) => wish.title === parsed.value.title)) return json({ ok: true, duplicate: true });
    await insertWish(owner, { id: crypto.randomUUID(), ...parsed.value });
    return json({ ok: true }, 201);
  }
  if (method === "DELETE" && parts[0] === "wishes" && parts[1] && isId(parts[1]) && parts.length === 2) {
    const removed = await deleteWish(owner, parts[1]);
    if (!removed) return json({ error: "Önskemålet finns inte." }, 404);
    return json({ ok: true });
  }

  if (key === "POST example") {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    if ((await countGarments(owner)) + 18 > LIMITS.garments) return json({ error: "Det finns inte plats för exempelplaggen." }, 400);
    const added = await insertExamples(owner);
    return json({ added });
  }
  if (key === "DELETE example") {
    const removed = await deleteExamples(owner);
    return json({ removed });
  }

  if (key === "POST reset") {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const confirm = (body.body as Record<string, unknown>).confirm;
    if (confirm !== "radera") return json({ error: "Skriv bekräftelsen för att radera." }, 400);
    await resetOwner(owner);
    return json({ ok: true });
  }

  return json({ error: "Sidan finns inte." }, 404);
}
