"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORIES,
  COLORS,
  CONDITIONS,
  FITS,
  FORMALITIES,
  MATERIALS,
  SEASONS,
  colorById,
  photoSrc,
  subcategoryLabel,
  type Category,
  type Garment,
  type Season,
} from "@/src/lib/domain";
import { api, compressImage } from "../lib/api";
import { PieceCard } from "./PieceCard";

type Draft = {
  name: string;
  category: Category;
  subcategory: string;
  color: string;
  patterned: boolean;
  material: string;
  brand: string;
  seasons: Season[];
  formality: string;
  silhouette: string;
  condition: string;
  priceSek: string;
  fitNote: string;
  notes: string;
  favorite: boolean;
  inRotation: boolean;
  photo: string | null;
  photoMime: string | null;
  photoData: string | null;
  clearPhoto: boolean;
};

function emptyDraft(): Draft {
  return {
    name: "",
    category: "overdel",
    subcategory: "skjorta",
    color: "marin",
    patterned: false,
    material: "bomull",
    brand: "",
    seasons: ["alla"],
    formality: "vardag",
    silhouette: "normal",
    condition: "bra",
    priceSek: "",
    fitNote: "",
    notes: "",
    favorite: false,
    inRotation: true,
    photo: null,
    photoMime: null,
    photoData: null,
    clearPhoto: false,
  };
}

function fromGarment(garment: Garment): Draft {
  return {
    name: garment.name,
    category: garment.category,
    subcategory: garment.subcategory,
    color: garment.color,
    patterned: garment.patterned,
    material: garment.material,
    brand: garment.brand,
    seasons: garment.seasons,
    formality: garment.formality,
    silhouette: garment.silhouette,
    condition: garment.condition,
    priceSek: garment.priceSek === null ? "" : String(garment.priceSek),
    fitNote: garment.fitNote,
    notes: garment.notes,
    favorite: garment.favorite,
    inRotation: garment.inRotation,
    photo: null,
    photoMime: garment.photoMime,
    photoData: garment.photoData,
    clearPhoto: false,
  };
}

