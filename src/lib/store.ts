import type { GarmentInput } from "./validate";
import { sql } from "./db";
import {
  emptyProfile,
  emptyStyle,
  type Garment,
  type Profile,
  type SavedOutfit,
  type StyleImage,
  type StyleProfile,
  type Wish,
} from "./domain";
import { EXAMPLE_PIECES } from "./example";

type Row = Record<string, unknown>;

function asStrings(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") {
    try {
      return asStrings(JSON.parse(value));
    } catch {
      return [];
    }
  }
  return [];
}

function asInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.round(number) : null;
}

function asNum(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function mapProfile(row: Row | undefined): Profile {
  if (!row) return emptyProfile();
  const profile = emptyProfile();
  const sizeSystem = row.size_system;
  const fit = row.fit;
  return {
    ...profile,
    sizeSystem: sizeSystem === "dam" || sizeSystem === "herr" || sizeSystem === "unisex" ? sizeSystem : "unisex",
    fit: fit === "tajt" || fit === "normal" || fit === "los" ? fit : "normal",
    heightCm: asInt(row.height_cm),
    chestCm: asInt(row.chest_cm),
    waistCm: asInt(row.waist_cm),
    hipsCm: asInt(row.hips_cm),
    shoulderCm: asInt(row.shoulder_cm),
    inseamCm: asInt(row.inseam_cm),
    sleeveCm: asInt(row.sleeve_cm),
    neckCm: asInt(row.neck_cm),
    shoeEu: asNum(row.shoe_eu),
    notes: typeof row.notes === "string" ? row.notes : "",
  };
}

function mapStyle(row: Row | undefined): StyleProfile {
  const style = emptyStyle();
  if (!row) return style;
  const aesthetics = asStrings(row.aesthetics).filter((item): item is StyleProfile["aesthetics"][number] =>
    ["minimal", "klassisk", "skraddad", "street", "romantisk", "workwear", "sportig"].includes(item),
  );
  const colors = ["svart", "vit", "offwhite", "gra", "marin", "beige", "sand", "kamel", "brun", "cognac", "khaki", "oliv", "denim", "ljusbla", "rost", "burgundy", "rod", "rosa", "gron", "senap", "lila", "orange"];
  const pick = (value: unknown) => asStrings(value).filter((item): item is StyleProfile["palette"][number] => colors.includes(item));
  return {
    aesthetics,
    palette: pick(row.palette),
    avoid: pick(row.avoid),
    monthBudgetSek: asInt(row.month_budget_sek),
    itemBudgetSek: asInt(row.item_budget_sek),
    notes: typeof row.notes === "string" ? row.notes : "",
  };
}

function mapGarment(row: Row): Garment {
  const category = row.category;
  const formality = row.formality;
  const silhouette = row.silhouette;
  const condition = row.condition;
  const seasons = asStrings(row.seasons).filter((item): item is Garment["seasons"][number] =>
    ["alla", "var", "sommar", "host", "vinter"].includes(item),
  );
  return {
    id: String(row.id),
    name: String(row.name),
    category: category === "overdel" || category === "underdel" || category === "heldragt" || category === "ytterplagg" || category === "skor" || category === "accessoar" ? category : "overdel",
    subcategory: String(row.subcategory),
    color: row.color as Garment["color"],
    patterned: Boolean(row.patterned),
    material: typeof row.material === "string" ? row.material : "",
    brand: typeof row.brand === "string" ? row.brand : "",
    seasons: seasons.length > 0 ? seasons : ["alla"],
    formality: formality === "ledig" || formality === "vardag" || formality === "smart" || formality === "formell" ? formality : "vardag",
    silhouette: silhouette === "tajt" || silhouette === "normal" || silhouette === "los" ? silhouette : "normal",
    condition: condition === "ny" || condition === "bra" || condition === "sliten" ? condition : "bra",
    favorite: Boolean(row.favorite),
    inRotation: row.in_rotation !== false && row.in_rotation !== "f",
    source: row.source === "example" ? "example" : "own",
    priceSek: asInt(row.price_sek),
    fitNote: typeof row.fit_note === "string" ? row.fit_note : "",
    notes: typeof row.notes === "string" ? row.notes : "",
    photoMime: typeof row.photo_mime === "string" ? row.photo_mime : null,
    photoData: typeof row.photo_data === "string" ? row.photo_data : null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at ?? ""),
  };
}

