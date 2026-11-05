import { BRANDS, type Brand } from "./catalog";
import type { Category, Profile, SizeSystem } from "./domain";

export type SizeKind = "top" | "bottom" | "shoe" | "note";

export type SizeLine = {
  kind: SizeKind;
  text: string;
};

export type BrandSize = {
  brand: string;
  lines: SizeLine[];
};

type PointRow = { label: string; chest?: number; waist?: number; hip?: number };
type RangeRow = { label: string; chest?: [number, number]; waist?: [number, number]; hip?: [number, number] };

type Chart = {
  brand: string;
  system: "dam" | "herr";
  points?: PointRow[];
  ranges?: RangeRow[];
  inseam?: number;
  caution?: string;
};

const COS_WOMEN: PointRow[] = [
  { label: "EU 32", chest: 77, waist: 63, hip: 84 },
  { label: "EU 34", chest: 80, waist: 65, hip: 88 },
  { label: "EU 36", chest: 84, waist: 68, hip: 92 },
  { label: "EU 38", chest: 88, waist: 72, hip: 96 },
  { label: "EU 40", chest: 92, waist: 76, hip: 99 },
  { label: "EU 42", chest: 96, waist: 80, hip: 102 },
  { label: "EU 44", chest: 100, waist: 85, hip: 105 },
  { label: "EU 46", chest: 104, waist: 90, hip: 108 },
  { label: "EU 48", chest: 110, waist: 96, hip: 113 },
];

const COS_MEN: PointRow[] = [
  { label: "EU 42", chest: 84, waist: 72, hip: 86 },
  { label: "EU 44", chest: 88, waist: 76, hip: 90 },
  { label: "EU 46", chest: 92, waist: 80, hip: 94 },
  { label: "EU 48", chest: 96, waist: 84, hip: 98 },
  { label: "EU 50", chest: 100, waist: 88, hip: 102 },
  { label: "EU 52", chest: 104, waist: 92, hip: 106 },
  { label: "EU 54", chest: 108, waist: 96, hip: 110 },
  { label: "EU 56", chest: 112, waist: 100, hip: 114 },
  { label: "EU 58", chest: 116, waist: 104, hip: 118 },
];

const STORIES: PointRow[] = [
  { label: "EU 32", chest: 76, waist: 60, hip: 84 },
  { label: "EU 34", chest: 80, waist: 64, hip: 88 },
  { label: "EU 36", chest: 84, waist: 68, hip: 92 },
  { label: "EU 38", chest: 88, waist: 72, hip: 96 },
  { label: "EU 40", chest: 92, waist: 76, hip: 100 },
  { label: "EU 42", chest: 96, waist: 80, hip: 104 },
  { label: "EU 44", chest: 100, waist: 84, hip: 108 },
];

const CHARTS: Chart[] = [
  { brand: "COS", system: "dam", points: COS_WOMEN, inseam: 78 },
  { brand: "COS", system: "herr", points: COS_MEN },
  {
    brand: "Arket",
    system: "dam",
    ranges: [
      { label: "XS (EU 32–34)", chest: [76, 80], waist: [60, 64], hip: [84, 88] },
      { label: "S (EU 36–38)", chest: [84, 88], waist: [68, 72], hip: [92, 96] },
      { label: "M (EU 40–42)", chest: [92, 96], waist: [76, 80], hip: [100, 104] },
      { label: "L (EU 44–46)", chest: [100, 104], waist: [84, 88], hip: [108, 112] },
    ],
  },
  {
    brand: "Arket",
    system: "herr",
    ranges: [
      { label: "XS (EU 42)", chest: [84, 84], waist: [72, 72], hip: [90, 90] },
      { label: "S (EU 44–46)", chest: [88, 92], waist: [76, 80], hip: [93, 96] },
      { label: "M (EU 48–50)", chest: [96, 100], waist: [84, 88], hip: [99, 102] },
      { label: "L (EU 52–54)", chest: [104, 108], waist: [92, 96], hip: [105, 108] },
      { label: "XL (EU 56–58)", chest: [112, 116], waist: [100, 104], hip: [111, 114] },
      { label: "XXL (EU 60–62)", chest: [120, 124], waist: [108, 112] },
    ],
  },
  { brand: "& Other Stories", system: "dam", points: STORIES, inseam: 79 },
  {
    brand: "Filippa K",
    system: "dam",
    ranges: [
      { label: "EU 34", chest: [73, 78], waist: [58, 63], hip: [85, 93] },
      { label: "EU 36", chest: [79, 84], waist: [64, 69], hip: [94, 98] },
      { label: "EU 38", chest: [85, 90], waist: [70, 75], hip: [99, 103] },
      { label: "EU 40", chest: [91, 96], waist: [76, 81], hip: [104, 109] },
      { label: "EU 42", chest: [97, 102], waist: [82, 87], hip: [110, 115] },
      { label: "EU 44", chest: [103, 108], waist: [88, 93], hip: [116, 121] },
    ],
    caution: "Damtabellen kommer från en återförsäljare, inte från Filippa K:s egen sida.",
  },
  {
    brand: "Uniqlo",
    system: "herr",
    ranges: [
      { label: "S", chest: [88, 96], waist: [68, 76] },
      { label: "M", chest: [96, 104], waist: [76, 84] },
      { label: "L", chest: [104, 112], waist: [84, 92] },
      { label: "XL", chest: [112, 120] },
    ],
    caution: "Ungefärlig herrtabell. Uniqlo mäter ofta om per plagg.",
  },
];

