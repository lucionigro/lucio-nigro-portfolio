# Lucio Nigro: a room full of stories

A bilingual portfolio built around a navigable Three.js diorama. Five objects connect software engineering, cinema, music, books, and film photography.

## Run locally

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 5190
```

## Verify and preview a production build locally

```sh
npm run lint
npm run build
npm run start -- --hostname 127.0.0.1 --port 5190
```

English is the default. The language switch updates visible text, document language, metadata, and accessible labels.

## Interactions

One shared menu opens Work, About and Photography. The name returns home. Room objects link directly to those routes; the guitar, television and books open their sections on About. English is the initial language and stays selected across client navigation. The original pixel artwork provides a WebGL fallback.

The room uses local Three.js geometry with GSAP camera transitions. The guitar is modelled after a Butterscotch Blonde Squier Classic Vibe ’50s Telecaster, with a black pickguard, maple fretboard, inline tuners and three-saddle bridge. The Canon AV-1 uses its silver pentaprism, leatherette body and FD lens details. Hovering the guitar gently plucks its strings.

The MacBook types a scripted local terminal session (it does not execute commands). The television animates a crop extracted from the original room artwork, with a moving spiral around the falling figure. A layered city outside the window has moving clouds, traffic, building lights, sun and moon. One full light cycle takes 120 seconds of active viewing: midnight at the start, noon around 60 seconds, then night again. Room and desk lighting respond to the same clock.

All ambient motion shares the renderer loop, capped at 30 fps. It stops when paused, outside the viewport, hidden or under reduced-motion preferences. The clock resumes from the same point. GPU resources and tweens are disposed on unmount.

The original photographs, professional experience, and personal interests are preserved. Native dialogs retain focus containment, Escape dismissal, and focus return.

## Source map

- `src/components/spatial/models.ts`: room, camera, Telecaster and other object geometry.
- `src/components/spatial/live-surfaces.ts`: terminal, original-artwork film shader and city cycle.
- `src/components/spatial/room-world.tsx`: WebGL lifecycle, shared clock, controls and camera transitions.
- `src/components/portfolio/home-room.tsx`: room portal and accessible direct links.
- `src/components/portfolio/site-shell.tsx`: shared navigation and language state.
- `src/components/portfolio/content-pages.tsx`: route content and original-photo viewer.
- `src/lib/portfolio-seo.ts`: per-route metadata and server-rendered JSON-LD.
- `src/app/globals.css`: responsive design and dialogs.
- `RECOVERY.json`: file hashes from the original Vercel deployment, before local changes.
- `work/before-spatial/`: local snapshot of the earlier room interface.

This directory was recovered from deployment `dpl_BY4XMcFFJhFfMfcfV8tY2GmnCjF1`. The Vercel project had no Git repository connection, so that deployment's Git history is not available. Published to https://www.lucionigro.com/ on 2026-10-16 through Vercel deployment `dpl_2byeF4vHusun2uCK4wgb5x7UXVcw` (production, READY). The deployed source is the local recovered project; no Git commit is associated with this release.
