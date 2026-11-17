import type { Metadata } from "next";
import { Looks } from "../components/Looks";

export const metadata: Metadata = { title: "Looks" };

export default function Page() {
  return <Looks />;
}
