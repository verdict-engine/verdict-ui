# Verdict UI

Marketing & docs site for the [Verdict](../verdict-engine) fraud decisioning
engine. Next.js (App Router) + TypeScript. A monochrome **blueprint** design where
the only color on the page is a verdict — `allow` / `review` / `deny`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

## Structure

```
app/
├─ layout.tsx        fonts (next/font: Hanken Grotesk + JetBrains Mono), metadata, no-flash theme script
├─ globals.css       the whole design system — tokens, theming (light/dark), components
└─ page.tsx          composes the sections
components/
├─ Nav · ThemeToggle          sticky nav + light/dark toggle (persisted)
├─ Hero · InstallCommand      headline, CTAs, copy-to-clipboard install line
├─ LiveConsole                the verdict console (score animates in)   [client]
├─ Features                   numbered blueprint grid, real UI artifacts
├─ Configure                  tabbed Rule DSL / Policy / API / Log       [client]
├─ Architecture               the bounded-context data-flow diagram (inline SVG)
├─ Roadmap · Ethos            phased roadmap + engineering principles
└─ FinalCta · Footer
```

Server Components by default; only the interactive pieces (`ThemeToggle`,
`InstallCommand`, `LiveConsole`, `Configure`) are `"use client"`.

## Theming

Three states, handled at the token level in `globals.css`: bare `:root` is the
full light palette, `@media (prefers-color-scheme: dark)` (guarded against an
explicit light choice) and `:root[data-theme="dark"]` redefine the tokens. The
toggle sets `data-theme` and persists to `localStorage`; a tiny inline script in
`layout.tsx` applies it before first paint.
