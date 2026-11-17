import type { Metadata } from "next";
import { Profil } from "../components/Profil";

export const metadata: Metadata = { title: "Profil" };

export default function Page() {
  return <Profil />;
}
