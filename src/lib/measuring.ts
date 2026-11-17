import type { Profile } from "./domain";

export type MeasureGuide = {
  key: keyof Profile;
  text: string;
};

export const MEASURES: MeasureGuide[] = [
  {
    key: "heightCm",
    text: "Stå barfota mot en vägg, med hälar och skulderblad i väggen. Lägg en bok plant på huvudet, vinkelrätt mot väggen, och mät från golvet upp till bokens underkant. Titta rakt fram.",
  },
  {
    key: "chestCm",
    text: "Mät över den fylligaste delen av bysten eller bröstkorgen. Måttbandet ska vara horisontellt, också på ryggen. Andas ut, slappna av och dra inte åt. Ha på den BH du brukar ha under kläder. Be någon hålla bandet om det glider.",
  },
  {
    key: "waistCm",
    text: "Naturlig midja är den smalaste delen, oftast precis ovanför naveln. Håll bandet horisontellt och lämna plats för ett finger så du kan andas. Det är inte samma ställe som där jeansen sitter. Jeans och chinos mäts där linningen ska ligga, ofta lägre och vidare. Använd den naturliga midjan för kjol, klänning och hög kostymbyxa. När du köper jeans, jämför hellre med ett par som redan sitter.",
  },
  {
    key: "hipsCm",
    text: "Mät över den fylligaste delen av höft och stuss, med fötterna ihop. Bandet ska vara horisontellt och ligga still, inte dras åt. Det är det mått som oftast styr byxstorlek när midja och höft pekar åt olika håll.",
  },
  {
    key: "shoulderCm",
    text: "Från axelspets till axelspets, tvärs över ryggen, där axelsömmen ska landa. Be någon mäta. Kolla i spegeln att bandet inte glider ner på överarmen. Kavaj och kappa sitter på det här måttet mer än på bröstkorgen.",
  },
  {
    key: "inseamCm",
    text: "Innerben är från grenen, där sömmarna möts, längs benets insida ner till där du vill att fållen ska sluta. Barfota om du mäter till golvet. Enklare: ta ett par byxor som redan har rätt längd och mät innerbenssömmen på dem.",
  },
  {
    key: "sleeveCm",
    text: "Från axelspetsen, över en lätt böjd armbåge, till handledsbenet. Armen ska vara avslappnad, inte utsträckt. Skjortärmen ska nudda handleden när armen hänger. Kavajärmen slutar lite högre, så skjortmanschetten kan synas.",
  },
  {
    key: "neckCm",
    text: "Runt halsens nedersta del, där skjortkragen sitter. Ett finger mellan band och hals. Talet i centimeter är kragmåttet du ber om, till exempel 40.",
  },
  {
    key: "shoeEu",
    text: "Den säkraste skostorleken är den du redan har i ett par som sitter, i samma typ av sko. Ska du mäta foten: stå på ett papper med hälen mot en vägg, markera längsta tån och mät i centimeter. Lästerna skiljer sig mellan märken, så prova alltid modellen.",
  },
];

export function measureGuide(key: keyof Profile): string {
  return MEASURES.find((item) => item.key === key)?.text ?? "";
}