export async function getProfile(owner: string): Promise<Profile> {
  const rows = await sql<Row>("select * from profiles where owner = $1", [owner]);
  return mapProfile(rows[0]);
}

export async function saveProfile(owner: string, profile: Profile): Promise<Profile> {
  const rows = await sql<Row>(
    `insert into profiles (
      owner, size_system, fit, height_cm, chest_cm, waist_cm, hips_cm, shoulder_cm, inseam_cm, sleeve_cm, neck_cm, shoe_eu, notes, updated_at
    ) values (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now()
    )
    on conflict (owner) do update set
      size_system = excluded.size_system,
      fit = excluded.fit,
      height_cm = excluded.height_cm,
      chest_cm = excluded.chest_cm,
      waist_cm = excluded.waist_cm,
      hips_cm = excluded.hips_cm,
      shoulder_cm = excluded.shoulder_cm,
      inseam_cm = excluded.inseam_cm,
      sleeve_cm = excluded.sleeve_cm,
      neck_cm = excluded.neck_cm,
      shoe_eu = excluded.shoe_eu,
      notes = excluded.notes,
      updated_at = now()
    returning *`,
    [
      owner,
      profile.sizeSystem,
      profile.fit,
      profile.heightCm,
      profile.chestCm,
      profile.waistCm,
      profile.hipsCm,
      profile.shoulderCm,
      profile.inseamCm,
      profile.sleeveCm,
      profile.neckCm,
      profile.shoeEu,
      profile.notes,
    ],
  );
  return mapProfile(rows[0]);
}

export async function getStyle(owner: string): Promise<StyleProfile> {
  const rows = await sql<Row>("select * from style_profiles where owner = $1", [owner]);
  return mapStyle(rows[0]);
}

export async function saveStyle(owner: string, style: StyleProfile): Promise<StyleProfile> {
  const rows = await sql<Row>(
    `insert into style_profiles (owner, aesthetics, palette, avoid, month_budget_sek, item_budget_sek, notes, updated_at)
     values ($1, $2::jsonb, $3::jsonb, $4::jsonb, $5, $6, $7, now())
     on conflict (owner) do update set
       aesthetics = excluded.aesthetics,
       palette = excluded.palette,
       avoid = excluded.avoid,
       month_budget_sek = excluded.month_budget_sek,
       item_budget_sek = excluded.item_budget_sek,
       notes = excluded.notes,
       updated_at = now()
     returning *`,
    [
      owner,
      JSON.stringify(style.aesthetics),
      JSON.stringify(style.palette),
      JSON.stringify(style.avoid),
      style.monthBudgetSek,
      style.itemBudgetSek,
      style.notes,
    ],
  );
  return mapStyle(rows[0]);
}

export async function listStyleImages(owner: string): Promise<StyleImage[]> {
  const rows = await sql<Row>(
    "select id, kind, caption, mime, data, created_at from style_images where owner = $1 order by created_at desc",
    [owner],
  );
  return rows.map((row) => ({
    id: String(row.id),
    kind: row.kind === "budget" ? "budget" : "stil",
    caption: typeof row.caption === "string" ? row.caption : "",
    mime: String(row.mime),
    data: String(row.data),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at ?? ""),
  }));
}

export async function countStyleImages(owner: string): Promise<number> {
  const rows = await sql<{ count: string | number }>("select count(*)::int as count from style_images where owner = $1", [owner]);
  return Number(rows[0]?.count ?? 0);
}

export async function addStyleImage(owner: string, image: { id: string; kind: "stil" | "budget"; caption: string; mime: string; data: string }): Promise<void> {
  await sql(
    "insert into style_images (owner, id, kind, caption, mime, data) values ($1, $2, $3, $4, $5, $6)",
    [owner, image.id, image.kind, image.caption, image.mime, image.data],
  );
}

export async function updateStyleImageCaption(owner: string, id: string, caption: string): Promise<boolean> {
  const rows = await sql("update style_images set caption = $3 where owner = $1 and id = $2 returning id", [owner, id, caption]);
  return rows.length > 0;
}

