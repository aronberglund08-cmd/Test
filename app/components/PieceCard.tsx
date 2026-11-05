import { colorById, photoSrc, subcategoryLabel } from "@/src/lib/domain";

const REVIEW_LABEL = { behall: "Behåll", justera: "Justera", salj: "Sälj" } as const;

export type PieceView = {
  id: string;
  name: string;
  brand?: string;
  subcategory: string;
  color: string;
  photoMime?: string | null;
  photoData?: string | null;
  review?: { verdict: keyof typeof REVIEW_LABEL } | null;
};

export function PieceCard({ piece }: { piece: PieceView }) {
  const color = colorById(piece.color);
  const src = photoSrc(piece.photoMime, piece.photoData);
  const meta = [piece.brand, subcategoryLabel(piece.subcategory), color?.label].filter(Boolean).join(" · ");
  return (
    <figure className="piece">
      <div className="card-photo" style={{ background: color?.hex ?? "#ddd" }}>
        {src ? <img src={src} alt="" /> : null}
      </div>
      <figcaption>
        <strong>{piece.name}</strong>
        <span>{meta}</span>
        {piece.review ? <span className="badge">{REVIEW_LABEL[piece.review.verdict]}</span> : null}
      </figcaption>
    </figure>
  );
}
