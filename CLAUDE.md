# CLAUDE.md — JadwalSync Frontend & UI/UX Rules

## 1. Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## 2. Tech Stack & Architecture (CRITICAL)
- **Framework:** Next.js (App Router). Do NOT use a single `index.html` file.
- **Styling:** Tailwind CSS (configured via `tailwind.config.ts`).
- **Structure:** Build modular, reusable React components (e.g., `ClassCard`, `TimelineView`, `StatusBadge`).
- **Server:** Start the dev server using `npm run dev` (serves the project at `http://localhost:3000`).

## 3. Brand Assets & Aesthetic (FEB Unpad)
- Always check the `brand_assets/` folder before designing. It contains the Universitas Padjadjaran/FEB logos and color guidelines.
- **Colors:** Emphasize UNPAD Yellow and Blue as primary accents. Keep the background clean (white/light slate) for readability. Do not invent random brand colors.
- **Vibe:** Professional, system-driven, and minimalist. Think of a top-tier consulting dashboard, not a playful consumer app.

## 4. Screenshot Workflow
- **Always screenshot from localhost:** `node screenshot.js http://localhost:3000`
- Screenshots are saved automatically to `./temporary_screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.js http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.js` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary_screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex matching UNPAD guidelines), alignment, border-radius, shadows, image sizing.

## 5. Anti-Generic Guardrails
- **Typography:** Pair a clean serif for main headers with a highly readable sans-serif for dashboard data. Apply generous line-height (`1.6` or `1.7`) on body text to reduce cognitive load.
- **Shadows & Depth:** Surfaces should have a clear layering system (base → elevated → floating) to distinguish between schedules. Never use flat `shadow-md`; use layered, color-tinted shadows with low opacity.
- **Interactive States:** Every clickable element (e.g., "Approve Schedule" button, Class dropdowns) MUST have `hover`, `focus-visible`, and `active` states.
- **Spacing:** Use intentional, consistent spacing tokens. Generous whitespace is mandatory to avoid making the dashboard look cluttered.

## 6. Hard Rules
- **Local First:** Do NOT push code to GitHub or trigger Vercel deployments unless explicitly instructed.
- **Placeholder Data:** Use dummy scheduling data (e.g., "Matkul: Bisval", "Room: Epsilon 308") until backend logic is integrated.
- **Responsiveness:** Must be strictly mobile-first. Most users (Dosen/Mahasiswa) will open this app via WhatsApp links on their phones.