const FIT_NOTES: Record<string, string> = {
  "Tiger of Sweden": "Skräddat och ofta smalare än en rak basmodell. Ligger du mellan två storlekar, prova den större.",
  "Our Legacy": "Snittet är ofta vidare. Stanna på storleken som matchar måttet om du vill ha deras look.",
  "Acne Studios": "Många modeller är rymligare än en klassisk bas. Jämför plaggmåttet med ett plagg som redan sitter.",
  Lemaire: "Snittet är ofta vidare. Stanna på storleken som matchar måttet om du vill ha deras volym.",
  "Carhartt WIP": "Workwear-modellerna är rymliga. Jämför bröstvidden på plagget, mätt plant och gånger två, med din bröstkorg.",
  NN07: "Avslappnad linje. Jämför med tabellen på den modell du tittar på.",
};

const DENIM = new Set(["Nudie Jeans", "Jeanerica", "A.P.C."]);

export const BRAND_SIZE_NOTE =
  "Storlekarna är ungefärliga kroppsmått. COS, Arket och & Other Stories följer tabeller som återförsäljaren Minimalus Stilius samlade från märkenas sidor i september 2026. Filippa K:s damtabell kommer från återförsäljaren Paradigme. Uniqlo herr är en ungefärlig tabell, och Uniqlo ändrar den per plagg. Märkena uppdaterar sina guider. Jämför alltid med den aktuella innan du beställer. Övriga märken har ingen tabell inlagd här, bara måttet du ska säga i butik.";

function serves(brand: Brand, system: SizeSystem): boolean {
  if (system === "unisex") return true;
  return brand.systems.includes(system) || brand.systems.includes("unisex");
}

function formatShoe(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
}

function pickPoint(value: number, rows: { label: string; at: number }[]): string {
  const sorted = [...rows].sort((a, b) => a.at - b.at);
  if (value < sorted[0].at - 4) return `under ${sorted[0].label}`;
  if (value > sorted[sorted.length - 1].at + 4) return `över ${sorted[sorted.length - 1].label}`;
  const ranked = sorted
    .map((row) => ({ row, dist: Math.abs(row.at - value) }))
    .sort((a, b) => a.dist - b.dist || a.row.at - b.row.at);
  const first = ranked[0];
  const second = ranked[1];
  if (!first) return "";
  if (first.dist === 0 || !second) return first.row.label;
  if (second.dist - first.dist <= 1) {
    const [low, high] = [first.row, second.row].sort((a, b) => a.at - b.at);
    return `mellan ${low.label} och ${high.label}`;
  }
  return first.row.label;
}

function pickRange(value: number, rows: { label: string; min: number; max: number }[]): string {
  const sorted = [...rows].sort((a, b) => a.min - b.min || a.max - b.max);
  const inside = sorted.filter((row) => value >= row.min && value <= row.max);
  if (inside.length > 1) return `${inside[0].label}, på gränsen till ${inside[1].label}`;
  if (inside.length === 1) return inside[0].label;
  for (let index = 0; index < sorted.length - 1; index += 1) {
    if (value > sorted[index].max && value < sorted[index + 1].min) {
      return `mellan ${sorted[index].label} och ${sorted[index + 1].label}`;
    }
  }
  if (value < sorted[0].min) return `under ${sorted[0].label}`;
  return `över ${sorted[sorted.length - 1].label}`;
}

