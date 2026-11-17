import type { Metadata } from "next";
import { Garderob } from "../components/Garderob";

export const metadata: Metadata = { title: "Garderoben" };

export default function Page() {
  return <Garderob />;
}
