import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { DocsContent } from "@/components/DocsContent";

export const metadata: Metadata = {
  title: "Verdict — Docs",
  description: "Integrate, configure, and self-host the Verdict fraud decisioning engine.",
};

export default function DocsPage() {
  return (
    <>
      <Nav />
      <main>
        <DocsContent />
      </main>
      <Footer />
    </>
  );
}