export async function deleteStyleImage(owner: string, id: string): Promise<boolean> {
  const rows = await sql("delete from style_images where owner = $1 and id = $2 returning id", [owner, id]);
  return rows.length > 0;
}

export async function listGarments(owner: string): Promise<Garment[]> {
  const rows = await sql<Row>(
    "select * from garments where owner = $1 order by favorite desc, created_at desc",
    [owner],
  );
  return rows.map(mapGarment);
}

export async function countGarments(owner: string): Promise<number> {
  const rows = await sql<{ count: string | number }>("select count(*)::int as count from garments where owner = $1", [owner]);
  return Number(rows[0]?.count ?? 0);
}

export async function insertGarment(owner: string, id: string, input: GarmentInput, source: "own" | "example"): Promise<Garment> {
  const rows = await sql<Row>(
    `insert into garments (
      owner, id, name, category, subcategory, color, patterned, material, brand, seasons, formality, silhouette,
      condition, price_sek, fit_note, notes, favorite, in_rotation, source, photo_mime, photo_data
    ) values (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12,
      $13, $14, $15, $16, $17, $18, $19, $20, $21
    ) returning *`,
    [
      owner,
      id,
      input.name,
      input.category,
      input.subcategory,
      input.color,
      input.patterned,
      input.material,
      input.brand,
      JSON.stringify(input.seasons),
      input.formality,
      input.silhouette,
      input.condition,
      input.priceSek,
      input.fitNote,
      input.notes,
      input.favorite,
      input.inRotation,
      source,
      input.photo?.mime ?? null,
      input.photo?.data ?? null,
    ],
  );
  return mapGarment(rows[0]);
}

export async function updateGarment(owner: string, id: string, input: GarmentInput): Promise<Garment | null> {
  const current = await sql<Row>("select photo_mime, photo_data, source from garments where owner = $1 and id = $2", [owner, id]);
  if (current.length === 0) return null;
  const keepMime = input.photo ? input.photo.mime : input.clearPhoto ? null : (typeof current[0].photo_mime === "string" ? current[0].photo_mime : null);
  const keepData = input.photo ? input.photo.data : input.clearPhoto ? null : (typeof current[0].photo_data === "string" ? current[0].photo_data : null);
  const rows = await sql<Row>(
    `update garments set
      name = $3, category = $4, subcategory = $5, color = $6, patterned = $7, material = $8, brand = $9,
      seasons = $10::jsonb, formality = $11, silhouette = $12, condition = $13, price_sek = $14, fit_note = $15,
      notes = $16, favorite = $17, in_rotation = $18, photo_mime = $19, photo_data = $20
     where owner = $1 and id = $2
     returning *`,
    [
      owner,
      id,
      input.name,
      input.category,
      input.subcategory,
      input.color,
      input.patterned,
      input.material,
      input.brand,
      JSON.stringify(input.seasons),
      input.formality,
      input.silhouette,
      input.condition,
      input.priceSek,
      input.fitNote,
      input.notes,
      input.favorite,
      input.inRotation,
      keepMime,
      keepData,
    ],
  );
  return rows[0] ? mapGarment(rows[0]) : null;
}

async function detach(owner: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const doomed = new Set(ids);
  const outfits = await listOutfits(owner);
  for (const outfit of outfits) {
    const next = outfit.pieceIds.filter((id) => !doomed.has(id));
    if (next.length === outfit.pieceIds.length) continue;
    if (next.length === 0) {
      await sql("delete from outfits where owner = $1 and id = $2", [owner, outfit.id]);
    } else {
      await sql("update outfits set piece_ids = $3::jsonb where owner = $1 and id = $2", [owner, outfit.id, JSON.stringify(next)]);
    }
  }
}

export async function deleteGarment(owner: string, id: string): Promise<boolean> {
  await detach(owner, [id]);
  const rows = await sql("delete from garments where owner = $1 and id = $2 returning id", [owner, id]);
  return rows.length > 0;
}