function measureRows(
  chart: Chart,
  key: "chest" | "waist" | "hip",
): { label: string; at?: number; min?: number; max?: number }[] {
  if (chart.points) {
    return chart.points.filter((row) => row[key] !== undefined).map((row) => ({ label: row.label, at: row[key] }));
  }
  return (chart.ranges ?? [])
    .filter((row) => row[key])
    .map((row) => ({ label: row.label, min: row[key]![0], max: row[key]![1] }));
}

function pick(chart: Chart, key: "chest" | "waist" | "hip", value: number): string | null {
  const rows = measureRows(chart, key);
  if (rows.length === 0) return null;
  if (rows[0].at !== undefined) {
    return pickPoint(
      value,
      rows.map((row) => ({ label: row.label, at: row.at! })),
    );
  }
  return pickRange(
    value,
    rows.map((row) => ({ label: row.label, min: row.min!, max: row.max! })),
  );
}

function prefix(system: SizeSystem, chartSystem: "dam" | "herr"): string {
  if (system !== "unisex") return "";
  return chartSystem === "herr" ? "Herr, " : "Dam, ";
}

function chartLines(chart: Chart, profile: Profile): SizeLine[] {
  const lines: SizeLine[] = [];
  const head = prefix(profile.sizeSystem, chart.system);
  const titled = (word: "Överdel" | "Byxor") => (head ? `${head}${word.toLowerCase()}` : word);
  if (profile.chestCm) {
    const size = pick(chart, "chest", profile.chestCm);
    if (size) {
      let text = `${titled("Överdel")}: ${size}.`;
      if (profile.hipsCm) {
        const hip = pick(chart, "hip", profile.hipsCm);
        if (hip && hip !== size) text += ` Höft pekar mot ${hip}.`;
      }
      lines.push({ kind: "top", text });
    }
  }
  if (profile.waistCm) {
    const size = pick(chart, "waist", profile.waistCm);
    if (size) {
      let text = `${titled("Byxor")}: ${size}.`;
      if (profile.hipsCm) {
        const hip = pick(chart, "hip", profile.hipsCm);
        if (hip && hip !== size) text += ` Höft pekar mot ${hip}.`;
      }
      if (chart.inseam && profile.inseamCm && Math.abs(chart.inseam - profile.inseamCm) >= 3) {
        text += ` Tabellens innerben är ${chart.inseam} cm, ditt är ${profile.inseamCm} cm.`;
      }
      lines.push({ kind: "bottom", text });
    }
  }
  if (lines.length > 0 && chart.caution) lines.push({ kind: "note", text: chart.caution });
  return lines;
}

function ask(profile: Profile): string | null {
  const bits: string[] = [];
  if (profile.chestCm) bits.push(`${profile.sizeSystem === "herr" ? "bröstkorg" : "byst eller bröstkorg"} ${profile.chestCm} cm`);
  if (profile.waistCm) bits.push(`midja ${profile.waistCm} cm`);
  if (profile.hipsCm) bits.push(`höft ${profile.hipsCm} cm`);
  if (bits.length === 0) return null;
  return `Säg ${bits.join(", ")} och jämför med märkets aktuella tabell.`;
}

function jeansLine(profile: Profile, system: SizeSystem): SizeLine | null {
  if (!profile.waistCm) return null;
  if (system === "dam") return null;
  const w = Math.round(profile.waistCm / 2.54);
  const length = profile.inseamCm ? ` Innerben ${profile.inseamCm} cm.` : "";
  const head = system === "unisex" ? "Herr, " : "";
  return {
    kind: "bottom",
    text: `${head}Jeans: ungefär W${w}.${length} W-talet är midjan delad med 2,54. Jämför med måtten som står på jeansen.`,
  };
}

