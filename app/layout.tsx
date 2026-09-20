import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Verdict — open-source fraud decisioning engine",
  description:
    "Score every event against rules you can read and return allow / review / deny in under 100ms — a modular monolith you can split into services when you outgrow it.",
  metadataBase: new URL("https://verdict.dev"),
  openGraph: {
    title: "Verdict — open-source fraud decisioning engine",
    description:
      "The open-source fraud engine that returns a verdict, not a black box.",
    type: "website",
  },
};

/** Applies a persisted theme before first paint so there is no flash. */
const themeScript = `(function(){try{var t=localStorage.getItem('verdict-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        {/* Runs before the rest of <body> paints — applies a persisted theme with no flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
