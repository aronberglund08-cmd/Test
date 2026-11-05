"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/src/lib/domain";
import { photoSrc } from "@/src/lib/domain";
import type { FitAnswers, VerdictId } from "@/src/lib/verdict";
import { api, compressImage } from "../lib/api";
import { PhotoGuide } from "./PhotoGuide";

const QUESTIONS: { key: keyof FitAnswers; label: string; options: [string, string][] }[] = [
  {
    key: "shoulder",
    label: "Axelsömmen",
    options: [
      ["bra", "Ligger på axelspetsen"],
      ["forbi", "Ramlar ut på armen"],
      ["drar", "Sitter indragen och drar"],
      ["syns-inte", "Syns inte"],
    ],
  },
  {
    key: "ease",
    label: "Över bröst, rygg eller höft",
    options: [
      ["bra", "Ligger slätt, med lite luft"],
      ["glapp", "Påsar eller glipar"],
      ["stramt", "Vågräta dragningar"],
      ["syns-inte", "Syns inte"],
    ],
  },
  {
    key: "waist",
    label: "Midjan",
    options: [
      ["bra", "Ett litet veck går att nypa"],
      ["glapp", "En hel hand tyg över"],
      ["stramt", "Inget tyg att nypa, den stramar"],
      ["syns-inte", "Syns inte eller är inte en midja"],
    ],
  },
  {
    key: "length",
    label: "Längd och fåll",
    options: [
      ["bra", "Slutar där den ska"],
      ["kort", "För kort"],
      ["lang", "För lång, går att korta"],
      ["syns-inte", "Syns inte"],
    ],
  },
  {
    key: "fabric",
    label: "Tyg och kvalitet",
    options: [
      ["bra", "Tätt, helt, ingen blank slityta"],
      ["tunn", "Tunt mot ljuset"],
      ["sliten", "Noppor, hål eller blankt säte"],
      ["syns-inte", "Syns inte"],
    ],
  },
  {
    key: "style",
    label: "Stilen mot garderoben du bygger",
    options: [
      ["ratt", "Skulle kunna ligga i en look du redan har"],
      ["tveksam", "Möjlig, men inte självklar"],
      ["fel", "Hör inte hemma i stilen"],
    ],
  },
];

type ReviewPayload = FitAnswers & {
  verdict: VerdictId;
  summary: string;
  photoMime: string | null;
  photoData: string | null;
};

const LABELS: Record<VerdictId, string> = {
  behall: "Behåll",
  justera: "Justera",
  salj: "Sälj",
};

export function FitReview({
  garmentId,
  category,
  onReview,
}: {
  garmentId: string;
  category: Category;
  onReview: (review: { verdict: VerdictId; summary: string }) => void;
}) {
  const [answers, setAnswers] = useState<Partial<FitAnswers>>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoMime, setPhotoMime] = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [clearPhoto, setClearPhoto] = useState(false);
  const [result, setResult] = useState<{ verdict: VerdictId; summary: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let gone = false;
    api<{ review: ReviewPayload | null }>(`/api/garments/${garmentId}/review`)
      .then((data) => {
        if (gone || !data.review) return;
        const review = data.review;
        setAnswers({
          shoulder: review.shoulder,
          ease: review.ease,
          waist: review.waist,
          length: review.length,
          fabric: review.fabric,
          style: review.style,
        });
        setPhotoMime(review.photoMime);
        setPhotoData(review.photoData);
        setResult({ verdict: review.verdict, summary: review.summary });
      })
      .catch((cause: unknown) => {
        if (!gone) setError(cause instanceof Error ? cause.message : "Något gick fel.");
      });
    return () => {
      gone = true;
    };
  }, [garmentId]);

  const ready = QUESTIONS.every((question) => answers[question.key]);
  const preview = photo ? `data:image/jpeg;base64,${photo}` : !clearPhoto ? photoSrc(photoMime, photoData) : null;

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    try {
      setPhoto(await compressImage(file));
      setClearPhoto(false);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Bilden gick inte att läsa.");
    }
  }

  async function submit() {
    if (!ready) return;
    setBusy(true);
    setError("");
    const body: Record<string, unknown> = { answers };
    if (photo) body.photo = photo;
    if (clearPhoto) body.photo = null;
    try {
      const saved = await api<ReviewPayload>(`/api/garments/${garmentId}/review`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setResult({ verdict: saved.verdict, summary: saved.summary });
      setPhotoMime(saved.photoMime);
      setPhotoData(saved.photoData);
      setPhoto(null);
      setClearPhoto(false);
      onReview({ verdict: saved.verdict, summary: saved.summary });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Något gick fel.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="review">
      <h2>Sitter det här?</h2>
      <p className="dek">
        Ateljé ser inte bilden. Du kryssar i det som syns på kortet du just tog, så vägs det mot om du redan har ett likadant plagg och om det är en bas du saknar.
      </p>
      <details className="measure-help">
        <summary>Så tar du bilden på kroppen</summary>
        <PhotoGuide category={category} part="body" />
      </details>
      <label className="field wide">Bild på kroppen, bara för passformen
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void onPhoto(event.target.files?.[0])} />
      </label>
      {preview ? <img src={preview} alt="" style={{ width: 160, marginTop: 8 }} /> : null}
      {preview ? (
        <button className="btn-text" type="button" onClick={() => { setPhoto(null); setPhotoData(null); setPhotoMime(null); setClearPhoto(true); }}>
          Ta bort bilden på kroppen
        </button>
      ) : null}
      {QUESTIONS.map((question) => (
        <fieldset key={question.key} className="choice-row">
          <legend>{question.label}</legend>
          {question.options.map(([value, label]) => (
            <label key={value} className="field check">
              <input
                type="radio"
                name={`${garmentId}-${question.key}`}
                style={{ width: "auto", flex: "none" }}
                checked={answers[question.key] === value}
                onChange={() => setAnswers((current) => ({ ...current, [question.key]: value as FitAnswers[typeof question.key] }))}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      ))}
      <button className="btn" type="button" disabled={!ready || busy} onClick={() => void submit()}>
        Få förslag
      </button>
      {error ? <p className="alert" role="alert">{error}</p> : null}
      {result ? (
        <div className={`verdict verdict-${result.verdict}`}>
          <strong>{LABELS[result.verdict]}</strong>
          <p>{result.summary}</p>
        </div>
      ) : null}
    </section>
  );
}
