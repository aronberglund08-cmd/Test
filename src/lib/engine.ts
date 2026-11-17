import { colorGroup, colorLabel, type Fit, type Occasion, type Piece, type Season } from "./domain";
import { seasonsForMonth } from "./time";

export type Slot = "base" | "mid" | "bottom" | "dress" | "outer" | "shoes" | "belt";

export type LookPiece = Piece & { slot: Slot };

export type Look = {
  title: string;
  why: string;
  occasion: Occasion;
  score: number;
  pieces: LookPiece[];
};

export type SuggestResult = {
  looks: Look[];
  missing: string[];
  note: string;
};

const FORMALITY_RANK = { ledig: 0, vardag: 1, smart: 2, formell: 3 } as const;

const OCCASION_RANGE: Record<Occasion, { min: number; max: number }> = {
  ledig: { min: 0, max: 1 },
  vardag: { min: 0, max: 2 },
  kontor: { min: 1, max: 2 },
  kvall: { min: 2, max: 3 },
};

const DISPLAY_ORDER: Slot[] = ["base", "mid", "bottom", "dress", "outer", "shoes", "belt"];

function roles(piece: Piece): Array<Exclude<Slot, "belt"> | "belt"> {
  switch (piece.category) {
    case "skor":
      return ["shoes"];
    case "underdel":
      return ["bottom"];
    case "heldragt":
      return ["dress"];
    case "ytterplagg":
      return ["outer"];
    case "accessoar":
      return piece.subcategory === "skarp" ? ["belt"] : [];
    case "overdel":
      if (piece.subcategory === "stickad" || piece.subcategory === "hoodie" || piece.subcategory === "kofta") {
        return ["base", "mid"];
      }
      return ["base"];
    default:
      return [];
  }
}

function inSeason(piece: Piece, allowed: Season[]): boolean {
  return piece.seasons.includes("alla") || piece.seasons.some((season) => allowed.includes(season));
}

function cap(list: Piece[], count = 12): Piece[] {
  return [...list.filter((piece) => piece.favorite), ...list.filter((piece) => !piece.favorite)].slice(0, count);
}

function colorScore(parts: LookPiece[]): number | null {
  const groups = parts.filter((part) => part.slot !== "belt").map((part) => colorGroup(part.color));
  const accents = groups.filter((group) => group === "warm" || group === "cool" || group === "vivid");
  const vivids = groups.filter((group) => group === "vivid");
  if (vivids.length > 1) return null;
  if (accents.length > 2) return null;
  if (accents.length === 2 && (accents[0] !== accents[1] || accents[0] === "vivid")) return null;
  let score = accents.length === 0 ? 8 : accents.length === 1 ? 10 : 6;
  const colors = new Set(parts.map((part) => part.color));
  if (colors.has("svart") && colors.has("marin")) score -= 2;
  if (colors.has("svart") && colors.has("brun")) score -= 1;
  if (groups.includes("denim") && accents.length <= 1) score += 1;
  return score;
}

function silhouetteScore(parts: LookPiece[]): number {
  const top = parts.find((part) => part.slot === "mid") ?? parts.find((part) => part.slot === "base");
  const bottom = parts.find((part) => part.slot === "bottom");
  if (!top || !bottom) return 0;
  const looseTop = top.silhouette === "los";
  const looseBottom = bottom.silhouette === "los";
  if (looseTop !== looseBottom) return 2;
  if (!looseTop && !looseBottom) return 1;
  return -1;
}

function outerBonus(outer: Piece, occasion: Occasion, month: number): number {
  const cold = month === 11 || month === 12 || month === 1 || month === 2;
  const shoulder = month === 3 || month === 10;
  const blazer = outer.subcategory === "blazer";
  if (occasion === "kontor") return blazer ? 5 : 1;
  if (occasion === "kvall") return blazer ? 3 : 2;
  if ((cold || shoulder) && !blazer) return 4;
  if ((cold || shoulder) && blazer) return 1;
  if (blazer && (occasion === "ledig" || occasion === "vardag")) return -1;
  if (outer.subcategory === "dunjacka" && !cold) return -3;
  return 0;
}

