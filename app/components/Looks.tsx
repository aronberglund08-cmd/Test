"use client";

import { useEffect, useState } from "react";
import { OCCASIONS, labelOf, type Occasion } from "@/src/lib/domain";
import { api } from "../lib/api";
import { PieceCard, type PieceView } from "./PieceCard";

type Look = { title: string; why: string; pieces: PieceView[] };
type Saved = {
  id: string;
  title: string;
  occasion: Occasion;
  why: string;
  incomplete: boolean;
  pieces: Array<PieceView | null>;
};

export function Looks() {
  const [occasion, setOccasion] = useState<Occasion>("vardag");
  const [looks, setLooks] = useState<Look[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function load(next: Occasion) {
    setError("");
    try {
      const [suggested, stored] = await Promise.all([
        api<{ looks: Look[]; missing: string[] }>(`/api/suggestions?occasion=${next}`),
        api<Saved[]>("/api/outfits"),
      ]);
      setLooks(suggested.looks.slice(0, 3));
      setMissing(suggested.missing);
      setSaved(stored);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    }
  }

  useEffect(() => {
    void load("vardag");
  }, []);

  async function keep(look: Look) {
    setNote("");
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
      setNote(`"${look.title}" är sparad.`);
      await load(occasion);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    }
  }

  async function remove(id: string) {
    await api(`/api/outfits/${id}`, { method: "DELETE" });
    await load(occasion);
  }

  return (
    <div className="looks-layout">
      <div>
        <p className="eyebrow">Färdiga kombinationer</p>
        <h1>Looks</h1>
        <p className="dek">Tre förslag för tillfället. Du behöver inte välja färg, Ateljé har redan sållat.</p>
        {error ? <p className="alert" role="alert">{error}</p> : null}
        {note ? <p className="banner">{note}</p> : null}
        <div className="filters" role="group" aria-label="Tillfälle">
          {OCCASIONS.map((item) => (
            <button key={item.id} className="chip" type="button" aria-pressed={occasion === item.id} onClick={() => { setOccasion(item.id); void load(item.id); }}>
              {item.label}
            </button>
          ))}
        </div>
        {looks.length === 0 ? <p className="dek">{missing.length ? `Lägg till ${missing.join(" och ")}.` : "Inget passar just det här tillfället."}</p> : null}
        {looks.map((look) => (
          <article key={look.title + look.pieces.map((piece) => piece.id).join()} style={{ marginBottom: 28 }}>
            <h2>{look.title}</h2>
            <p className="why">{look.why}</p>
            <div className="look-row">
              {look.pieces.map((piece) => <PieceCard key={piece.id} piece={piece} />)}
            </div>
            <button className="btn-ghost" type="button" onClick={() => void keep(look)}>Spara look</button>
          </article>
        ))}
        <h2>Sparade</h2>
        {saved.length === 0 ? <p className="dek">Inga sparade looks ännu.</p> : null}
        <ul className="saved-list">
          {saved.map((outfit) => (
            <li key={outfit.id}>
              <h3>{outfit.title}</h3>
              <p className="meta">{labelOf(OCCASIONS, outfit.occasion)}{outfit.incomplete ? " · ett plagg är borta" : ""}</p>
              <p>{outfit.why}</p>
              <p className="meta">{outfit.pieces.filter(Boolean).map((piece) => piece?.name).join(", ")}</p>
              <button className="btn-text" type="button" onClick={() => void remove(outfit.id)}>Ta bort</button>
            </li>
          ))}
        </ul>
      </div>
      <aside>
        <p className="kicker">Så väljs en look</p>
        <ol className="rules">
          <li>En accentfärg. Resten neutralt, så du slipper tänka på krockar.</li>
          <li>Samma formalitet. Kavaj hamnar inte på mjukis.</li>
          <li>Säsongen i Stockholm styr kappa, ull och linne.</li>
          <li>Lösare mot rakare, inte allt oversized på en gång.</li>
          <li>Favoriter vägs upp, utan att varje look blir densamma.</li>
        </ol>
      </aside>
    </div>
  );
}
