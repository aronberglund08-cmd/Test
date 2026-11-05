export const CATEGORIES = [
  {
    id: "overdel",
    label: "Överdel",
    subs: [
      { id: "t-shirt", label: "T-shirt" },
      { id: "skjorta", label: "Skjorta" },
      { id: "blus", label: "Blus" },
      { id: "linne", label: "Linne" },
      { id: "polo", label: "Polo" },
      { id: "stickad", label: "Stickad" },
      { id: "hoodie", label: "Hoodie" },
      { id: "kofta", label: "Kofta" },
      { id: "overshirt", label: "Overshirt" },
    ],
  },
  {
    id: "underdel",
    label: "Underdel",
    subs: [
      { id: "jeans", label: "Jeans" },
      { id: "chinos", label: "Chinos" },
      { id: "kostymbyxor", label: "Kostymbyxor" },
      { id: "shorts", label: "Shorts" },
      { id: "kjol", label: "Kjol" },
      { id: "mjukis", label: "Mjukis" },
    ],
  },
  {
    id: "heldragt",
    label: "Heldräkt",
    subs: [
      { id: "klanning", label: "Klänning" },
      { id: "jumpsuit", label: "Jumpsuit" },
    ],
  },
  {
    id: "ytterplagg",
    label: "Ytterplagg",
    subs: [
      { id: "jacka", label: "Jacka" },
      { id: "kappa", label: "Kappa" },
      { id: "blazer", label: "Blazer" },
      { id: "trench", label: "Trench" },
      { id: "dunjacka", label: "Dunjacka" },
    ],
  },
  {
    id: "skor",
    label: "Skor",
    subs: [
      { id: "sneakers", label: "Sneakers" },
      { id: "loafers", label: "Loafers" },
      { id: "boots", label: "Boots" },
      { id: "klackar", label: "Klackar" },
      { id: "sandaler", label: "Sandaler" },
    ],
  },
  {
    id: "accessoar",
    label: "Accessoar",
    subs: [
      { id: "skarp", label: "Skärp" },
      { id: "halsduk", label: "Halsduk" },
      { id: "vaska", label: "Väska" },
      { id: "mossa", label: "Mössa" },
    ],
  },
] as const;

export const COLORS = [
  { id: "svart", label: "Svart", hex: "#1c1915" },
  { id: "vit", label: "Vit", hex: "#f6f3ec" },
  { id: "offwhite", label: "Offwhite", hex: "#e6dccb" },
  { id: "gra", label: "Grå", hex: "#8a847a" },
  { id: "marin", label: "Marin", hex: "#1d2940" },
  { id: "beige", label: "Beige", hex: "#d4c0a0" },
  { id: "sand", label: "Sand", hex: "#c9b48f" },
  { id: "kamel", label: "Kamel", hex: "#b07d45" },
  { id: "brun", label: "Brun", hex: "#6a4126" },
  { id: "cognac", label: "Cognac", hex: "#8a4b24" },
  { id: "khaki", label: "Khaki", hex: "#8b825c" },
  { id: "oliv", label: "Oliv", hex: "#5c6540" },
  { id: "denim", label: "Denim", hex: "#3d5275" },
  { id: "ljusbla", label: "Ljusblå", hex: "#9eb9d4" },
  { id: "rost", label: "Rost", hex: "#9a4a32" },
  { id: "burgundy", label: "Burgundy", hex: "#6e2434" },
  { id: "rod", label: "Röd", hex: "#a33b32" },
  { id: "rosa", label: "Rosa", hex: "#e3b7be" },
  { id: "gron", label: "Grön", hex: "#2f6b4f" },
  { id: "senap", label: "Senap", hex: "#c6a04a" },
  { id: "lila", label: "Lila", hex: "#6d5a86" },
  { id: "orange", label: "Orange", hex: "#d36a32" },
] as const;

export const SEASONS = [
  { id: "alla", label: "Året runt" },
  { id: "var", label: "Vår" },
  { id: "sommar", label: "Sommar" },
  { id: "host", label: "Höst" },
  { id: "vinter", label: "Vinter" },
] as const;

export const FORMALITIES = [
  { id: "ledig", label: "Ledig" },
  { id: "vardag", label: "Vardag" },
  { id: "smart", label: "Smart" },
  { id: "formell", label: "Formell" },
] as const;

export const SILHOUETTES = [
  { id: "tajt", label: "Tajt" },
  { id: "normal", label: "Normal" },
  { id: "los", label: "Lös" },
] as const;

export const MATERIALS = [
  { id: "", label: "Vet inte" },
  { id: "bomull", label: "Bomull" },
  { id: "linne", label: "Linne" },
  { id: "ull", label: "Ull" },
  { id: "denim", label: "Denim" },
  { id: "lader", label: "Läder" },
  { id: "siden", label: "Siden" },
  { id: "stickat", label: "Stickat" },
  { id: "syntet", label: "Syntet" },
] as const;

export const CONDITIONS = [
  { id: "ny", label: "Ny" },
  { id: "bra", label: "Bra" },
  { id: "sliten", label: "Sliten" },
] as const;

export const OCCASIONS = [
  { id: "ledig", label: "Ledig" },
  { id: "vardag", label: "Vardag" },
  { id: "kontor", label: "Kontor" },
  { id: "kvall", label: "Kväll" },
] as const;

