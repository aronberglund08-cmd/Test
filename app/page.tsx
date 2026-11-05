import type { Metadata } from "next";
import { Home } from "./components/Home";

export const metadata: Metadata = { title: "Idag" };

export default function Page() {
  return <Home />;
}
