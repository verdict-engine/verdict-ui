import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ApiReference } from "@/components/ApiReference";

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
      <Footer />
    </>
  );
}
