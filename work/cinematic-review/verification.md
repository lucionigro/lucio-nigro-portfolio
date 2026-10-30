# Portfolio visual revision

Implemented locally and published to production on 2026-10-18 (Argentina time).

The home scene now uses an asymmetric composition, charcoal and silver UI, a circular stage, a choreographed type entrance and camera dolly, subtle pointer parallax, and object highlighting with light and a small lift. Content pages share the revised typography, colors, and scroll reveals. The photography gallery uses a staggered two-column composition and retains the original files in its viewer.

Preserved: original copy, five room objects and their routes, English initial language, Spanish state across client navigation, all six photographs, CV links, metadata, canonical URLs, JSON-LD and sitemap.

Verification:
- ESLint passed.
- Production build and TypeScript passed.
- 45 SEO checks passed against http://127.0.0.1:3101.
- Browser inspection at 320, 390, 768, 1024 and 1440 CSS px; mobile framing and the 320px scrollbar overflow were corrected.
- Spanish remained selected across client navigation to Work and Photography.
- Books object arrived at /about#books below the fixed header.
- Photo viewer loaded the original asset, advanced, closed and returned keyboard focus.
- Pause/resume, zoom and reset controls responded correctly.
- Reduced motion is handled in GSAP, CSS and Three.js. Browser media emulation was not available, so the OS preference was reviewed in code rather than toggled in this session.
- Final compiled scene rendered without runtime errors. An obsolete Three.js shadow-map option found during review was replaced with the supported PCFShadowMap.

Local compiled preview: http://127.0.0.1:3101
Original source backup: work/cinematic-before/src
Visual captures: home-desktop.jpg, home-mobile.jpg, photography-desktop.jpg

There is no .git directory in this checkout. This release was deployed from local source, without an associated Git commit; source hashes are recorded in release-source-manifest.json.


## Production release

- Live: https://www.lucionigro.com/ (https://lucionigro.com/ redirects with HTTP 308).
- Deployment: dpl_8QFQ5jpR4mdeLCLAMBcAe4Qwtm6h, READY, target production.
- Immutable deployment: https://lucio-nigro-portfolio-q11kxvlav-lnigrot-5774s-projects.vercel.app
- Project: prj_nPubJWfxpPebnNMZYbXCfAa7Z94X; scope: lnigrot-5774s-projects.
- Remote production build and TypeScript passed; build duration 23 seconds.
- Staged production was checked via authenticated Vercel fetch before promotion. The unauthenticated CLI curl response was an authentication page and was not accepted as evidence.
- Promotion alias mapping completed for lucionigro.com, www.lucionigro.com and lucio-nigro-portfolio.vercel.app.
- All 45 SEO checks passed on https://www.lucionigro.com.
- Public HTML contains the revised stage/typography markers and all four requested captions.
- Browser verification on the public site confirmed the new 3D room, the four visible gallery captions, and Ziggy's original image in the viewer. No console warnings or errors were recorded during these checks.
- All six photo originals, room artwork, and both CV PDFs returned HTTP 200 and matched local SHA-256 hashes; evidence in production-assets.json.
- No error/fatal runtime logs were returned during the initial ten-minute check. No log drains are configured; this is a bounded release check, not ongoing monitoring.
- Source manifest SHA-256: 0fc9f198dc1e88094a1df919b1da8ddc9983c3a60732a3bd2fcb65bb01fb4d88.
- Previous ready production retained as a rollback candidate: dpl_2byeF4vHusun2uCK4wgb5x7UXVcw.
- Live screenshot: production-home.jpg.

Requested captions are now San Martín de los Andes; Villa La Angostura; Cerro Campanario, Bariloche; and My dogg, Ziggy (English) / Mi perro, Ziggy (Spanish). Descriptive image alt text remains available for accessibility.
