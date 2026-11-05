import {
  AESTHETICS,
  CATEGORIES,
  COLORS,
  CONDITIONS,
  FITS,
  FORMALITIES,
  MATERIALS,
  OCCASIONS,
  SEASONS,
  SIZE_SYSTEMS,
  type Aesthetic,
  type Category,
  type ColorId,
  type Condition,
  type Fit,
  type Formality,
  type Occasion,
  type Profile,
  type Season,
  type Silhouette,
  type SizeSystem,
  type StyleProfile,
} from "./domain";
import { decodeImage } from "./images";

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; error: string };
type Result<T> = Ok<T> | Err;

function fail(error: string): Err {
  return { ok: false, error };
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : null;
}

function ids<T extends string>(list: readonly { id: T }[]): T[] {
  return list.map((item) => item.id);
}

function optionalInt(value: unknown, min: number, max: number): number | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value.replace(",", ".")) : NaN;
  if (!Number.isFinite(number)) return undefined;
  const rounded = Math.round(number);
  if (rounded < min || rounded > max) return undefined;
  return rounded;
}

function text(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length > max) return null;
  return trimmed;
}

export function validateProfile(input: unknown): Result<Profile> {
  if (!input || typeof input !== "object") return fail("Profilen gick inte att läsa.");
  const body = input as Record<string, unknown>;
  const sizeSystem = oneOf(body.sizeSystem, ids(SIZE_SYSTEMS));
  const fit = oneOf(body.fit, ids(FITS));
  if (!sizeSystem || !fit) return fail("Välj storlekssystem och passform.");
  const fields = {
    heightCm: optionalInt(body.heightCm, 120, 220),
    chestCm: optionalInt(body.chestCm, 60, 160),
    waistCm: optionalInt(body.waistCm, 50, 160),
    hipsCm: optionalInt(body.hipsCm, 60, 170),
    shoulderCm: optionalInt(body.shoulderCm, 30, 60),
    inseamCm: optionalInt(body.inseamCm, 55, 95),
    sleeveCm: optionalInt(body.sleeveCm, 45, 75),
    neckCm: optionalInt(body.neckCm, 28, 50),
  };
  if (Object.values(fields).some((value) => value === undefined)) return fail("Kontrollera måtten. Lämna tomt det du inte vet.");
  let shoeEu: number | null = null;
  if (body.shoeEu !== null && body.shoeEu !== undefined && body.shoeEu !== "") {
    const shoe = typeof body.shoeEu === "number" ? body.shoeEu : typeof body.shoeEu === "string" ? Number(body.shoeEu.replace(",", ".")) : NaN;
    if (!Number.isFinite(shoe) || shoe < 30 || shoe > 52) return fail("Skostorleken ska vara mellan 30 och 52.");
    shoeEu = Math.round(shoe * 2) / 2;
  }
  const notes = text(body.notes, 600);
  if (notes === null) return fail("Anteckningen är för lång.");
  return {
    ok: true,
    value: {
      sizeSystem,
      fit,
      ...fields,
      shoeEu,
      notes,
    } as Profile,
  };
}

export function validateStyle(input: unknown): Result<StyleProfile> {
  if (!input || typeof input !== "object") return fail("Stilen gick inte att läsa.");
  const body = input as Record<string, unknown>;
  const aesthetics = uniqueAllowed(body.aesthetics, ids(AESTHETICS), 4);
  const palette = uniqueAllowed(body.palette, ids(COLORS), 8);
  const avoid = uniqueAllowed(body.avoid, ids(COLORS), 8);
  if (!aesthetics || !palette || !avoid) return fail("Kontrollera stil och färger.");
  const monthBudgetSek = optionalInt(body.monthBudgetSek, 0, 100_000);
  const itemBudgetSek = optionalInt(body.itemBudgetSek, 0, 100_000);
  if (monthBudgetSek === undefined || itemBudgetSek === undefined) return fail("Budgeten behöver vara ett belopp i kronor.");
  const notes = text(body.notes, 600);
  if (notes === null) return fail("Anteckningen är för lång.");
  const avoidSet = new Set(avoid);
  return {
    ok: true,
    value: {
      aesthetics: aesthetics as Aesthetic[],
      palette: (palette as ColorId[]).filter((color) => !avoidSet.has(color)),
      avoid: avoid as ColorId[],
      monthBudgetSek: monthBudgetSek === 0 ? null : monthBudgetSek,
      itemBudgetSek: itemBudgetSek === 0 ? null : itemBudgetSek,
      notes,
    },
  };
}

function uniqueAllowed(value: unknown, allowed: readonly string[], max: number): string[] | null {
  if (!Array.isArray(value)) return null;
  const next: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !allowed.includes(item) || next.includes(item)) continue;
    next.push(item);
    if (next.length > max) return null;
  }
  return next;
}

