export function stockholmNow(date = new Date()): { month: number; hour: number; label: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Stockholm",
    month: "numeric",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const label = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
  return {
    month: Number(read("month")),
    hour: Number(read("hour")),
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
}

export function greetingForHour(hour: number): string {
  if (hour < 10) return "God morgon";
  if (hour < 18) return "God dag";
  return "God kväll";
}

export function seasonLabel(month: number): string {
  if (month >= 3 && month <= 5) return "Vår";
  if (month >= 6 && month <= 8) return "Sommar";
  if (month === 9 || month === 10) return "Höst";
  return "Höst och vinter";
}

export function seasonsForMonth(month: number): Array<"var" | "sommar" | "host" | "vinter" | "alla"> {
  if (month >= 3 && month <= 5) return ["var", "alla"];
  if (month >= 6 && month <= 8) return ["sommar", "alla"];
  if (month === 9 || month === 10) return ["host", "alla"];
  return ["vinter", "host", "alla"];
}
