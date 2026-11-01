# Analytics and room performance

## Visits

Vercel Web Analytics is mounted once in the root layout using the Next.js integration. Page views are automatic, including client-side navigation between `/`, `/work`, `/about`, and `/photography`.

Dashboard: https://vercel.com/lnigrot-5774s-projects/lucio-nigro-portfolio/analytics

The project uses the included Hobby option. No paid plan or custom event tracking was enabled. Collection starts after deployment; earlier traffic cannot be reconstructed from this installation. Content blockers can prevent collection.

The default SDK handles referrers, device/country summaries and UTM attribution. No custom identifiers, contact details, or user properties are sent by application code.

## Room rendering

- Stationary, opaque geometry is grouped by material, geometry format, layers and shadow settings. Animated groups and transparent surfaces remain independent.
- Individual assembled parts remain movable, preserving the camera lens, keyboard, guitar neck, strings and room navigation.
- Camera updates, GSAP and the room clock share one pending render request instead of drawing the same frame repeatedly.
- Shader programs are prepared with `compileAsync` before the first visible room frame. Parallel compilation depends on browser/driver support.
- Pixel density, antialiasing, shadow resolution, geometry detail, textures and lighting are unchanged.
- Rendering still pauses off screen, in background tabs, or with reduced motion/the pause control.

Run `npm run test:room` to verify batching preserves world-space vertices, normals, UVs, triangles, materials, visibility, layers, hierarchy and shadow flags. Development builds expose renderer statistics on `.spatial-canvas` through `data-render-stats`; production builds do not.

A local comparison at 1280×720 reduced draw calls from 817 to 287 per rendered image, with 217,620 triangles and 18 textures in both captures. These are renderer counters from the same local browser, not a frame-rate guarantee for another device. Retest on the affected ThinkPad for device-specific acceptance.
