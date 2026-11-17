import { ESSENTIALS } from "./catalog";
import type { Category, Condition, Piece } from "./domain";

const SHOULDER = ["bra", "forbi", "drar", "syns-inte"] as const;
const EASE = ["bra", "glapp", "stramt", "syns-inte"] as const;
const WAIST = ["bra", "glapp", "stramt", "syns-inte"] as const;
const LENGTH = ["bra", "kort", "lang", "syns-inte"] as const;
const FABRIC = ["bra", "tunn", "sliten", "syns-inte"] as const;
const STYLE = ["ratt", "tveksam", "fel"] as const;

export type FitAnswers = {
  shoulder: (typeof SHOULDER)[number];
  ease: (typeof EASE)[number];
  waist: (typeof WAIST)[number];
  length: (typeof LENGTH)[number];
  fabric: (typeof FABRIC)[number];
  style: (typeof STYLE)[number];
};

export type VerdictId = "behall" | "justera" | "salj";

export type Verdict = {
  verdict: VerdictId;
  summary: string;
};

function oneOf<T extends string>(value: unknown, options: readonly T[]): value is T {
  return typeof value === "string" && options.includes(value as T);
}

export function parseAnswers(body: unknown): FitAnswers | null {
  if (!body || typeof body !== "object") return null;
  const answers = (body as { answers?: unknown }).answers;
  if (!answers || typeof answers !== "object") return null;
  const record = answers as Record<string, unknown>;
  if (!oneOf(record.shoulder, SHOULDER)) return null;
  if (!oneOf(record.ease, EASE)) return null;
  if (!oneOf(record.waist, WAIST)) return null;
  if (!oneOf(record.length, LENGTH)) return null;
  if (!oneOf(record.fabric, FABRIC)) return null;
  if (!oneOf(record.style, STYLE)) return null;
  return {
    shoulder: record.shoulder,
    ease: record.ease,
    waist: record.waist,
    length: record.length,
    fabric: record.fabric,
    style: record.style,
  };
}

export function wardrobeContext(garment: Piece, all: Piece[]): { duplicate: boolean; essential: boolean } {
  const others = all.filter((item) => item.id !== garment.id && item.source !== "example");
  const duplicate = others.some((item) => item.subcategory === garment.subcategory && item.color === garment.color);
  const essential = ESSENTIALS.some((essential) => {
    if (!essential.subcategories.includes(garment.subcategory)) return false;
    if (essential.colors.length > 0 && !essential.colors.includes(garment.color)) return false;
    const covers = others.filter(
      (item) =>
        item.inRotation &&
        item.condition !== "sliten" &&
        essential.subcategories.includes(item.subcategory) &&
        (essential.colors.length === 0 || essential.colors.includes(item.color)),
    );
    return covers.length === 0;
  });
  return { duplicate, essential };
}

