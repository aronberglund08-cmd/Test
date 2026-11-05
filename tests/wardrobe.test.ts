import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { advise } from "../src/lib/advise";
import { EXAMPLE_PIECES } from "../src/lib/example";
import { suggestLooks } from "../src/lib/engine";
import { decodeImage } from "../src/lib/images";
import { sizeHints } from "../src/lib/sizes";
import { insertGarment, listGarments, saveProfile } from "../src/lib/store";
import { emptyProfile, type Piece } from "../src/lib/domain";

const TINY_PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function piece(partial: Partial<Piece> & Pick<Piece, "id" | "category" | "subcategory" | "color">): Piece {
  return {
    name: partial.id,
    patterned: false,
    material: "",
    brand: "",
    seasons: ["alla"],
    formality: "vardag",
    silhouette: "normal",
    condition: "bra",
    favorite: false,
    inRotation: true,
    source: "own",
    ...partial,
  };
}

describe("looks", () => {
  it("sätter ihop flera höstlooks av exempelgarderoben", () => {
    const result = suggestLooks({ pieces: EXAMPLE_PIECES, occasion: "vardag", month: 11, limit: 6 });
    assert.ok(result.looks.length >= 3);
    const names = result.looks.flatMap((look) => look.pieces.map((item) => item.subcategory));
    assert.equal(names.includes("linne"), false);
    assert.equal(names.includes("shorts"), false);
    assert.equal(names.includes("sandaler"), false);
    assert.ok(result.looks.every((look) => look.why.length > 20));
    assert.ok(result.looks.every((look) => look.pieces.some((item) => item.slot === "shoes")));
  });

  it("håller formella byxor borta från kontoret och lediga plagg borta från kavajen", () => {
    const office = suggestLooks({ pieces: EXAMPLE_PIECES, occasion: "kontor", month: 11, limit: 8 });
    assert.equal(office.looks.some((look) => look.pieces.some((item) => item.name === "Svarta ullbyxor")), false);
    assert.equal(office.looks.some((look) => look.pieces.some((item) => item.name === "Grå tung t-shirt")), false);
    const first = office.looks[0];
    assert.ok(first);
    assert.equal(
      first.pieces.some((item) => item.subcategory === "overshirt") && first.pieces.some((item) => item.subcategory === "blazer"),
      false,
    );
    assert.equal(first.pieces.some((item) => item.subcategory === "skjorta" || item.subcategory === "blus"), true);
    const evening = suggestLooks({ pieces: EXAMPLE_PIECES, occasion: "kvall", month: 11, limit: 8 });
    assert.equal(evening.looks.some((look) => look.pieces.some((item) => item.name === "Svarta ullbyxor")), true);
  });

  it("släpper inte igenom krockande färger eller två mönster", () => {
    const shoes = piece({ id: "skor", category: "skor", subcategory: "sneakers", color: "vit" });
    const clash = suggestLooks({
      pieces: [
        piece({ id: "rod", category: "overdel", subcategory: "t-shirt", color: "rod" }),
        piece({ id: "orange", category: "underdel", subcategory: "chinos", color: "orange", formality: "vardag" }),
        shoes,
      ],
      occasion: "vardag",
      month: 6,
    });
    assert.equal(clash.looks.length, 0);

    const noisy = suggestLooks({
      pieces: [
        piece({ id: "a", category: "overdel", subcategory: "skjorta", color: "vit", patterned: true, formality: "smart" }),
        piece({ id: "b", category: "underdel", subcategory: "chinos", color: "beige", patterned: true, formality: "smart" }),
        piece({ id: "c", category: "skor", subcategory: "loafers", color: "brun", formality: "smart" }),
      ],
      occasion: "kontor",
      month: 11,
    });
    assert.equal(noisy.looks.length, 0);
  });

  it("väljer beige framför svart när marin redan är med", () => {
    const result = suggestLooks({
      pieces: [
        piece({ id: "marin", category: "overdel", subcategory: "skjorta", color: "marin", formality: "smart" }),
        piece({ id: "svart-byxa", category: "underdel", subcategory: "chinos", color: "svart", formality: "smart" }),
        piece({ id: "beige-byxa", category: "underdel", subcategory: "chinos", color: "beige", formality: "smart" }),
        piece({ id: "brun-sko", category: "skor", subcategory: "loafers", color: "brun", formality: "smart" }),
        piece({ id: "svart-sko", category: "skor", subcategory: "loafers", color: "svart", formality: "smart" }),
      ],
      occasion: "kontor",
      month: 5,
      limit: 4,
    });
    assert.equal(result.looks[0]?.pieces.some((item) => item.id === "beige-byxa"), true);
  });

  it("säger till när skorna saknas", () => {
    const result = suggestLooks({
      pieces: [
        piece({ id: "topp", category: "overdel", subcategory: "skjorta", color: "vit", formality: "smart" }),
        piece({ id: "byxa", category: "underdel", subcategory: "chinos", color: "beige", formality: "smart" }),
      ],
      occasion: "kontor",
      month: 11,
    });
    assert.equal(result.looks.length, 0);
    assert.ok(result.missing.includes("ett par skor"));
  });
});