function coreOk(parts: LookPiece[], occasion: Occasion): boolean {
  const range = OCCASION_RANGE[occasion];
  const ranks = parts
    .filter((part) => part.slot !== "belt" && part.slot !== "outer")
    .map((part) => FORMALITY_RANK[part.formality]);
  if (ranks.length === 0) return false;
  if (ranks.some((rank) => rank < range.min || rank > range.max)) return false;
  return Math.max(...ranks) - Math.min(...ranks) <= 1;
}

function outerOk(outer: Piece, occasion: Occasion): boolean {
  const range = OCCASION_RANGE[occasion];
  const rank = FORMALITY_RANK[outer.formality];
  return rank >= range.min && rank <= range.max + 1;
}

function orderPieces(parts: LookPiece[]): LookPiece[] {
  return [...parts].sort((a, b) => DISPLAY_ORDER.indexOf(a.slot) - DISPLAY_ORDER.indexOf(b.slot));
}

function titleFor(parts: LookPiece[]): string {
  const ordered = orderPieces(parts).filter((part) => part.slot !== "belt" && part.slot !== "shoes");
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const part of ordered) {
    if (seen.has(part.color)) continue;
    seen.add(part.color);
    labels.push(part.color);
  }
  const accent = labels.find((color) => {
    const group = colorGroup(color);
    return group === "warm" || group === "cool" || group === "vivid";
  });
  const neutral = labels.find((color) => {
    const group = colorGroup(color);
    return group === "neutral" || group === "denim";
  });
  if (accent && neutral) return `${colorLabel(accent)} mot ${colorLabel(neutral).toLowerCase()}`;
  if (labels.length >= 2) return `${colorLabel(labels[0])} och ${colorLabel(labels[1]).toLowerCase()}`;
  if (labels[0]) return colorLabel(labels[0]);
  return "En samlad look";
}

function explain(parts: LookPiece[], month: number): string {
  const ordered = parts.filter((part) => part.slot !== "belt");
  const accents = ordered.filter((part) => {
    const group = colorGroup(part.color);
    return group === "warm" || group === "cool" || group === "vivid";
  });
  const sentences: string[] = [];
  if (accents.length === 0) {
    sentences.push("Allt är neutralt, så looken håller ihop utan att du behöver tänka på färg.");
  } else if (new Set(accents.map((part) => part.color)).size === 1) {
    sentences.push(`${colorLabel(accents[0].color)} får vara den enda färgen. Resten bär den.`);
  } else {
    sentences.push("Två besläktade färger, inga fler.");
  }
  const top = ordered.find((part) => part.slot === "mid") ?? ordered.find((part) => part.slot === "base");
  const bottom = ordered.find((part) => part.slot === "bottom");
  if (top && bottom && (top.silhouette === "los") !== (bottom.silhouette === "los")) {
    sentences.push("Lösare och rakare plagg balanserar varandra.");
  } else if ((month === 11 || month === 12 || month === 1 || month === 2) && ordered.some((part) => part.material === "ull")) {
    sentences.push("Ull hör hemma i kylan.");
  }
  return sentences.slice(0, 2).join(" ");
}

function matchingBelt(parts: LookPiece[], belts: Piece[]): Piece | null {
  if (!parts.some((part) => part.slot === "bottom")) return null;
  const shoes = parts.find((part) => part.slot === "shoes");
  if (!shoes) return null;
  const dark = shoes.color === "svart" || shoes.color === "gra" || shoes.color === "marin";
  const warm = shoes.color === "brun" || shoes.color === "cognac" || shoes.color === "kamel";
  if (!dark && !warm) return null;
  const wanted = dark ? new Set(["svart"]) : new Set(["brun", "cognac", "kamel"]);
  return belts.find((belt) => wanted.has(belt.color)) ?? null;
}