function tailorLine(profile: Profile, system: SizeSystem): SizeLine[] {
  if (system === "dam") return [];
  const lines: SizeLine[] = [];
  const head = system === "unisex" ? "Herr, " : "";
  if (profile.chestCm) {
    const size = Math.round(profile.chestCm / 2 / 2) * 2;
    lines.push({
      kind: "top",
      text: `${head}Kavaj: ungefär storlek ${size} utifrån bröstkorg ${profile.chestCm} cm. Säg måttet i butiken.`,
    });
  }
  const jeans = jeansLine(profile, system);
  if (jeans) lines.push(jeans);
  return lines;
}

function shoeLine(profile: Profile): SizeLine | null {
  if (!profile.shoeEu) return null;
  return {
    kind: "shoe",
    text: `Skor: EU ${formatShoe(profile.shoeEu)}. Prova modellen, lästen varierar.`,
  };
}

function isShoeBrand(brand: Brand): boolean {
  return brand.categories.length === 1 && brand.categories[0] === "skor";
}

export function brandSize(profile: Profile, brandName: string): BrandSize | null {
  const brand = BRANDS.find((item) => item.name === brandName);
  if (!brand || !serves(brand, profile.sizeSystem)) return null;
  const lines = linesFor(profile, brand);
  if (lines.length === 0) return null;
  return { brand: brand.name, lines };
}

function linesFor(profile: Profile, brand: Brand): SizeLine[] {
  if (isShoeBrand(brand)) {
    const shoe = shoeLine(profile);
    return shoe ? [shoe] : [];
  }

  const charts = CHARTS.filter(
    (chart) => chart.brand === brand.name && (profile.sizeSystem === "unisex" || chart.system === profile.sizeSystem),
  );
  const lines = charts.flatMap((chart) => chartLines(chart, profile));

  if (brand.name === "Oscar Jacobson") lines.push(...tailorLine(profile, profile.sizeSystem));
  if (DENIM.has(brand.name)) {
    const jeans = jeansLine(profile, profile.sizeSystem);
    if (jeans && !lines.some((line) => line.kind === "bottom")) lines.push(jeans);
  }
  if (
    profile.chestCm &&
    lines.some((line) => line.kind === "bottom") &&
    !lines.some((line) => line.kind === "top") &&
    brand.categories.some((item) => item === "overdel" || item === "ytterplagg" || item === "heldragt")
  ) {
    lines.push({
      kind: "top",
      text: `Överdel: säg byst eller bröstkorg ${profile.chestCm} cm och jämför med deras tabell.`,
    });
  }
  if (profile.sizeSystem === "unisex" && brand.name === "Uniqlo" && lines.some((line) => line.kind === "top" || line.kind === "bottom")) {
    lines.push({ kind: "note", text: "Damtabell saknas här. Jämför damstorleken på uniqlo.com." });
  }

  if (!lines.some((line) => line.kind === "top" || line.kind === "bottom")) {
    const told = ask(profile);
    if (told) lines.push({ kind: "note", text: told });
    if (brand.name === "Uniqlo" && profile.sizeSystem === "dam") {
      lines.push({ kind: "note", text: "Tabellen som finns inlagd är herr. Jämför damstorleken på uniqlo.com." });
    }
    if (brand.name === "Filippa K" && profile.sizeSystem === "herr") {
      lines.push({ kind: "note", text: "Bara damtabellen finns inlagd. Jämför herrstorleken med Filippa K:s aktuella guide." });
    }
  }

  const note = FIT_NOTES[brand.name];
  if (note && lines.length > 0) lines.push({ kind: "note", text: note });

  if (lines.some((line) => line.kind === "top" || line.kind === "bottom")) {
    if (profile.fit === "los") {
      lines.push({ kind: "note", text: "Du vill ha lös passform. Ligger du mellan två storlekar, ta den större." });
    }
    if (profile.fit === "tajt") {
      lines.push({ kind: "note", text: "Du vill ha tajt passform. Ligger du mellan två storlekar, ta den mindre." });
    }
  }
  return lines;
}

export function brandSizes(profile: Profile): BrandSize[] {
  return BRANDS.map((brand) => brandSize(profile, brand.name)).filter((item): item is BrandSize => item !== null);
}

export function sizeLineFor(size: BrandSize, category: Category): string | null {
  const kind: SizeKind = category === "underdel" ? "bottom" : category === "skor" ? "shoe" : category === "accessoar" ? "note" : "top";
  return size.lines.find((line) => line.kind === kind)?.text ?? size.lines.find((line) => line.kind === "note")?.text ?? null;
}
