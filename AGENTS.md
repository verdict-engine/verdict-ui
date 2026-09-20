# AGENTS.md — Verdict UI

Context for AI coding agents working in the Verdict marketing/docs site.
The engine repo (`../verdict-engine`) has the deep `.agents/` folder; this site is
simpler, so its guidance fits here.

## What this is

The public marketing + docs site for the Verdict fraud decisioning engine.
**Next.js (App Router) + TypeScript.** Not the dashboard — the authenticated
rules/analytics console is a separate app (`verdict-dashboard`, planned).

## Conventions

- **Server Components by default.** Add `"use client"` only for genuine
  interactivity (`ThemeToggle`, `InstallCommand`, `LiveConsole`, `Configure`).
- **Design system lives in `app/globals.css`** — CSS variables (tokens) + component
  classes. Don't inline colors; use the tokens. Three-state theming (light / dark /
  system) is handled at the token level — see the `:root`, `prefers-color-scheme`,
  and `[data-theme]` blocks.
- **The only color on the page is a verdict** — `--allow` / `--review` / `--deny`.
  Everything else is monochrome blueprint. Keep it that way.
- **Fonts via `next/font`** (Hanken Grotesk + JetBrains Mono) → `--font-sans` /
  `--font-mono`. No external `<link>` font tags.
- **Content is data-driven** where repeated (features, roadmap, principles) — edit
  the arrays, not the markup.
- No `any`. `npm run type-check` and `npm run lint` must pass.

## Positioning note

Verdict is **channel-agnostic / credit-first** — card & credit systems are
first-class; local rails (Chapa/Telebirr) are one option among many. When editing
copy or the demo console, don't present the product as local-payments-only.

## Commands

`npm run dev` (→ :3000) · `npm run build` · `npm run type-check` · `npm run lint`.
