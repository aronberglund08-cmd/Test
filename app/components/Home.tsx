"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OCCASIONS, photoSrc, type Occasion } from "@/src/lib/domain";
import { api } from "../lib/api";
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

  return (
    <>
      <p className="eyebrow">{data ? `${data.dateLabel} · ${data.season}` : "Ateljé"}</p>
      {loading && !data ? <h1>Hämtar garderoben.</h1> : null}
      {error ? <p className="alert" role="alert">{error}</p> : null}
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
          {data.images.length > 0 ? (
            <section>
              <p className="kicker">Dina stilbilder</p>
              <div className="film">
                {data.images.filter((image) => image.kind === "stil").map((image) => {
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
          ) : null}
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
    </>
  );
}
