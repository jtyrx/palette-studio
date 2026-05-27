# Palette Studio

Build accessible color systems with predictable contrast ratios using the LCH color space.

Live at [palette-studio-omega.vercel.app](https://palette-studio-omega.vercel.app).

This project is based on [Huetone](https://github.com/ardov/huetone) by Alexey Ardov (MIT). See [LICENSE](./LICENSE) for the original license terms.

## Deploy (Vercel)

The repo is linked to Vercel with GitHub integration. Pushes to `main` deploy to production; other branches get preview URLs.

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Install | `pnpm install --frozen-lockfile` |
| Build | `pnpm build` |

Set `NEXT_PUBLIC_SITE_URL` in the Vercel project (Production + Preview) to the deployment origin, e.g. `https://palette-studio-omega.vercel.app` for production. See `.env.example`.

## Run locally

1. Enable Corepack: `corepack enable`
2. Install dependencies: `pnpm install`
3. Start the dev server: `pnpm dev`
4. Open [http://localhost:3000](http://localhost:3000/)

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server (Next.js App Router) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run Vitest |

## Attribution

Palette Studio inherits core palette logic, APCA/WCAG overlays, and UI patterns from Huetone. Thanks to the original author and contributors listed in the upstream README.
