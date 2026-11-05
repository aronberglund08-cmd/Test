import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <p className="eyebrow">Ateljé</p>
      <h1>Sidan finns inte.</h1>
      <Link className="btn" href="/">Till idag</Link>
    </>
  );
}
