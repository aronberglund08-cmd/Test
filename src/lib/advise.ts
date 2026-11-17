import { BRANDS, ESSENTIALS, type Brand, type Essential } from "./catalog";
import { formatSek, type Aesthetic, type Piece, type SizeSystem } from "./domain";
import { seasonsForMonth } from "./time";

export type GapState = "missing" | "worn" | "example";

export type Gap = {
  id: string;
  title: string;
  detail: string;
  priority: number;
  priceMin: number;
  priceMax: number;
  priceLabel: string;
  state: GapState;
  brands: string[];
  category: Essential["category"];
};

export type Advice = {
  gaps: Gap[];
  brands: Brand[];
  note: string;
  pace: string;
};

function serves(brand: Brand, system: SizeSystem): boolean {
  if (system === "unisex") return true;
  return brand.systems.includes(system) || brand.systems.includes("unisex");
}

function withinBudget(brand: Brand, budget: number | null): boolean {
  if (budget === null) return true;
  return brand.sweet <= Math.max(budget * 1.25, budget + 400);
}

function brandScore(brand: Brand, aesthetics: Aesthetic[], budget: number | null): number {
  let score = 0;
  if (aesthetics.length === 0) {
    if (brand.aesthetics.includes("minimal") || brand.aesthetics.includes("klassisk")) score += 2;
  } else {
    score += brand.aesthetics.filter((item) => aesthetics.includes(item)).length * 5;
  }
  const anchor = budget !== null && budget > 0 ? budget : 1600;
  score -= Math.abs(brand.sweet - anchor) / anchor;
  score += Math.min(brand.categories.length, 4) * 0.08;
  return score;
}

function systemOk(essential: Essential, system: SizeSystem): boolean {
  if (system === "unisex") return true;
  return essential.systems.includes(system);
}

function relevantEssential(essential: Essential, aesthetics: Aesthetic[], system: SizeSystem, month: number, avoid: Set<string>): boolean {
  if (!systemOk(essential, system)) return false;
  if (aesthetics.length > 0 && essential.aesthetics.length > 0 && !essential.aesthetics.some((item) => aesthetics.includes(item))) {
    return false;
  }
  if (aesthetics.length === 0 && essential.aesthetics.length > 0 && essential.priority > 1) return false;
  const season = seasonsForMonth(month);
  if (!essential.seasons.includes("alla") && !essential.seasons.some((item) => season.includes(item))) return false;
  if (essential.colors.length > 0 && essential.colors.every((color) => avoid.has(color))) return false;
  return true;
}

function matches(piece: Piece, essential: Essential): boolean {
  if (!essential.subcategories.includes(piece.subcategory)) return false;
  if (essential.colors.length > 0 && !essential.colors.includes(piece.color)) return false;
  return true;
}

export function advise(input: {
  pieces: Piece[];
  aesthetics: Aesthetic[];
  system: SizeSystem;
  avoid?: readonly string[];
  itemBudget: number | null;
  monthBudget: number | null;
  month: number;
}): Advice {
  const avoid = new Set(input.avoid ?? []);
  const effectiveItem = input.itemBudget ?? input.monthBudget;
  const eligible = BRANDS.filter((brand) => serves(brand, input.system) && withinBudget(brand, effectiveItem));
  const strict = eligible.filter(
    (brand) => input.aesthetics.length === 0 || brand.aesthetics.some((item) => input.aesthetics.includes(item)),
  );
  const pool = strict.length >= 3
    ? strict
    : BRANDS.filter((brand) => serves(brand, input.system)).filter(
        (brand) =>
          input.aesthetics.length === 0 ||
          brand.aesthetics.some((item) => input.aesthetics.includes(item) || item === "minimal" || item === "klassisk"),
      );
  const ranked = [...pool].sort(
    (a, b) => brandScore(b, input.aesthetics, effectiveItem) - brandScore(a, input.aesthetics, effectiveItem) || a.name.localeCompare(b.name, "sv"),
  );
  const brands = ranked.slice(0, 7);

  const gaps: Gap[] = [];
  for (const essential of ESSENTIALS) {
    if (!relevantEssential(essential, input.aesthetics, input.system, input.month, avoid)) continue;
    const hits = input.pieces.filter((piece) => piece.inRotation && matches(piece, essential));
    const own = hits.filter((piece) => piece.source !== "example" && piece.condition !== "sliten");
    if (own.length > 0) continue;
    const worn = hits.filter((piece) => piece.source !== "example" && piece.condition === "sliten");
    const example = hits.filter((piece) => piece.source === "example");
    const state: GapState = worn.length > 0 ? "worn" : example.length > 0 ? "example" : "missing";
    const max = effectiveItem ? Math.min(essential.priceMax, Math.round(effectiveItem)) : essential.priceMax;
    const min = Math.min(essential.priceMin, max);
    const names = ranked.filter((brand) => brand.categories.includes(essential.category)).slice(0, 2).map((brand) => brand.name);
    let detail = essential.detail;
    if (state === "worn") detail = `Du har en, men den är sliten. Ersätt den innan du köper fler nyheter. ${essential.detail}`;
    if (state === "example") detail = `Just nu täcks det bara av ett exempelplagg. ${essential.detail}`;
    if (effectiveItem && effectiveItem < essential.priceMin) {
      detail += " Det ligger oftast över taket du satt. Vänta på rea eller ta en enklare variant.";
    }
    gaps.push({
      id: essential.id,
      title: essential.title,
      detail,
      priority: essential.priority,
      priceMin: min,
      priceMax: max,
      priceLabel: `${formatSek(min)}–${formatSek(max)}`,
      state,
      brands: names,
      category: essential.category,
    });
  }
  gaps.sort((a, b) => a.priority - b.priority || (a.state === "missing" ? 0 : 1) - (b.state === "missing" ? 0 : 1));

  let note = "";
  if (input.aesthetics.includes("sportig")) {
    note = "Sportplagg hålls utanför kontorslooks. För träning: ett märke med återhållen färg, till exempel svart bas från Adidas eller Aim'n, och låt den inte styra resten.";
  } else if (input.aesthetics.length === 0) {
    note = "Utan vald stil prioriteras lugna basmärken. Välj en eller två riktningar under Profil så blir listan snävare.";
  } else if (brands.length < 3) {
    note = "Få märken träffar både stil och tak. Listan visar de närmaste, även om något plagg kan ligga i överkant.";
  }
  if (!input.itemBudget && input.monthBudget) {
    note = `${note} Du har en månadsbudget men inget tak per plagg. Märkena är sållade som om ett plagg får kosta ungefär en månadsbudget.`.trim();
  }

  let pace = "";
  if (input.monthBudget && effectiveItem && effectiveItem > 0) {
    const count = Math.max(1, Math.floor(input.monthBudget / effectiveItem));
    pace = `Med ${formatSek(input.monthBudget)} i månaden blir det ungefär ${count} plagg i din prisklass. Köp det som saknas först.`;
  }

  return { gaps, brands, note, pace };
}
