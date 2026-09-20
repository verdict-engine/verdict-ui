import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { LiveConsole } from "@/components/LiveConsole";
import { Features } from "@/components/Features";
import { Configure } from "@/components/Configure";
import { Architecture } from "@/components/Architecture";
import { Roadmap } from "@/components/Roadmap";
import { Ethos } from "@/components/Ethos";
import { FinalCta } from "@/components/FinalCta";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <LiveConsole />
        <Features />
        <Configure />
        <Architecture />
        <Roadmap />
        <Ethos />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