export const AESTHETICS = [
  { id: "minimal", label: "Minimal", text: "Få plagg, rena linjer, nästan ingen logotyp." },
  { id: "klassisk", label: "Klassisk", text: "Skjorta, byxa, kappa. Ser rätt ut om fem år." },
  { id: "skraddad", label: "Skräddad", text: "Kavaj och pressveck, mer kontor än helg." },
  { id: "street", label: "Street", text: "Denim, overshirt, sneakers med egen hållning." },
  { id: "romantisk", label: "Romantisk", text: "Klänning, kjol och mjukare färger." },
  { id: "workwear", label: "Workwear", text: "Jacka och rejäl byxa, funktion som ser bra ut." },
  { id: "sportig", label: "Sportig", text: "Träning får vara med, men inte styra resten." },
] as const;

export const SIZE_SYSTEMS = [
  { id: "dam", label: "Dam" },
  { id: "herr", label: "Herr" },
  { id: "unisex", label: "Unisex" },
] as const;

export const FITS = [
  { id: "tajt", label: "Tajt" },
  { id: "normal", label: "Normal" },
  { id: "los", label: "Lös" },
] as const;

export type Category = (typeof CATEGORIES)[number]["id"];
export type ColorId = (typeof COLORS)[number]["id"];
export type Season = (typeof SEASONS)[number]["id"];
export type Formality = (typeof FORMALITIES)[number]["id"];
export type Silhouette = (typeof SILHOUETTES)[number]["id"];
export type Condition = (typeof CONDITIONS)[number]["id"];
export type Occasion = (typeof OCCASIONS)[number]["id"];
export type Aesthetic = (typeof AESTHETICS)[number]["id"];
export type SizeSystem = (typeof SIZE_SYSTEMS)[number]["id"];
export type Fit = (typeof FITS)[number]["id"];

export type Piece = {
  id: string;
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
  favorite: boolean;
  inRotation: boolean;
  source: "own" | "example";
};

export type Garment = Piece & {
  priceSek: number | null;
  fitNote: string;
  notes: string;
  photoMime: string | null;
  photoData: string | null;
  createdAt: string;
};

export type Profile = {
  sizeSystem: SizeSystem;
  fit: Fit;
  heightCm: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  shoulderCm: number | null;
  inseamCm: number | null;
  sleeveCm: number | null;
  neckCm: number | null;
  shoeEu: number | null;
  notes: string;
};

export type StyleProfile = {
  aesthetics: Aesthetic[];
  palette: ColorId[];
  avoid: ColorId[];
  monthBudgetSek: number | null;
  itemBudgetSek: number | null;
  notes: string;
};

export type StyleImage = {
  id: string;
  kind: "stil" | "budget";
  caption: string;
  mime: string;
  data: string;
  createdAt: string;
};

export type SavedOutfit = {
  id: string;
  title: string;
  occasion: Occasion;
  why: string;
  pieceIds: string[];
  createdAt: string;
};

export type Wish = {
  id: string;
  title: string;
  brand: string;
  reason: string;
  priceHint: string;
  createdAt: string;
};

const NEUTRAL = new Set<string>(["svart", "vit", "offwhite", "gra", "marin", "beige", "sand", "kamel", "brun", "khaki"]);
const WARM = new Set<string>(["cognac", "oliv", "rost", "burgundy", "senap"]);
const COOL = new Set<string>(["ljusbla", "gron", "lila"]);

export type ColorGroup = "neutral" | "denim" | "warm" | "cool" | "vivid";

export function colorGroup(color: string): ColorGroup {
  if (NEUTRAL.has(color)) return "neutral";
  if (color === "denim") return "denim";
  if (WARM.has(color)) return "warm";
  if (COOL.has(color)) return "cool";
  return "vivid";
}

export function colorById(id: string) {
  return COLORS.find((color) => color.id === id);
}

export function colorLabel(id: string): string {
  return colorById(id)?.label ?? id;
}

export function labelOf(list: readonly { id: string; label: string }[], id: string): string {
  return list.find((item) => item.id === id)?.label ?? id;
}

export function categoryById(id: string) {
  return CATEGORIES.find((category) => category.id === id);
}

export function subcategoryLabel(id: string): string {
  for (const category of CATEGORIES) {
    const found = category.subs.find((sub) => sub.id === id);
    if (found) return found.label;
  }
  return id;
}

export function categoryLabel(id: string): string {
  return categoryById(id)?.label ?? id;
}

export function emptyProfile(): Profile {
  return {
    sizeSystem: "unisex",
    fit: "normal",
    heightCm: null,
    chestCm: null,
    waistCm: null,
    hipsCm: null,
    shoulderCm: null,
    inseamCm: null,
    sleeveCm: null,
    neckCm: null,
    shoeEu: null,
    notes: "",
  };
}

export function emptyStyle(): StyleProfile {
  return {
    aesthetics: [],
    palette: [],
    avoid: [],
    monthBudgetSek: null,
    itemBudgetSek: null,
    notes: "",
  };
}

export function formatSek(value: number): string {
  return `${new Intl.NumberFormat("sv-SE").format(Math.round(value))} kr`;
}

export function photoSrc(mime: string | null | undefined, data: string | null | undefined): string | null {
  if (!mime || !data) return null;
  if (mime !== "image/jpeg" && mime !== "image/png" && mime !== "image/webp") return null;
  if (!/^[A-Za-z0-9+/=\s]+$/.test(data)) return null;
  return `data:${mime};base64,${data}`;
}

export function isId(value: string): boolean {
  return /^[A-Za-z0-9-]{1,80}$/.test(value);
}