function diversify(drafts: Look[], limit: number): Look[] {
  const sorted = [...drafts].sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "sv"));
  const picked: Look[] = [];
  const seen = new Set<string>();
  const coreKey = (look: Look) =>
    look.pieces
      .filter((part) => part.slot === "base" || part.slot === "mid" || part.slot === "bottom" || part.slot === "dress")
      .map((part) => part.id)
      .sort()
      .join(",");
  for (const look of sorted) {
    const key = coreKey(look);
    if (seen.has(key)) continue;
    const ids = new Set(
      look.pieces.filter((part) => part.slot !== "shoes" && part.slot !== "belt" && part.slot !== "outer").map((part) => part.id),
    );
    const similar = picked.some((existing) => {
      const overlap = existing.pieces.filter((part) => ids.has(part.id)).length;
      return overlap >= 2;
    });
    if (similar) continue;
    picked.push(look);
    seen.add(key);
    if (picked.length >= limit) break;
  }
  if (picked.length < limit) {
    for (const look of sorted) {
      if (picked.includes(look)) continue;
      picked.push(look);
      if (picked.length >= limit) break;
    }
  }
  return picked;
}

export function suggestLooks(input: {
  pieces: Piece[];
  occasion: Occasion;
  month: number;
  avoid?: readonly string[];
  prefer?: readonly string[];
  anchorId?: string;
  fit?: Fit | null;
  limit?: number;
}): SuggestResult {
  const avoid = new Set(input.avoid ?? []);
  const prefer = new Set(input.prefer ?? []);
  const season = seasonsForMonth(input.month);
  const usable = input.pieces.filter(
    (piece) => piece.inRotation && !avoid.has(piece.color) && inSeason(piece, season),
  );
  const anchor = input.anchorId ? input.pieces.find((piece) => piece.id === input.anchorId) : undefined;
  let note = "";
  if (input.anchorId && !anchor) note = "Plagget finns inte.";
  else if (anchor && !usable.some((piece) => piece.id === anchor.id)) {
    note = "Plagget är avstängt, fel säsong för månaden, eller en färg du vill undvika.";
  }

  const pool = {
    bases: usable.filter((piece) => roles(piece).includes("base")),
    mids: usable.filter((piece) => roles(piece).includes("mid")),
    bottoms: usable.filter((piece) => roles(piece).includes("bottom")),
    dresses: usable.filter((piece) => roles(piece).includes("dress")),
    outers: usable.filter((piece) => roles(piece).includes("outer")),
    shoes: usable.filter((piece) => roles(piece).includes("shoes")),
    belts: usable.filter((piece) => roles(piece).includes("belt")),
  };

  const missing: string[] = [];
  if (pool.shoes.length === 0) missing.push("ett par skor");
  if (pool.bases.length === 0 && pool.mids.length === 0 && pool.dresses.length === 0) {
    missing.push("en överdel eller en klänning");
  }
  if (pool.bottoms.length === 0 && pool.dresses.length === 0) missing.push("en underdel eller en klänning");

  const drafts = new Map<string, Look>();
  let evaluations = 0;

  function push(parts: LookPiece[]) {
    if (evaluations > 6000) return;
    evaluations += 1;
    if (input.anchorId && !parts.some((part) => part.id === input.anchorId)) return;
    if (!coreOk(parts, input.occasion)) return;
    const outer = parts.find((part) => part.slot === "outer");
    if (outer && !outerOk(outer, input.occasion)) return;
    const basePiece = parts.find((part) => part.slot === "base");
    if (outer?.subcategory === "blazer" && basePiece && ["overshirt", "hoodie", "kofta"].includes(basePiece.subcategory)) return;
    if (parts.filter((part) => part.patterned && part.slot !== "belt").length > 1) return;
    const colors = colorScore(parts);
    if (colors === null) return;
    const belt = matchingBelt(parts, pool.belts);
    const withBelt = belt ? [...parts, { ...belt, slot: "belt" as const }] : parts;
    const ordered = orderPieces(withBelt);
    let score = colors + silhouetteScore(ordered);
    const coreRanks = ordered
      .filter((part) => part.slot !== "belt" && part.slot !== "outer")
      .map((part) => FORMALITY_RANK[part.formality]);
    if (coreRanks.length > 0 && Math.max(...coreRanks) - Math.min(...coreRanks) === 0) score += 2;
    if (outer) score += outerBonus(outer, input.occasion, input.month);
    const favoriteBonus = ordered.filter((part) => part.favorite).length * 2;
    score += Math.min(4, favoriteBonus);
    if (ordered.some((part) => prefer.has(part.color))) score += 2;
    if (input.fit && ordered.some((part) => (part.slot === "base" || part.slot === "bottom") && part.silhouette === input.fit)) {
      score += 1;
    }
    const cold = input.month === 11 || input.month === 12 || input.month === 1 || input.month === 2;
    if (cold && ordered.some((part) => part.material === "ull")) score += 1;
    if (!cold && ordered.some((part) => part.material === "linne" && part.slot !== "outer")) score += 1;
    if (input.occasion === "kontor" || input.occasion === "kvall") {
      const accentCount = ordered.filter((part) => {
        const group = colorGroup(part.color);
        return group === "warm" || group === "cool" || group === "vivid";
      }).length;
      if (accentCount === 0) score += 3;
      const shoes = ordered.find((part) => part.slot === "shoes");
      if (shoes && (shoes.subcategory === "loafers" || shoes.subcategory === "boots" || shoes.subcategory === "klackar")) score += 2;
      const bottom = ordered.find((part) => part.slot === "bottom");
      if (
        basePiece &&
        ["skjorta", "blus", "polo"].includes(basePiece.subcategory) &&
        bottom &&
        ["chinos", "kostymbyxor", "kjol"].includes(bottom.subcategory)
      ) {
        score += 5;
      }
    }
    const look: Look = {
      title: titleFor(ordered),
      why: explain(ordered, input.month),
      occasion: input.occasion,
      score,
      pieces: ordered,
    };
    const key = ordered.map((part) => part.id).sort().join(",");
    const previous = drafts.get(key);
    if (!previous || previous.score < look.score) drafts.set(key, look);
  }

  function withOuters(parts: LookPiece[]) {
    push(parts);
    for (const outer of cap(pool.outers, 8)) {
      if (parts.some((part) => part.id === outer.id)) continue;
      push([...parts, { ...outer, slot: "outer" }]);
    }
  }

  const bases = cap(pool.bases);
  const mids = cap(pool.mids);
  const bottoms = cap(pool.bottoms);
  const shoes = cap(pool.shoes);
  const dresses = cap(pool.dresses);

  for (const bottom of bottoms) {
    for (const shoe of shoes) {
      for (const base of bases) {
        withOuters([
          { ...base, slot: "base" },
          { ...bottom, slot: "bottom" },
          { ...shoe, slot: "shoes" },
        ]);
        for (const mid of mids) {
          if (mid.id === base.id) continue;
          if (base.subcategory === "stickad" && mid.subcategory === "stickad") continue;
          withOuters([
            { ...base, slot: "base" },
            { ...mid, slot: "mid" },
            { ...bottom, slot: "bottom" },
            { ...shoe, slot: "shoes" },
          ]);
        }
      }
      for (const mid of mids) {
        withOuters([
          { ...mid, slot: "base" },
          { ...bottom, slot: "bottom" },
          { ...shoe, slot: "shoes" },
        ]);
      }
    }
  }

  for (const dress of dresses) {
    for (const shoe of shoes) {
      withOuters([
        { ...dress, slot: "dress" },
        { ...shoe, slot: "shoes" },
      ]);
    }
  }

  return {
    looks: diversify([...drafts.values()], input.limit ?? 8),
    missing,
    note,
  };
}
