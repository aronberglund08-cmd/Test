"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

const LINKS = [
  { href: "/", label: "Idag" },
  { href: "/garderob", label: "Garderob" },
  { href: "/outfits", label: "Looks" },
  { href: "/kop", label: "Att köpa" },
  { href: "/profil", label: "Profil" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    api<{ name: string; stage: string }>("/api/me")
      .then((me) => {
        setName(me.name);
        setPreview(me.stage === "preview");
      })
      .catch(() => setName(""));
  }, []);

  const current = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="shell">
      <a className="btn-text" href="#innehall" style={{ position: "absolute", left: 8, top: -40 }}>
        Till innehållet
      </a>
      <aside className="nav">
        <Link href="/" className="wordmark">
          Ateljé
          <small>Garderob</small>
        </Link>
        <nav className="nav-links" aria-label="Sidor">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} aria-current={current(link.href) ? "page" : undefined}>
              {link.label}
            </Link>
          ))}
        </nav>
        {name ? <p className="nav-foot">{name}</p> : null}
      </aside>
      <div>
        <header className="topbar">
          <Link href="/">Ateljé</Link>
          {name ? <span className="meta">{name}</span> : null}
        </header>
        {preview ? <p className="banner" style={{ margin: "0 16px" }}>Förhandsvisning. Den här garderoben är skild från den publicerade.</p> : null}
        <main id="innehall" className="main">
          {children}
        </main>
      </div>
      <nav className="tabbar" aria-label="Sidor">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} aria-current={current(link.href) ? "page" : undefined}>
            {link.href === "/garderob" ? "Plagg" : link.href === "/kop" ? "Köp" : link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
