"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AESTHETICS,
  COLORS,
  FITS,
  SIZE_SYSTEMS,
  emptyProfile,
  emptyStyle,
  photoSrc,
  type Profile,
  type StyleImage,
  type StyleProfile,
} from "@/src/lib/domain";
import { sizeHints } from "@/src/lib/sizes";
import { api, compressImage } from "../lib/api";

type Tab = "matt" | "stil";

export function Profil() {
  const [tab, setTab] = useState<Tab>("matt");
  const [profile, setProfile] = useState<Profile>(emptyProfile());
  const [style, setStyle] = useState<StyleProfile>(emptyStyle());
  const [images, setImages] = useState<StyleImage[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    Promise.all([
      api<Profile>("/api/profile"),
      api<StyleProfile & { images: StyleImage[] }>("/api/style"),
    ])
      .then(([nextProfile, nextStyle]) => {
        setProfile(nextProfile);
        setStyle(nextStyle);
        setImages(nextStyle.images ?? []);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Något gick fel."));
  }, []);

  const hints = useMemo(() => sizeHints(profile), [profile]);

  function setMeasure(key: keyof Profile, value: string) {
    setSaved("");
    if (key === "notes" || key === "sizeSystem" || key === "fit") return;
    const cleaned = value.trim().replace(",", ".");
    setProfile((current) => ({ ...current, [key]: cleaned === "" ? null : Number(cleaned) }));
  }

  async function saveProfile() {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      setProfile(await api<Profile>("/api/profile", { method: "PUT", body: JSON.stringify(profile) }));
      setSaved("Måtten är sparade.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    } finally {
      setBusy(false);
    }
  }

  async function saveStyle() {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      setStyle(await api<StyleProfile>("/api/style", { method: "PUT", body: JSON.stringify(style) }));
      setSaved("Stilen är sparad.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    } finally {
      setBusy(false);
    }
  }

  function toggleAesthetic(id: StyleProfile["aesthetics"][number]) {
    setStyle((current) => {
      const has = current.aesthetics.includes(id);
      const aesthetics = has ? current.aesthetics.filter((item) => item !== id) : [...current.aesthetics, id].slice(0, 4);
      return { ...current, aesthetics };
    });
  }

  function toggleColor(list: "palette" | "avoid", id: StyleProfile["palette"][number]) {
    setStyle((current) => {
      const values = current[list];
      const next = values.includes(id) ? values.filter((item) => item !== id) : [...values, id].slice(0, 8);
      return { ...current, [list]: next };
    });
  }

  async function upload(kind: "stil" | "budget", file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      const photo = await compressImage(file);
      const image = await api<StyleImage>("/api/style-images", {
        method: "POST",
        body: JSON.stringify({ kind, photo, caption: "" }),
      });
      setImages((current) => [image, ...current]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    }
  }

  async function caption(id: string, value: string) {
    setImages((current) => current.map((image) => (image.id === id ? { ...image, caption: value } : image)));
    try {
      await api(`/api/style-images/${id}`, { method: "PUT", body: JSON.stringify({ caption: value }) });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    }
  }

  async function removeImage(id: string) {
    await api(`/api/style-images/${id}`, { method: "DELETE" });
    setImages((current) => current.filter((image) => image.id !== id));
  }

  async function resetAll() {
    setBusy(true);
    try {
      await api("/api/reset", { method: "POST", body: JSON.stringify({ confirm: "radera" }) });
      setProfile(emptyProfile());
      setStyle(emptyStyle());
      setImages([]);
      setConfirmReset(false);
      setSaved("Garderoben är raderad.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="eyebrow">Bara för dig</p>
      <h1>Mått och stil</h1>
      <p className="dek">Måtten stannar i din garderob. De används till storlekstips och inget annat.</p>
      <div className="filters" role="tablist">
        <button className="chip" type="button" aria-pressed={tab === "matt"} onClick={() => setTab("matt")}>Mått</button>
        <button className="chip" type="button" aria-pressed={tab === "stil"} onClick={() => setTab("stil")}>Stil och budget</button>
      </div>
      {error ? <p className="alert" role="alert">{error}</p> : null}
      {saved ? <p className="banner">{saved}</p> : null}
      {tab === "matt" ? (
        <div className="profile-grid">
          <div>
            <div className="fields">
              <label className="field">Storlekssystem
                <select value={profile.sizeSystem} onChange={(event) => setProfile({ ...profile, sizeSystem: event.target.value as Profile["sizeSystem"] })}>
                  {SIZE_SYSTEMS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <label className="field">Önskad passform
                <select value={profile.fit} onChange={(event) => setProfile({ ...profile, fit: event.target.value as Profile["fit"] })}>
                  {FITS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              <Measure label="Längd, cm" value={profile.heightCm} onChange={(value) => setMeasure("heightCm", value)} />
              <Measure label="Byst eller bröstkorg, cm" value={profile.chestCm} onChange={(value) => setMeasure("chestCm", value)} />
              <Measure label="Midja, cm" value={profile.waistCm} onChange={(value) => setMeasure("waistCm", value)} />
              <Measure label="Höft, cm" value={profile.hipsCm} onChange={(value) => setMeasure("hipsCm", value)} />
              <Measure label="Axelbredd, cm" value={profile.shoulderCm} onChange={(value) => setMeasure("shoulderCm", value)} />
              <Measure label="Innerben, cm" value={profile.inseamCm} onChange={(value) => setMeasure("inseamCm", value)} />
              <Measure label="Ärmlängd, cm" value={profile.sleeveCm} onChange={(value) => setMeasure("sleeveCm", value)} />
              <Measure label="Hals, cm" value={profile.neckCm} onChange={(value) => setMeasure("neckCm", value)} />
              <Measure label="Skor, EU" value={profile.shoeEu} onChange={(value) => setMeasure("shoeEu", value)} />
              <label className="field wide">Anteckning om passform
                <textarea value={profile.notes} onChange={(event) => setProfile({ ...profile, notes: event.target.value })} />
              </label>
            </div>
            <div className="actions">
              <button className="btn" type="button" disabled={busy} onClick={() => void saveProfile()}>Spara mått</button>
            </div>
          </div>
          <aside className="hints">
            <p className="kicker">Att säga i butik</p>
            {hints.length === 0 ? <p>Fyll i måtten så skrivs storlekstipsen här.</p> : hints.map((line) => <p key={line}>{line}</p>)}
          </aside>
        </div>
      ) : (
        <div>
          <h2>Riktning</h2>
          <p className="dek">Välj högst fyra. De styr både looks och vilka märken som föreslås.</p>
          {AESTHETICS.map((item) => (
            <button key={item.id} className="choice" type="button" aria-pressed={style.aesthetics.includes(item.id)} onClick={() => toggleAesthetic(item.id)}>
              <strong>{item.label}</strong>
              <span>{item.text}</span>
            </button>
          ))}
          <h2>Färger du vill se</h2>
          <ColorPick values={style.palette} onToggle={(id) => toggleColor("palette", id)} />
          <h2>Färger att undvika</h2>
          <ColorPick values={style.avoid} onToggle={(id) => toggleColor("avoid", id)} />
          <div className="fields" style={{ marginTop: 16 }}>
            <label className="field">Budget per månad, kr
              <input inputMode="numeric" value={style.monthBudgetSek ?? ""} onChange={(event) => setStyle({ ...style, monthBudgetSek: event.target.value === "" ? null : Number(event.target.value) })} />
            </label>
            <label className="field">Tak per plagg, kr
              <input inputMode="numeric" value={style.itemBudgetSek ?? ""} onChange={(event) => setStyle({ ...style, itemBudgetSek: event.target.value === "" ? null : Number(event.target.value) })} />
            </label>
            <label className="field wide">Med egna ord
              <textarea value={style.notes} onChange={(event) => setStyle({ ...style, notes: event.target.value })} placeholder="Till exempel: mörka färger, inga logotyper, kappa viktigare än skor." />
            </label>
          </div>
          <div className="actions">
            <button className="btn" type="button" disabled={busy} onClick={() => void saveStyle()}>Spara stil</button>
          </div>
          <ImageGroup title="Stilbilder" text="Ladda upp plagg, looks eller personer vars snitt du vill åt." kind="stil" images={images} onUpload={upload} onCaption={caption} onRemove={removeImage} />
          <ImageGroup title="Budgetbilder" text="En skärmbild på ett plagg med pris, eller en påse du tycker är rimlig. Skriv beloppet i bildtexten." kind="budget" images={images} onUpload={upload} onCaption={caption} onRemove={removeImage} />
        </div>
      )}
      <p style={{ marginTop: 48 }}>
        <button className="btn-text" type="button" disabled={busy} onClick={() => (confirmReset ? void resetAll() : setConfirmReset(true))}>
          {confirmReset ? "Radera allt på riktigt" : "Radera hela garderoben"}
        </button>
      </p>
    </>
  );
}

function Measure({ label, value, onChange }: { label: string; value: number | null; onChange: (value: string) => void }) {
  return (
    <label className="field">{label}
      <input inputMode="decimal" value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ColorPick({ values, onToggle }: { values: string[]; onToggle: (id: StyleProfile["palette"][number]) => void }) {
  return (
    <div className="colors" style={{ marginBottom: 16 }}>
      {COLORS.map((color) => (
        <button key={color.id} type="button" aria-label={color.label} aria-pressed={values.includes(color.id)} style={{ background: color.hex }} onClick={() => onToggle(color.id)} />
      ))}
    </div>
  );
}

function ImageGroup({
  title,
  text,
  kind,
  images,
  onUpload,
  onCaption,
  onRemove,
}: {
  title: string;
  text: string;
  kind: "stil" | "budget";
  images: StyleImage[];
  onUpload: (kind: "stil" | "budget", file: File | undefined) => void;
  onCaption: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}) {
  const mine = images.filter((image) => image.kind === kind);
  return (
    <section style={{ marginTop: 28 }}>
      <h2>{title}</h2>
      <p className="dek">{text}</p>
      <label className="btn-ghost">
        Ladda upp bild
        <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => onUpload(kind, event.target.files?.[0])} />
      </label>
      <div className="grid" style={{ marginTop: 12 }}>
        {mine.map((image) => {
          const src = photoSrc(image.mime, image.data);
          return (
            <figure key={image.id} className="piece">
              {src ? <img src={src} alt={image.caption || title} style={{ aspectRatio: "3/4", objectFit: "cover", width: "100%" }} /> : null}
              <figcaption>
                <input aria-label="Bildtext" defaultValue={image.caption} placeholder="Vad vill du åt?" onBlur={(event) => onCaption(image.id, event.target.value)} />
                <button className="btn-text" type="button" onClick={() => onRemove(image.id)}>Ta bort</button>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
