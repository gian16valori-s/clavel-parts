# ClavelParts workspace instructions

## Stability-first rule

The homepage and main landing experience are considered **stable** and must not be changed unless the user explicitly asks for a homepage, hero, navbar, topbar, footer, or global-style update, or there is direct evidence the bug lives there.

### Protected files and areas
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/hero/**`
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Topbar.tsx`
- `src/components/layout/Footer.tsx`
- global visual styling used by the landing page

## How to work in this repo
- When the task is about `catalog`, `results`, `garage`, `panel`, `login`, `cart`, or `supabase`, keep edits scoped to those areas only.
- Prefer the **smallest targeted change** that solves the request.
- Do **not** refactor unrelated components while implementing a feature.
- Avoid broad global CSS edits for feature-specific work.
- Before saying a change is complete, verify it with `npm run build`.

## If the page looks broken after a change
If `next dev` starts returning missing CSS/chunk errors such as `/_next/static/... 404/500`, treat it as a **dev cache/server issue first**, not a reason to rewrite the homepage.

Recovery steps:
1. stop the dev server
2. delete `.next`
3. restart with `npm run dev`

## Change discipline
If a protected file really must be edited, explain why and keep the diff isolated and minimal.
