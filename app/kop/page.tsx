import type { Metadata } from "next";
import { Kop } from "../components/Kop";

export const metadata: Metadata = { title: "Att köpa" };

export default function Page() {
  return <Kop />;
}