export async function insertExamples(owner: string): Promise<number> {
  let added = 0;
  for (const piece of EXAMPLE_PIECES) {
    const existing = await sql("select id from garments where owner = $1 and id = $2", [owner, piece.id]);
    if (existing.length > 0) continue;
    await insertGarment(
      owner,
      piece.id,
      {
        name: piece.name,
        category: piece.category,
        subcategory: piece.subcategory,
        color: piece.color,
        patterned: piece.patterned,
        material: piece.material,
        brand: piece.brand,
        seasons: piece.seasons,
        formality: piece.formality,
        silhouette: piece.silhouette,
        condition: piece.condition,
        priceSek: null,
        fitNote: "",
        notes: "",
        favorite: piece.favorite,
        inRotation: true,
        photo: null,
        clearPhoto: true,
      },
      "example",
    );
    added += 1;
  }
  return added;
}

export async function deleteExamples(owner: string): Promise<number> {
  const rows = await sql<{ id: string }>("select id from garments where owner = $1 and source = 'example'", [owner]);
  const ids = rows.map((row) => String(row.id));
  await detach(owner, ids);
  const deleted = await sql("delete from garments where owner = $1 and source = 'example' returning id", [owner]);
  return deleted.length;
}

export async function listOutfits(owner: string): Promise<SavedOutfit[]> {
  const rows = await sql<Row>("select * from outfits where owner = $1 order by created_at desc", [owner]);
  return rows.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    occasion: (row.occasion === "ledig" || row.occasion === "vardag" || row.occasion === "kontor" || row.occasion === "kvall" ? row.occasion : "vardag"),
    why: typeof row.why === "string" ? row.why : "",
    pieceIds: asStrings(row.piece_ids),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at ?? ""),
  }));
}

export async function countOutfits(owner: string): Promise<number> {
  const rows = await sql<{ count: string | number }>("select count(*)::int as count from outfits where owner = $1", [owner]);
  return Number(rows[0]?.count ?? 0);
}

export async function insertOutfit(owner: string, outfit: { id: string; title: string; occasion: string; why: string; pieceIds: string[] }): Promise<void> {
  await sql(
    "insert into outfits (owner, id, title, occasion, why, piece_ids) values ($1, $2, $3, $4, $5, $6::jsonb)",
    [owner, outfit.id, outfit.title, outfit.occasion, outfit.why, JSON.stringify(outfit.pieceIds)],
  );
}

export async function deleteOutfit(owner: string, id: string): Promise<boolean> {
  const rows = await sql("delete from outfits where owner = $1 and id = $2 returning id", [owner, id]);
  return rows.length > 0;
}

export async function listWishes(owner: string): Promise<Wish[]> {
  const rows = await sql<Row>("select * from wishes where owner = $1 order by created_at desc", [owner]);
  return rows.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    brand: typeof row.brand === "string" ? row.brand : "",
    reason: typeof row.reason === "string" ? row.reason : "",
    priceHint: typeof row.price_hint === "string" ? row.price_hint : "",
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at ?? ""),
  }));
}

export async function countWishes(owner: string): Promise<number> {
  const rows = await sql<{ count: string | number }>("select count(*)::int as count from wishes where owner = $1", [owner]);
  return Number(rows[0]?.count ?? 0);
}

export async function insertWish(owner: string, wish: { id: string; title: string; brand: string; reason: string; priceHint: string }): Promise<void> {
  await sql(
    "insert into wishes (owner, id, title, brand, reason, price_hint) values ($1, $2, $3, $4, $5, $6)",
    [owner, wish.id, wish.title, wish.brand, wish.reason, wish.priceHint],
  );
}

export async function deleteWish(owner: string, id: string): Promise<boolean> {
  const rows = await sql("delete from wishes where owner = $1 and id = $2 returning id", [owner, id]);
  return rows.length > 0;
}

export async function resetOwner(owner: string): Promise<void> {
  await sql("delete from wishes where owner = $1", [owner]);
  await sql("delete from outfits where owner = $1", [owner]);
  await sql("delete from garments where owner = $1", [owner]);
  await sql("delete from style_images where owner = $1", [owner]);
  await sql("delete from style_profiles where owner = $1", [owner]);
  await sql("delete from profiles where owner = $1", [owner]);
}
