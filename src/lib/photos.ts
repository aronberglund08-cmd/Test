import type { Category } from "./domain";

export const STUDIO = {
  title: "Samma hörna, varje plagg",
  steps: [
    "Ett fönster med indirekt ljus. Ingen solfläck på tyget, ingen blixt och ingen taklampa. Taklampan gör färgen gul.",
    "Ställ en vit kartong eller häng ett vitt lakan mittemot fönstret, så skuggsidan inte blir svart.",
    "Samma bakgrund varje gång: ljus slät vägg, ljust golv eller ett lakan utan veck och mönster.",
    "Slå på rutnätet i kameran. Håll telefonen parallellt med plagget, inte lutad.",
    "Stryk eller ånga. Ett veck läses som en fläck.",
    "Hela plagget i bild, med ungefär en handbredd tom yta på alla sidor. Lika mycket varje gång.",
    "Tejpa var tårna ska stå, och håll telefonen på samma höjd. Då blir nästa byxa likadan som den förra.",
  ],
};

export const VINTED = {
  title: "Så bilden går att lägga på Vinted",
  steps: [
    "Första bilden är hela plagget, ensamt. Ingen kollage och ingen katalogbild från märket.",
    "Egna bilder, tagna i dagsljus, utan filter.",
    "Flera vinklar: fram, bak, och en närbild på tyget.",
    "Storlekslappen ska gå att läsa.",
    "Varje fläck, hål eller nötning får en egen närbild. Det är det som gör annonsen trovärdig.",
    "Ansiktet behöver inte vara med. Produktbilden och bilden på kroppen är två olika kort.",
  ],
};

export type Shot = {
  id: string;
  title: string;
  categories: Category[];
  steps: string[];
};

export const SHOTS: Shot[] = [
  {
    id: "byxa",
    title: "Byxor, så de ser likadana ut",
    categories: ["underdel"],
    steps: [
      "Lägg byxan plant, framsidan upp. Linningen rakt mot kamerans överkant, båda benen parallella och med samma mellanrum varje gång.",
      "Släta fickor, gylf och veck med handen. Knäpp knappen.",
      "Fota rakt uppifrån. Linningen ska ligga horisontellt i rutnätet, fållen längst ner, hela benet med.",
      "Stå på samma tejpade ställe och håll telefonen på samma höjd, så avståndet inte ändras mellan paren.",
      "Andra bilden är baksidan, i exakt samma placering.",
      "Sen storlekslappen, en närbild på tyget, och en bild per fel.",
    ],
  },
  {
    id: "overdel",
    title: "Skjorta, stickad och t-shirt",
    categories: ["overdel"],
    steps: [
      "Knäpp plagget och lägg det plant, eller häng det på samma galge mot samma vägg.",
      "Axlarna ska vara jämna, ärmarna spegelvända och kragen slät.",
      "Hela plagget i bild, med lika marginal runt om. Kragen upp, fållen ner.",
      "Om det hänger: telefonen i höjd med bröstet på plagget, inte snett underifrån.",
      "En bild fram, en bak, lappen, tyget, och felen.",
    ],
  },
  {
    id: "ytter",
    title: "Jacka, kappa och kavaj",
    categories: ["ytterplagg"],
    steps: [
      "Häng den på en galge mot den ljusa väggen, knäppt, med ärmarna hängande likadant.",
      "Fota rakt framifrån så axlarna inte lutar. Hela längden ska med, från krage till fåll.",
      "Öppna den på nästa bild så fodret syns.",
      "Närbild på knapp, dragkedja och eventuellt slitage vid manschett och ficka.",
    ],
  },
  {
    id: "heldragt",
    title: "Klänning och jumpsuit",
    categories: ["heldragt"],
    steps: [
      "Häng den så fållen blir rak, eller lägg den plant med livsömmen horisontell.",
      "Hela plagget, från axelband eller krage till fåll, med samma marginal som på byxorna.",
      "En bild fram, en bak, lappen och tyget mot ljuset så tunna partier syns.",
    ],
  },
  {
    id: "skor",
    title: "Skor",
    categories: ["skor"],
    steps: [
      "Ställ paret bredvid varandra, tårna åt samma håll, på samma underlag varje gång.",
      "En bild snett ovanifrån så båda syns, en från sidan, en på sulan.",
      "Närbild på nötning vid tå och häl. Sulan är det köparen tittar på.",
    ],
  },
  {
    id: "accessoar",
    title: "Skärp, väska, halsduk",
    categories: ["accessoar"],
    steps: [
      "Lägg det plant och rakt i rutnätet. Skärp i en svag båge eller helt rakt, samma sätt varje gång.",
      "Hela saken i bild, plus spänne, söm eller etikett på nära håll.",
    ],
  },
];

export const ON_BODY = {
  title: "Bild på kroppen, för passform och stil",
  steps: [
    "Ställ telefonen i brösthöjd, på en trave böcker eller ett stativ. Linsen i mitten av bröstet, annars blir benen för långa eller korta.",
    "Timer på tre sekunder. Sträck inte armen mot kameran.",
    "Tejpa två märken på golvet: ett för tårna och ett för telefonen, ungefär två meter emellan. Samma avstånd varje plagg.",
    "Ljus snett framifrån från fönstret. Vit kartong mittemot, så sidan inte faller i skugga.",
    "Fram: armarna en decimeter från kroppen så sidsömmarna syns. Släta plagget innan timern går, dra inte i det.",
    "Sida: så rygg, midja och fåll syns. En bild till bakifrån om axeln ska bedömas.",
    "Den här bilden stannar i Ateljé. Lägg inte upp den som första bild på Vinted.",
  ],
  lookFor: [
    "Axelsömmen ska ligga på axelspetsen. Utanför är den för stor, indragen och stram är den för liten.",
    "Inga vågräta dragningar över bröst, rygg eller höft.",
    "I midjan ska du kunna nypa ett litet veck tyg. En hel hand är för stort, inget alls är för tight, om du inte vill ha det tajt.",
    "Fållen: byxa vid foten utan att vika sig i en hög, skjorta vid höften, kappa där du vill ha den.",
    "Håll tyget mot ljuset. Noppor, blanka säten och tunna partier syns då.",
    "Stilen: skulle plagget kunna ligga i en look med sådant du redan har, i färgerna du valt.",
  ],
};

export function shotsFor(category: Category): Shot[] {
  return SHOTS.filter((shot) => shot.categories.includes(category));
}