export type GarmentInput = {
  name: string;
  category: Category;
  subcategory: string;
  color: ColorId;
  patterned: boolean;
  material: string;
  brand: string;
  seasons: Season[];
  formality: Formality;
  silhouette: Silhouette;
  condition: Condition;
  priceSek: number | null;
  fitNote: string;
  notes: string;
  favorite: boolean;
  inRotation: boolean;
  photo: { mime: "image/jpeg" | "image/png" | "image/webp"; data: string } | null;
  clearPhoto: boolean;
};

export function validateGarment(input: unknown): Result<GarmentInput> {
  if (!input || typeof input !== "object") return fail("Plagget gick inte att läsa.");
  const body = input as Record<string, unknown>;
  const name = text(body.name, 60);
  const brand = text(body.brand, 40);
  const fitNote = text(body.fitNote, 200);
  const notes = text(body.notes, 400);
  if (!name) return fail("Ge plagget ett namn.");
  if (brand === null || fitNote === null || notes === null) return fail("En text är för lång.");
  const category = oneOf(body.category, ids(CATEGORIES));
  if (!category) return fail("Välj en kategori.");
  const subs = CATEGORIES.find((item) => item.id === category)?.subs ?? [];
  const subcategory = oneOf(body.subcategory, subs.map((item) => item.id));
  if (!subcategory) return fail("Välj typ av plagg.");
  const color = oneOf(body.color, ids(COLORS));
  const formality = oneOf(body.formality, ids(FORMALITIES));
  const silhouette = oneOf(body.silhouette, ids(FITS));
  const condition = oneOf(body.condition, ids(CONDITIONS));
  if (!color || !formality || !silhouette || !condition) return fail("Kontrollera färg, formalitet och passform.");
  const material = oneOf(body.material ?? "", ids(MATERIALS));
  if (material === null) return fail("Välj material eller lämna det tomt.");
  const seasons = uniqueAllowed(body.seasons, ids(SEASONS), 5);
  if (!seasons || seasons.length === 0) return fail("Välj säsong.");
  const seasonIds = (seasons.includes("alla") ? ["alla"] : seasons) as Season[];
  const priceSek = optionalInt(body.priceSek, 0, 100_000);
  if (priceSek === undefined) return fail("Priset behöver vara ett belopp i kronor.");
  if (typeof body.patterned !== "boolean" || typeof body.favorite !== "boolean" || typeof body.inRotation !== "boolean") {
    return fail("Kontrollera kryssrutorna.");
  }
  let photo: GarmentInput["photo"] = null;
  if (body.photo !== null && body.photo !== undefined && body.photo !== "") {
    const decoded = decodeImage(body.photo);
    if (!decoded) return fail("Bilden behöver vara en JPEG, PNG eller WebP, och inte för stor.");
    photo = decoded;
  }
  return {
    ok: true,
    value: {
      name,
      category,
      subcategory,
      color,
      patterned: body.patterned,
      material,
      brand,
      seasons: seasonIds,
      formality,
      silhouette,
      condition,
      priceSek,
      fitNote,
      notes,
      favorite: body.favorite,
      inRotation: body.inRotation,
      photo,
      clearPhoto: body.photo === null,
    },
  };
}

export function validateCaption(input: unknown): Result<{ caption: string }> {
  if (!input || typeof input !== "object") return fail("Texten gick inte att läsa.");
  const caption = text((input as Record<string, unknown>).caption, 140);
  if (caption === null) return fail("Bildtexten är för lång.");
  return { ok: true, value: { caption } };
}

export function validateWish(input: unknown): Result<{ title: string; brand: string; reason: string; priceHint: string }> {
  if (!input || typeof input !== "object") return fail("Önskemålet gick inte att läsa.");
  const body = input as Record<string, unknown>;
  const title = text(body.title, 80);
  const brand = text(body.brand, 40);
  const reason = text(body.reason, 240);
  const priceHint = text(body.priceHint, 40);
  if (!title || brand === null || reason === null || priceHint === null) return fail("Skriv vad du vill köpa.");
  return { ok: true, value: { title, brand, reason, priceHint } };
}

export function validateOutfit(input: unknown): Result<{ title: string; occasion: Occasion; why: string; pieceIds: string[] }> {
  if (!input || typeof input !== "object") return fail("Looken gick inte att läsa.");
  const body = input as Record<string, unknown>;
  const title = text(body.title, 80);
  const why = text(body.why, 400);
  const occasion = oneOf(body.occasion, ids(OCCASIONS));
  if (!title || why === null || !occasion) return fail("Looken saknar titel eller tillfälle.");
  if (!Array.isArray(body.pieceIds) || body.pieceIds.length === 0 || body.pieceIds.length > 8) {
    return fail("Looken behöver minst ett plagg.");
  }
  const pieceIds: string[] = [];
  for (const id of body.pieceIds) {
    if (typeof id !== "string" || !/^[A-Za-z0-9-]{1,80}$/.test(id) || pieceIds.includes(id)) {
      return fail("Looken pekar på ett ogiltigt plagg.");
    }
    pieceIds.push(id);
  }
  return { ok: true, value: { title, occasion, why, pieceIds } };
}

export function parseOccasion(value: string | null): Occasion {
  const found = oneOf(value, ids(OCCASIONS));
  return found ?? "vardag";
}
