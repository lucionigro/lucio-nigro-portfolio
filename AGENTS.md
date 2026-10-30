<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Portfolio frontend and motion

For frontend, visual, animation, and responsive work, read and apply
`.agents/skills/design-taste-frontend/SKILL.md` before changing the interface.
The skill is installed in this repository and is available to subsequent agent turns.
Preserve Lucio's real biographical information and photographs. Use the neutral
charcoal palette in `src/app/globals.css`; reserve material colors for physical
objects inside the room. Avoid decorative eyebrows, blue mesh gradients, gold UI
accents, invented statistics, and generic marketing claims.

## Navigation architecture

Use one shared menu with `/work`, `/about`, and `/photography`. The name links
to `/`. Room objects open those routes directly; music, cinema, and books link
to their sections on `/about`. Do not restore the old object dock, inspector
carousel, or intermediate Details panels. Keep English as the initial language
and preserve language state across client navigation. Photographs must retain
their supplied source files; the gallery viewer uses the originals. Every route
has server-rendered metadata, canonical and JSON-LD in `portfolio-seo.ts`.
