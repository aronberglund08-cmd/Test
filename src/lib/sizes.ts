import type { Profile, SizeSystem } from "./domain";

const DAM = [
  { size: 34, bust: 80, waist: 62, hip: 88 },
  { size: 36, bust: 84, waist: 66, hip: 92 },
  { size: 38, bust: 88, waist: 70, hip: 96 },
  { size: 40, bust: 92, waist: 74, hip: 100 },
  { size: 42, bust: 96, waist: 78, hip: 104 },
  { size: 44, bust: 100, waist: 83, hip: 108 },
  { size: 46, bust: 104, waist: 88, hip: 112 },
  { size: 48, bust: 110, waist: 94, hip: 117 },
];

function nearestDam(value: number, key: "bust" | "waist" | "hip"): number {
  let best = DAM[0];
  let distance = Infinity;
  for (const row of DAM) {
    const next = Math.abs(row[key] - value);
    if (next < distance) {
      distance = next;
      best = row;
    }
  }
  return best.size;
}

function nearestEven(value: number): number {
  return Math.round(value / 2) * 2;
}

function sentence(profile: Profile, system: SizeSystem): string[] {
  const lines: string[] = [];
  if (system === "herr") {
    if (profile.neckCm) lines.push(`Skjorta: be om krage ${profile.neckCm}.`);
    if (profile.chestCm) {
      lines.push(
        `Kavaj: ungefär storlek ${nearestEven(profile.chestCm / 2)}, utifrån bröstkorg ${profile.chestCm} cm.`,
      );
    }
    if (profile.waistCm) {
      const w = Math.round(profile.waistCm / 2.54);
      lines.push(`Byxor: midja ${profile.waistCm} cm, ungefär W${w}.`);
    }
    return lines;
  }
  if (system === "dam") {
    const bust = profile.chestCm ? nearestDam(profile.chestCm, "bust") : null;
    const hip = profile.hipsCm ? nearestDam(profile.hipsCm, "hip") : null;
    if (bust && hip && Math.abs(bust - hip) > 2) {
      const larger = Math.max(bust, hip);
      lines.push(
        `Byst pekar mot EU ${bust} och höft mot EU ${hip}. Välj den större, EU ${larger}, och låt midjan tas in.`,
      );
    } else if (bust || hip) {
      lines.push(`Ungefärlig EU-storlek ${bust ?? hip}, utifrån byst och höft.`);
    }
    if (profile.waistCm) lines.push(`Midja ${profile.waistCm} cm. Jämför med märkets egen tabell innan du beställer.`);
    return lines;
  }
  if (profile.chestCm) lines.push(`Byst eller bröstkorg ${profile.chestCm} cm. Säg måttet i butiken i stället för en storlek.`);
  if (profile.waistCm) lines.push(`Midja ${profile.waistCm} cm.`);
  if (profile.hipsCm) lines.push(`Höft ${profile.hipsCm} cm.`);
  return lines;
}

export function sizeHints(profile: Profile): string[] {
  const lines = sentence(profile, profile.sizeSystem);
  if (profile.inseamCm) lines.push(`Innerben ${profile.inseamCm} cm. Ta med det när du köper byxor.`);
  if (profile.shoulderCm) lines.push(`Axelbredd ${profile.shoulderCm} cm. Kavajens axelsöm ska träffa din axel.`);
  if (profile.sleeveCm) lines.push(`Ärmlängd ${profile.sleeveCm} cm.`);
  if (profile.shoeEu) {
    const shoe = Number.isInteger(profile.shoeEu) ? String(profile.shoeEu) : profile.shoeEu.toFixed(1).replace(".", ",");
    lines.push(`Skor: EU ${shoe}.`);
  }
  if (profile.fit === "los") lines.push("Du vill ha lös passform. Titta på märken med avslappnat snitt och prova en storlek upp om axeln sitter tight.");
  if (profile.fit === "tajt") lines.push("Du vill ha tajt passform. Håll dig till märken som sitter nära kroppen och prova rörelse, inte bara stillastående.");
  if (lines.length > 0) lines.push("Ungefärligt. Märken skiljer sig, så jämför alltid med deras tabell.");
  return lines;
}