export function Garderob() {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [filter, setFilter] = useState<string>("alla");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pairings, setPairings] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogOpen = draft !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [dialogOpen]);

  async function load() {
    setError("");
    try {
      setGarments(await api<Garment[]>("/api/garments"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!editing) {
      setPairings([]);
      return;
    }
    api<{ looks: Array<{ pieces: Array<{ name: string }> }> }>(`/api/suggestions?anchor=${editing}&occasion=vardag`)
      .then((result) => setPairings(result.looks.map((look) => look.pieces.map((piece) => piece.name).join(", "))))
      .catch(() => setPairings([]));
  }, [editing]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return garments.filter((garment) => {
      if (filter !== "alla" && garment.category !== filter) return false;
      if (!needle) return true;
      return `${garment.name} ${garment.brand}`.toLowerCase().includes(needle);
    });
  }, [garments, filter, query]);

  function patch(partial: Partial<Draft>) {
    setDraft((current) => (current ? { ...current, ...partial } : current));
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    try {
      const photo = await compressImage(file);
      patch({ photo, clearPhoto: false });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bilden gick inte att läsa.");
    }
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError("");
    const payload: Record<string, unknown> = {
      ...draft,
      priceSek: draft.priceSek === "" ? null : Number(draft.priceSek),
      photo: draft.photo,
    };
    if (!draft.photo && !draft.clearPhoto) delete payload.photo;
    if (draft.clearPhoto) payload.photo = null;
    try {
      if (editing) await api(`/api/garments/${editing}`, { method: "PUT", body: JSON.stringify(payload) });
      else await api("/api/garments", { method: "POST", body: JSON.stringify(payload) });
      setDraft(null);
      setEditing(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!editing) return;
    setBusy(true);
    try {
      await api(`/api/garments/${editing}`, { method: "DELETE" });
      setDraft(null);
      setEditing(null);
      setConfirmDelete(false);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    } finally {
      setBusy(false);
    }
  }

  const subs = CATEGORIES.find((category) => category.id === draft?.category)?.subs ?? [];
  const preview = draft?.photo
    ? `data:image/jpeg;base64,${draft.photo}`
    : draft && !draft.clearPhoto
      ? photoSrc(draft.photoMime, draft.photoData)
      : null;

  return (
    <>
      <div className="page-head">
        <div>
          <p className="eyebrow">Det du äger</p>
          <h1>Garderoben</h1>
        </div>
        <button className="btn" type="button" onClick={() => { setEditing(null); setConfirmDelete(false); setDraft(emptyDraft()); }}>
          Lägg in plagg
        </button>
      </div>
      <p className="dek">Namn, färg, säsong och hur formellt det är. Det räcker för att Ateljé ska kunna kombinera.</p>
      {error ? <p className="alert" role="alert">{error}</p> : null}
      <div className="filters">
        <button className="chip" type="button" aria-pressed={filter === "alla"} onClick={() => setFilter("alla")}>Allt</button>
        {CATEGORIES.filter((category) => category.id !== "accessoar").map((category) => (
          <button key={category.id} className="chip" type="button" aria-pressed={filter === category.id} onClick={() => setFilter(category.id)}>
            {category.label}
          </button>
        ))}
      </div>
      <label className="field" style={{ maxWidth: 320, marginBottom: 16 }}>
        Sök
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Namn eller märke" />
      </label>
      {visible.length === 0 ? <p className="dek">Inga plagg här ännu.</p> : null}
      <div className="grid">
        {visible.map((garment) => (
          <button
            key={garment.id}
            className="piece"
            type="button"
            onClick={() => {
              setEditing(garment.id);
              setConfirmDelete(false);
              setDraft(fromGarment(garment));
            }}
          >
            <PieceCard piece={garment} />
          </button>
        ))}
      </div>
      {draft ? (
        <dialog
          ref={dialogRef}
          aria-labelledby="plagg-rubrik"
          onClose={() => {
            setDraft(null);
            setEditing(null);
          }}
        >
          <div className="dialog-body">
            <div className="dialog-head">
              <h2 id="plagg-rubrik">{editing ? "Ändra plagg" : "Nytt plagg"}</h2>
              <div className="row">
                <button className="btn" type="button" disabled={busy} onClick={() => void save()}>Spara plagg</button>
                <button className="btn-text" type="button" onClick={() => dialogRef.current?.close()}>Stäng</button>
              </div>
            </div>
            <div className="dialog-scroll">
            <div className="fields">
              <label className="field wide">Namn
                <input value={draft.name} onChange={(event) => patch({ name: event.target.value })} />
              </label>
              <label className="field">Kategori
                <select value={draft.category} onChange={(event) => {
                  const category = event.target.value as Category;
                  const next = CATEGORIES.find((item) => item.id === category)?.subs[0]?.id ?? "";
                  patch({ category, subcategory: next });
                }}>
                  {CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
                </select>
              </label>
              <label className="field">Typ
                <select value={draft.subcategory} onChange={(event) => patch({ subcategory: event.target.value })}>
                  {subs.map((sub) => <option key={sub.id} value={sub.id}>{sub.label}</option>)}
                </select>
              </label>
              <div className="field wide">
                <span>Färg · {colorById(draft.color)?.label}</span>
                <div className="colors">
                  {COLORS.map((color) => (
                    <button key={color.id} type="button" aria-label={color.label} aria-pressed={draft.color === color.id} style={{ background: color.hex }} onClick={() => patch({ color: color.id })} />
                  ))}
                </div>
              </div>
              <label className="field">Material
                <select value={draft.material} onChange={(event) => patch({ material: event.target.value })}>
                  {MATERIALS.map((material) => <option key={material.id || "okand"} value={material.id}>{material.label}</option>)}
                </select>
              </label>
              <label className="field">Märke
                <input value={draft.brand} onChange={(event) => patch({ brand: event.target.value })} />
              </label>
              <label className="field">Formalitet
                <select value={draft.formality} onChange={(event) => patch({ formality: event.target.value })}>
                  {FORMALITIES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label className="field">Silhuett
                <select value={draft.silhouette} onChange={(event) => patch({ silhouette: event.target.value })}>
                  {FITS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <div className="field wide">
                <span>Säsong</span>
                <div className="filters">
                  {SEASONS.map((season) => (
                    <button
                      key={season.id}
                      className="chip"
                      type="button"
                      aria-pressed={draft.seasons.includes(season.id)}
                      onClick={() => {
                        if (season.id === "alla") patch({ seasons: ["alla"] });
                        else {
                          const without = draft.seasons.filter((item) => item !== "alla" && item !== season.id);
                          const next = draft.seasons.includes(season.id) ? without : [...without, season.id];
                          patch({ seasons: next.length ? next as Season[] : ["alla"] });
                        }
                      }}
                    >
                      {season.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="field">Skick
                <select value={draft.condition} onChange={(event) => patch({ condition: event.target.value })}>
                  {CONDITIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label className="field">Pris, kr
                <input inputMode="numeric" value={draft.priceSek} onChange={(event) => patch({ priceSek: event.target.value })} />
              </label>
              <label className="field wide">Passform
                <input value={draft.fitNote} onChange={(event) => patch({ fitNote: event.target.value })} placeholder="Till exempel: stor i axeln, ta en mindre" />
              </label>
              <label className="field wide">Anteckning
                <textarea value={draft.notes} onChange={(event) => patch({ notes: event.target.value })} />
              </label>
              <label className="field check"><input type="checkbox" checked={draft.patterned} onChange={(event) => patch({ patterned: event.target.checked })} /> Mönstrad</label>
              <label className="field check"><input type="checkbox" checked={draft.favorite} onChange={(event) => patch({ favorite: event.target.checked })} /> Favorit, välj den oftare</label>
              <label className="field check wide"><input type="checkbox" checked={draft.inRotation} onChange={(event) => patch({ inRotation: event.target.checked })} /> Ta med i looks</label>
              <label className="field wide">Bild
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void onPhoto(event.target.files?.[0])} />
              </label>
            </div>
            {preview ? <img src={preview} alt="" style={{ width: 160, marginTop: 12 }} /> : null}
            {preview ? <button className="btn-text" type="button" onClick={() => patch({ photo: null, photoData: null, photoMime: null, clearPhoto: true })}>Ta bort bild</button> : null}
            {pairings.length > 0 ? (
              <section>
                <h2 style={{ fontSize: 22, marginTop: 18 }}>Går ihop med</h2>
                {pairings.map((line) => <p key={line} className="mini-look">{line}</p>)}
              </section>
            ) : null}
            {editing ? (
              <button className="btn-text" type="button" disabled={busy} onClick={() => (confirmDelete ? void remove() : setConfirmDelete(true))}>
                {confirmDelete ? "Ta bort på riktigt" : "Ta bort plagg"}
              </button>
            ) : null}
            <p className="meta">{subcategoryLabel(draft.subcategory)}</p>
            </div>
          </div>
        </dialog>
      ) : null}
    </>
  );
}
