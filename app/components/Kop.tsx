"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatSek, photoSrc } from "@/src/lib/domain";
import { api } from "../lib/api";

type Gap = {
  id: string;
  title: string;
  detail: string;
  priceLabel: string;
  state: string;
  brands: string[];
};
type Brand = { name: string; why: string; buy: string; sweet: number; tier: string; systems: string[] };
type Wish = { id: string; title: string; brand: string; reason: string; priceHint: string };
type Image = { id: string; kind: string; caption: string; mime: string; data: string };
type Shopping = {
  gaps: Gap[];
  brands: Brand[];
  note: string;
  pace: string;
  wishes: Wish[];
  season: string;
  style: { notes: string; monthBudgetSek: number | null; itemBudgetSek: number | null; aesthetics: string[] };
  images: Image[];
};

export function Kop() {
  const [data, setData] = useState<Shopping | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setData(await api<Shopping>("/api/shopping"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function wish(gap: Gap) {
    await api("/api/wishes", {
      method: "POST",
      body: JSON.stringify({
        title: gap.title,
        brand: gap.brands[0] ?? "",
        reason: gap.detail,
        priceHint: gap.priceLabel,
      }),
    });
    await load();
  }

  async function removeWish(id: string) {
    await api(`/api/wishes/${id}`, { method: "DELETE" });
    await load();
  }

  const wished = new Set(data?.wishes.map((item) => item.title) ?? []);
  const budgetImages = data?.images.filter((image) => image.kind === "budget") ?? [];
  const styleImages = data?.images.filter((image) => image.kind === "stil") ?? [];

  return (
    <>
      <p className="eyebrow">{data ? data.season : "Inköp"}</p>
      <h1>Det som saknas</h1>
      <p className="dek">
        Förslagen utgår från det du äger, säsongen, stilen du valt och din budget. Bilderna är din visuella brief, de styr inte listan av sig själva.
      </p>
      {error ? <p className="alert" role="alert">{error}</p> : null}
      {data?.style.aesthetics.length === 0 ? <p className="banner">Välj stil och budget under <Link href="/profil">Profil</Link> så blir märkena träffsäkrare.</p> : null}
      {data?.pace ? <p className="why">{data.pace}</p> : null}
      {data?.note ? <p className="dek">{data.note}</p> : null}
      {data?.style.notes ? <blockquote>{data.style.notes}</blockquote> : null}
      {(data?.style.itemBudgetSek || data?.style.monthBudgetSek) ? (
        <p className="meta">
          {data.style.itemBudgetSek ? `Tak per plagg ${formatSek(data.style.itemBudgetSek)}` : ""}
          {data.style.itemBudgetSek && data.style.monthBudgetSek ? " · " : ""}
          {data.style.monthBudgetSek ? `Månad ${formatSek(data.style.monthBudgetSek)}` : ""}
        </p>
      ) : null}
      {styleImages.length > 0 ? (
        <section>
          <p className="kicker">Stilbilder</p>
          <Film images={styleImages} />
        </section>
      ) : null}
      <ol className="gap-list">
        {data?.gaps.map((gap, index) => (
          <li key={gap.id}>
            <p className="kicker">{String(index + 1).padStart(2, "0")}{gap.state === "worn" ? " · sliten" : gap.state === "example" ? " · bara exempel" : ""}</p>
            <h3>{gap.title}</h3>
            <p>{gap.detail}</p>
            <p className="meta">{gap.priceLabel}{gap.brands.length ? ` · ${gap.brands.join(", ")}` : ""}</p>
            <button className="btn-text" type="button" disabled={wished.has(gap.title)} onClick={() => void wish(gap)}>
              {wished.has(gap.title) ? "Sparad på inköpslistan" : "Spara som inköp"}
            </button>
          </li>
        ))}
      </ol>
      {data && data.gaps.length === 0 ? <p className="dek">Inget uppenbart hål för den här säsongen. Bra läge att låta garderoben vara.</p> : null}
      <h2 style={{ marginTop: 28 }}>Märken</h2>
      <ul className="brand-list">
        {data?.brands.map((brand) => (
          <li key={brand.name}>
            <h3>{brand.name}</h3>
            <p className="meta">{brand.tier} · omkring {formatSek(brand.sweet)}{brand.systems.length === 1 && brand.systems[0] !== "unisex" ? ` · ${brand.systems[0] === "dam" ? "Dam" : "Herr"}` : ""}</p>
            <p>{brand.why}</p>
            <p className="meta">Köp här: {brand.buy}</p>
          </li>
        ))}
      </ul>
      {budgetImages.length > 0 ? (
        <section>
          <h2>Budgetbilder</h2>
          <p className="dek">Så här har du beskrivit vad du är villig att lägga. Jämför priserna ovan med det du såg.</p>
          <Film images={budgetImages} />
        </section>
      ) : null}
      <h2>Inköpslista</h2>
      {data && data.wishes.length === 0 ? <p className="dek">Inget sparat ännu.</p> : null}
      <ul className="saved-list">
        {data?.wishes.map((item) => (
          <li key={item.id}>
            <h3>{item.title}</h3>
            <p className="meta">{[item.brand, item.priceHint].filter(Boolean).join(" · ")}</p>
            <button className="btn-text" type="button" onClick={() => void removeWish(item.id)}>Ta bort</button>
          </li>
        ))}
      </ul>
    </>
  );
}

function Film({ images }: { images: Image[] }) {
  return (
    <div className="film">
      {images.map((image) => {
        const src = photoSrc(image.mime, image.data);
        if (!src) return null;
        return (
          <figure key={image.id}>
            <img src={src} alt={image.caption || "Referensbild"} />
            {image.caption ? <figcaption className="meta">{image.caption}</figcaption> : null}
          </figure>
        );
      })}
    </div>
  );
}
