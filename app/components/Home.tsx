"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OCCASIONS, photoSrc, type Occasion } from "@/src/lib/domain";
import { api, compressImage } from "../lib/api";
import { DropSurface } from "./DropSurface";
import { PieceCard, type PieceView } from "./PieceCard";

type Look = { title: string; why: string; pieces: Array<PieceView & { slot: string; source: string }> };
type Gap = { id: string; title: string; detail: string; priceLabel: string; brands: string[]; state: string };
type HomeData = {
  greeting: string;
  dateLabel: string;
  season: string;
  occasion: Occasion;
  exampleCount: number;
  ownCount: number;
  balance: Array<{ id: string; label: string; count: number }>;
  looks: Look[];
  missing: string[];
  gaps: Gap[];
  pace: string;
  images: Array<{ id: string; kind: string; caption: string; mime: string; data: string }>;
  profile: { waistCm: number | null; shoeEu: number | null };
};

export function Home() {
  const [occasion, setOccasion] = useState<Occasion>("vardag");
  const [data, setData] = useState<HomeData | null>(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dropped, setDropped] = useState("");

  async function load(next: Occasion) {
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const result = await api<HomeData>(`/api/home?occasion=${next}`);
      setData(result);
      setIndex(0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load("vardag");
  }, []);

  const look = data?.looks[index];
  const total = data?.ownCount ?? 0;
  const empty = data && total + (data.exampleCount ?? 0) === 0;
  const nextGap = data?.gaps.find((gap) => gap.state !== "example");

  async function addExamples() {
    setBusy(true);
    setError("");
    try {
      await api("/api/example", { method: "POST", body: "{}" });
      await load(occasion);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    } finally {
      setBusy(false);
    }
  }

  async function addStyleImages(files: File[]) {
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (files.length > 0 && images.length === 0) {
      setError("Det där är ingen bild.");
      return;
    }
    if (images.length === 0) return;
    setError("");
    setDropped("");
    try {
      const added: HomeData["images"] = [];
      for (const file of images) {
        const photo = await compressImage(file);
        const image = await api<{ id: string; kind: string; caption: string; mime: string; data: string }>("/api/style-images", {
          method: "POST",
          body: JSON.stringify({ kind: "stil", photo, caption: "" }),
        });
        added.push(image);
      }
      setData((current) => (current ? { ...current, images: [...added, ...current.images] } : current));
      setDropped(added.length === 1 ? "Bilden ligger i looken du vill åt." : `${added.length} bilder ligger i looken du vill åt.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    }
  }

  async function saveLook() {
    if (!look) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/outfits", {
        method: "POST",
        body: JSON.stringify({
          title: look.title,
          occasion,
          why: look.why,
          pieceIds: look.pieces.map((piece) => piece.id),
        }),
      });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    } finally {
      setBusy(false);
    }
  }

  const styleImages = data?.images.filter((image) => image.kind === "stil") ?? [];

  return (
    <DropSurface overlay="page" label="Släpp bilden i looken du vill åt" onFiles={(files) => void addStyleImages(files)}>
      <p className="eyebrow">{data ? `${data.dateLabel} · ${data.season}` : "Ateljé"}</p>
      {loading && !data ? <h1>Hämtar garderoben.</h1> : null}
      {error ? <p className="alert" role="alert">{error}</p> : null}
      {dropped ? <p className="banner">{dropped}</p> : null}
      {empty ? (
        <>
          <h1>Tre plagg, sedan tänker Ateljé åt dig.</h1>
          <p className="dek">Lägg in det du äger. Ateljé sätter ihop looks efter färg, säsong och tillfälle, och säger vilket plagg som saknas.</p>
          <ol className="steps">
            <li><b>01</b><span>Mått och skor, så storlekstipsen blir användbara.</span></li>
            <li><b>02</b><span>Stil, budget och bilder på sådant du vill likna.</span></li>
            <li><b>03</b><span>De kläder du redan har. En skjorta, ett par byxor, ett par skor räcker.</span></li>
          </ol>
          <div className="actions">
            <Link className="btn" href="/garderob">Lägg in första plagget</Link>
            <button className="btn-ghost" type="button" onClick={() => void addExamples()} disabled={busy}>Visa en exempelgarderob</button>
          </div>
          <StyleStrip images={styleImages} />
        </>
      ) : null}
      {data && !empty ? (
        <>
          <h1>{look ? look.title : "Ingen färdig look ännu."}</h1>
          <div className="filters" role="group" aria-label="Tillfälle">
            {OCCASIONS.map((item) => (
              <button
                key={item.id}
                className="chip"
                type="button"
                aria-pressed={occasion === item.id}
                onClick={() => {
                  setOccasion(item.id);
                  void load(item.id);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          {data.exampleCount > 0 ? (
            <p className="banner">Exempelplagg ligger i garderoben så du ser hur looks sätts ihop. Ta bort dem när dina egna kläder är inne.</p>
          ) : null}
          {look ? (
            <>
              <p className="why">{look.why}</p>
              <div className="look-row">
                {look.pieces.map((piece) => (
                  <PieceCard key={`${piece.slot}-${piece.id}`} piece={piece} />
                ))}
              </div>
              <div className="actions">
                <button className="btn" type="button" onClick={() => void saveLook()} disabled={busy || saved}>{saved ? "Sparad" : "Spara look"}</button>
                {data.looks.length > 1 ? (
                  <button
                    className="btn-ghost"
                    type="button"
                    onClick={() => {
                      setSaved(false);
                      setIndex((value) => (value + 1) % data.looks.length);
                    }}
                  >
                    En annan · {index + 1} av {data.looks.length}
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <p className="dek">
              {data.missing.length > 0
                ? `Det saknas ${data.missing.join(" och ")} för att en look ska bli färdig.`
                : "Inget i garderoben passar det här tillfället och säsongen. Prova ett annat tillfälle, eller lägg till ett plagg."}
            </p>
          )}
          <StyleStrip images={styleImages} />
          <div className="split">
            <section>
              <h2>Så står garderoben</h2>
              <dl className="balance">
                {data.balance.map((item) => (
                  <div key={item.id}>
                    <dt>{item.label}</dt>
                    <dd>{item.count}</dd>
                  </div>
                ))}
              </dl>
              {!data.profile.waistCm || !data.profile.shoeEu ? (
                <p className="dek" style={{ marginTop: 16 }}>
                  Lägg in midja och skor under <Link href="/profil">Profil</Link>, så får du storlekstips när du ska köpa.
                </p>
              ) : null}
            </section>
            <section>
              <h2>Köp härnäst</h2>
              {nextGap ? (
                <>
                  <p className="why" style={{ fontSize: 26 }}>{nextGap.title}</p>
                  <p className="dek">{nextGap.detail}</p>
                  <p className="meta">{nextGap.priceLabel}{nextGap.brands.length ? ` · ${nextGap.brands.join(", ")}` : ""}</p>
                </>
              ) : (
                <p className="dek">
                  {data.exampleCount > 0
                    ? "Exempelplaggen täcker baserna. Lägg in dina egna innan du köper nytt."
                    : "Baserna finns. När något slits ut är märkena under Att köpa redan sållade."}
                </p>
              )}
              {data.pace ? <p className="dek">{data.pace}</p> : null}
              <Link className="btn-text" href="/kop">Hela inköpslistan</Link>
            </section>
          </div>
        </>
      ) : null}
    </DropSurface>
  );
}

function StyleStrip({ images }: { images: HomeData["images"] }) {
  if (images.length === 0) return <p className="meta">Släpp en bild var som helst på sidan. Den läggs i looken du vill åt.</p>;
  return (
    <section>
      <p className="kicker">Dina stilbilder</p>
      <p className="meta">Släpp en bild var som helst på sidan för att lägga till en till.</p>
      <div className="film">
        {images.map((image) => {
          const src = photoSrc(image.mime, image.data);
          return src ? (
            <figure key={image.id}>
              <img src={src} alt={image.caption || "Stilreferens"} />
              {image.caption ? <figcaption className="meta">{image.caption}</figcaption> : null}
            </figure>
          ) : null;
        })}
      </div>
    </section>
  );
}