export function decide(input: {
  answers: FitAnswers;
  category: Category;
  duplicate: boolean;
  essential: boolean;
  condition: Condition;
}): Verdict {
  const { answers, category, duplicate, essential, condition } = input;
  const worn = answers.fabric === "sliten" || condition === "sliten";
  const bodyTight = answers.shoulder === "drar" || answers.ease === "stramt";
  const bodyLoose = answers.shoulder === "forbi" || answers.ease === "glapp";
  const waistOff = answers.waist === "glapp" || answers.waist === "stramt";
  const styleOff = answers.style === "fel";
  const lengthQuiet = answers.length === "bra" || answers.length === "syns-inte";

  if (
    answers.length === "lang" &&
    !bodyTight &&
    !bodyLoose &&
    !waistOff &&
    !styleOff &&
    !worn &&
    answers.fabric !== "tunn" &&
    answers.style === "ratt"
  ) {
    return {
      verdict: "justera",
      summary: "Det enda som stör är längden, och en för lång fåll går att korta. Behåll plagget och lämna in det.",
    };
  }

  if (waistOff && !bodyTight && !bodyLoose && lengthQuiet && !styleOff && !worn && answers.style !== "tveksam") {
    return {
      verdict: "justera",
      summary:
        answers.waist === "glapp"
          ? "Det glipar i midjan och resten sitter. En skräddare kan ta in den. Behåll."
          : "Midjan stramar. Om det finns sömsmån kan den släppas ut. Behåll om det går, annars sälj.",
    };
  }

  if (bodyTight || styleOff) {
    if (essential && !duplicate && !styleOff && !worn) {
      return {
        verdict: "behall",
        summary: "Storleken är för liten, men det här är din enda bas i den rollen. Behåll tills ersättaren är köpt, och sälj den här först då.",
      };
    }
    if (essential && !duplicate && styleOff && !bodyTight && !worn) {
      return {
        verdict: "behall",
        summary: "Stilen är inte den du bygger, men plagget täcker en bas du inte har en annan av. Behåll tills du hittat en ersättare.",
      };
    }
    if (bodyTight && styleOff) {
      return {
        verdict: "salj",
        summary: "Den sitter för tight och stilen stämmer inte. Det går sällan att sy om en axel som drar. Sälj.",
      };
    }
    if (bodyTight) {
      return {
        verdict: "salj",
        summary: "Det stramar i axel eller över kroppen. Det går sällan att sy om. Sälj och ta en storlek där sömmen landar på axeln.",
      };
    }
    return {
      verdict: "salj",
      summary: "Stilen stämmer inte med garderoben du bygger. Sälj det, med produktbilden som första bild.",
    };
  }

  if (worn) {
    if (essential && !duplicate) {
      return {
        verdict: "behall",
        summary: "Tyget är slitet, men det är din enda version av en bas. Använd den tills du köpt en ny, och sälj inte först.",
      };
    }
    return {
      verdict: "salj",
      summary: "Tyget är slitet och du klarar dig utan det. Sälj det ärligt, med en närbild på slitaget.",
    };
  }

  if (answers.length === "kort" && (category === "underdel" || category === "heldragt" || category === "ytterplagg")) {
    if (essential && !duplicate && answers.style === "ratt") {
      return {
        verdict: "behall",
        summary: "Den är för kort för att förlängas, men det är din enda bas. Behåll tills du hittar rätt längd.",
      };
    }
    return { verdict: "salj", summary: "Den är för kort och går inte att förlänga snyggt. Sälj." };
  }

  if (answers.length === "kort") {
    return { verdict: "salj", summary: "Längden är för kort och går sällan att förlänga. Sälj." };
  }

  if (bodyLoose) {
    if (duplicate) {
      return { verdict: "salj", summary: "Den är för stor och du har redan ett liknande plagg. Sälj den här." };
    }
    return {
      verdict: "justera",
      summary: "Den är rymligare än den ska. Om det bara är midjan går den att ta in. Är hela plagget för stort är det enklare att sälja.",
    };
  }

  if (duplicate && (answers.style === "tveksam" || answers.fabric === "tunn")) {
    return { verdict: "salj", summary: "Du har redan ett liknande plagg, och det här är inte det starkare. Sälj det." };
  }

  if (answers.fabric === "tunn" && answers.style !== "ratt") {
    return { verdict: "salj", summary: "Tyget känns tunt och stilen är inte given. Sälj det innan det nöts mer." };
  }

  if (answers.style === "tveksam") {
    return {
      verdict: "behall",
      summary: "Passformen håller. Stilen är inte självklar, men den fyller en plats. Behåll och se om du tar på dig den.",
    };
  }

  if (duplicate) {
    return {
      verdict: "behall",
      summary: "Den sitter bra. Du har ett liknande plagg, så behåll det du tar på dig oftast och sälj det andra.",
    };
  }

  const unseen = [answers.shoulder, answers.ease, answers.waist, answers.length, answers.fabric].filter((item) => item === "syns-inte").length;
  if (unseen >= 3) {
    return {
      verdict: "behall",
      summary: "För lite syns på bilden för att döma ut plagget. Ta om den enligt guiden, fram och från sidan, och svara igen.",
    };
  }

  return {
    verdict: "behall",
    summary: "Sitter på axeln, har luft utan att glipa, längden stämmer och tyget ser helt ut. Behåll.",
  };
}
