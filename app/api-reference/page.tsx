import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ApiReference } from "@/components/ApiReference";
import { SearchHighlight } from "@/components/SearchHighlight";

export const metadata: Metadata = {
  title: "Verdict — API reference",
  description: "Endpoints, request and response definitions for the Verdict fraud decisioning engine.",
};

export default function ApiReferencePage() {
  return (
    <>
      <Nav />
      <main>
        <ApiReference />
      </main>
      <SearchHighlight />
      <Footer />
    </>
  );
}