describe("inköp och mått", () => {
  it("ser en vit skjorta som täckt och ett exempelplagg som ett hål", () => {
    const owned = advise({
      pieces: [piece({ id: "skjorta", category: "overdel", subcategory: "skjorta", color: "vit", source: "own" })],
      aesthetics: [],
      system: "unisex",
      itemBudget: null,
      monthBudget: null,
      month: 11,
    });
    assert.equal(owned.gaps.some((gap) => gap.id === "vit-skjorta"), false);

    const example = advise({
      pieces: [piece({ id: "skjorta", category: "overdel", subcategory: "skjorta", color: "vit", source: "example" })],
      aesthetics: [],
      system: "unisex",
      itemBudget: null,
      monthBudget: null,
      month: 11,
    });
    const gap = example.gaps.find((item) => item.id === "vit-skjorta");
    assert.equal(gap?.state, "example");
  });

  it("sållar bort dyra märken när taket är lågt", () => {
    const advice = advise({
      pieces: [],
      aesthetics: ["minimal"],
      system: "dam",
      itemBudget: 500,
      monthBudget: 1500,
      month: 11,
    });
    assert.equal(advice.brands.some((brand) => brand.name === "Toteme" || brand.name === "Lemaire"), false);
    assert.equal(advice.brands.some((brand) => brand.name === "Uniqlo" || brand.name === "Arket"), true);
    assert.match(advice.pace, /1\s?500 kr/);
  });

  it("skriver storlekstips utan att gissa kön när systemet är unisex", () => {
    const herr = sizeHints({ ...emptyProfile(), sizeSystem: "herr", neckCm: 40, chestCm: 100, waistCm: 84, shoeEu: 42 });
    assert.match(herr.join(" "), /krage 40/);
    assert.match(herr.join(" "), /W33/);
    assert.match(herr.join(" "), /storlek 50/);
    const dam = sizeHints({ ...emptyProfile(), sizeSystem: "dam", chestCm: 88, hipsCm: 104 });
    assert.match(dam.join(" "), /EU 42/);
    const open = sizeHints({ ...emptyProfile(), sizeSystem: "unisex", waistCm: 84 });
    assert.match(open.join(" "), /84 cm/);
    assert.equal(/EU 4/.test(open.join(" ")), false);
  });
});

describe("bilder och lagring", () => {
  it("godkänner png och avvisar svg", () => {
    assert.equal(decodeImage(TINY_PNG)?.mime, "image/png");
    assert.equal(decodeImage(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>").toString("base64")), null);
    assert.equal(decodeImage("inte-en-bild"), null);
  });

  it("sparar profil och plagg för en ägare", async () => {
    const owner = `test:${crypto.randomUUID()}`;
    const profile = await saveProfile(owner, { ...emptyProfile(), sizeSystem: "herr", waistCm: 84, shoeEu: 42.5, notes: "smal över vaderna" });
    assert.equal(profile.waistCm, 84);
    assert.equal(profile.shoeEu, 42.5);
    const garment = await insertGarment(
      owner,
      "ex-test-skjorta",
      {
        name: "Testskjorta",
        category: "overdel",
        subcategory: "skjorta",
        color: "vit",
        patterned: false,
        material: "bomull",
        brand: "Arket",
        seasons: ["alla"],
        formality: "smart",
        silhouette: "normal",
        condition: "bra",
        priceSek: 700,
        fitNote: "",
        notes: "",
        favorite: true,
        inRotation: true,
        photo: null,
        clearPhoto: true,
      },
      "own",
    );
    assert.equal(garment.name, "Testskjorta");
    const listed = await listGarments(owner);
    assert.equal(listed.length, 1);
    assert.deepEqual(listed[0]?.seasons, ["alla"]);
    assert.equal(listed[0]?.favorite, true);
  });
});
