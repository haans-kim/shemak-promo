# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project purpose

Production assets for **쉐막(Shemak) HR AI 홍보영상** — a ~3분 10초 corporate promo video for 인싸이트그룹's HR AI product. Repo contains the narration script, generated TTS audio, brand logos, and tooling to render the final video.

The video is structured as 9 sections (01-intro, 02-ig-intro, 03-hr-agent, 04-bridge, 05-optic-view, 06-pan-hr, 07-synergy, 08-foundation, 09-closing). All audio, scenes, and component naming should follow this `NN-slug` convention.

## Two narration files — keep both

- [narration 1.txt](narration 1.txt) — original human-readable script with stage directions like `(2초 쉼)`. Source of truth for content.
- [narration_tts.txt](narration_tts.txt) — TTS-optimized version: English acronyms spelled in Hangul (HR→에이치알, AI→에이아이, RAG→래그, etc.), numbers expanded (1대1→일대일), pause markers normalized to `[N초 쉼]` so a regex can strip them. **All TTS generation reads from this file.**

When the wording of a section changes, update **both** files. The `narration 1.txt` version stays human-readable; `narration_tts.txt` mirrors it with the pronunciation fixes re-applied.

## Audio assets (external TTS is the main workflow)

Audio files are **produced outside this repo** (Typecast / CLOVA Dubbing / human voice actor or equivalent) and dropped into `public/audio/{NN-slug}.mp3`. Remotion's `staticFile()` resolves `audio/...` against `public/`. The committed mp3s in `public/audio/` are the source of truth for timing.

**When a new audio file lands:**
1. Save it as `public/audio/{NN-slug}.mp3` using the exact `NN-slug` convention (e.g. `02-ig-intro.mp3`).
2. Measure its duration: `ffprobe -show_entries format=duration -of csv=p=0 public/audio/02-ig-intro.mp3` (or use [scripts/measure_audio.js](scripts/measure_audio.js)).
3. Update `estimatedSeconds` for that section in [src/lib/sections.ts](src/lib/sections.ts). **All sequence timing propagates from there** — don't hardcode frame numbers in scene files.
4. If the wording changed, update **both** `narration 1.txt` and `narration_tts.txt` so future re-generation stays in sync.

**Legacy — OpenAI TTS script:** [scripts/generate_tts.py](scripts/generate_tts.py) is kept for reference but **not used going forward**. OpenAI TTS has a noticeable foreign accent in Korean and was replaced by external TTS services. Don't reach for this script unless the user explicitly asks.

## Remotion video pipeline

Stack: Remotion 4.x, React 18, TypeScript. Entry point [src/index.ts](src/index.ts) → [src/Root.tsx](src/Root.tsx) registers 10 compositions:
- `Main` — full ~3분 10초 video (all 9 sections sequenced)
- `01-intro` ... `09-closing` — each section renderable standalone for iteration

Commands:
```bash
npm run dev                              # Remotion Studio — browser preview with timeline
npx remotion compositions                # list all compositions
npx remotion render 02-ig-intro out/02.mp4    # render one section (fast iteration)
npm run build                            # render full Main → out/shemak.mp4
```

**Key architectural rules:**
- **[src/lib/sections.ts](src/lib/sections.ts) is the single source of truth for section metadata** — duration, slug, audio path. Main composition computes sequence offsets from `SECTIONS` in order, so never hardcode frame numbers in scene files.
- `estimatedSeconds` in `SECTIONS` is a **placeholder**. When each section's MP3 is generated, measure actual duration (`ffprobe -show_entries format=duration ...`) and update this file. All sequence timing propagates from here.
- [src/components/SceneFrame.tsx](src/components/SceneFrame.tsx) is the shared wrapper — every scene uses it to get consistent background/typography and to attach its section audio via `<Audio>`.
- [src/lib/brand.ts](src/lib/brand.ts) colors and fonts are **PLACEHOLDERS** until extracted from `Logo/insightgroup 사인규정.ai`. Do not invent brand values; flag and ask.
- All 9 scenes now have real animation (CountUp beats, Spotlight, SplitLayout, MouseCursor, Subtitle components in [src/components/](src/components/)). When iterating on a scene, render it standalone (`npx remotion render 03-hr-agent out/03.mp4`) rather than re-rendering Main.

## Section transitions (`@remotion/transitions`)

Installed at the same `4.0.x` line as core Remotion. Use for cuts between the 9 sections in `Main`.

**Pattern** — replace `<Series>` with `<TransitionSeries>`; transitions live *between* sequences and **overlap** the adjacent sequences (their frames come out of both sides, not added on top). Audio overlaps too, so keep transition frames inside leading/trailing silence of each section's mp3.

```tsx
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={s1}><Intro /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 20 })} />
  <TransitionSeries.Sequence durationInFrames={s2}><IGIntro /></TransitionSeries.Sequence>
</TransitionSeries>
```

**Presentation options** (import path = `@remotion/transitions/<name>`):
- `fade({ shouldFadeOutExitingScene? })` — opacity crossfade. Safest default for corporate tone.
- `slide({ direction? })` — `from-left` | `from-right` | `from-top` | `from-bottom`. Good for section headers.
- `wipe({ direction? })` — same direction values; reveals B over A along an edge.
- `clockWipe({ width, height })` — radial sweep. Dramatic; use sparingly (e.g., into closing).
- `flip({ direction? })` — 3D card flip. Heavy; reserve for chapter breaks.
- `iris({ width, height })` — circular reveal from center.
- `cube({ direction? })` — 3D cube rotation. Requires perspective; check on full-res render.
- `none()` — hard cut, but lets you keep the `TransitionSeries` structure consistent.
- `customPresentation(...)` — write your own (interpolate via `presentationProgress`).

**Timing options**:
- `linearTiming({ durationInFrames, easing? })` — pass `Easing.bezier(...)` from `remotion` for curves.
- `springTiming({ config?, durationInFrames?, durationRestThreshold? })` — physics-based; `config: { damping: 200 }` kills bounce for corporate feel.

**Rules for this project**:
- Default to `fade` + `linearTiming({ durationInFrames: 15-20 })` between sections. Reserve `slide`/`wipe` for moments the narration explicitly pivots topic (e.g., 04-bridge → 05-optic-view).
- Transition duration is **subtracted from each section's playable length** — when adding a transition, confirm the overlap fits inside the silence padding of both mp3s, otherwise narration will overlap.
- Never put a transition around `02-ig-intro`'s CountUp beats — the timing is locked to audio cues.

## Section-by-section render pipeline (primary workflow)

Full-`Main` rendering takes >1 hour on mid-range laptops (ThinkPad T14 class). Use the per-section script instead — each section renders independently, results are cached, and `ffmpeg concat` stitches them in <1 second.

```bash
npm run render              # render only sections whose cache is stale, then concat → out/shemak.mp4
npm run render:force        # force re-render all 9 sections + concat
npm run render:sections     # render only, no concat
npm run render:concat       # concat existing section mp4s, no render
node scripts/render_all.mjs --only=03,05           # render specific sections (+ concat if all 9 exist)
node scripts/render_all.mjs --force --only=03      # force re-render 03 only
```

**Cache behavior** ([scripts/render_all.mjs](scripts/render_all.mjs)) — Claude or a contributor running `npm run render` should understand these semantics:

| Section mp4 state | Action | Log prefix |
|---|---|---|
| Exists, size > 0, source/audio not newer | Keep cache, skip render | `[skip]` |
| Missing or 0 bytes (corrupt) | **Auto re-render** (concat would fail otherwise) | `[rebuild]` |
| Source (`src/**`) newer than mp4 | Keep cache, emit warning only | `[warn]` |
| Audio (`public/audio/{slug}.mp3`) newer than mp4 | Keep cache, emit warning only | `[warn]` |

Source/audio newer is **deliberately non-destructive** — the script refuses to re-render on its own because re-rendering 9 sections is expensive and the contributor may have touched a file inadvertently (e.g. `touch`, formatter, typo fix in unrelated brand config). When you see `[warn]`, decide explicitly:

- **You genuinely changed the code/audio and want it reflected**: `npm run render:force` (all 9) or `node scripts/render_all.mjs --force --only=03,05` (specific sections).
- **The change was cosmetic/irrelevant, keep cached mp4**: do nothing — `npm run render` already kept the cache and proceeded to concat.

When Claude assists with this project: if you edit any file under `src/`, always prompt the user to decide which sections need `--force` re-render. Do not assume silent `npm run render` captures the edit — it won't.

**Tracked output files** — `.gitignore` allows only `out/sections/*.mp4` and `out/shemak.mp4` to be committed, so team members sync rendered artifacts via git. Each render cycle adds ~62 MB of binaries; consider Git LFS if history grows large.

**Platform notes for T14 / non-Mac contributors**:
- ffmpeg install: `choco install ffmpeg` (Windows), `sudo apt install ffmpeg` (Ubuntu), `brew install ffmpeg` (Mac).
- **VSCode mp4 preview has no audio** (Electron webview limitation) — verify output with QuickTime / Windows Media Player / VLC / browser, not the VSCode tab.
- `npm install` downloads Chromium Headless Shell (~150 MB from Google). Corporate proxies may block it — set `PUPPETEER_DOWNLOAD_BASE_URL` or install via VPN if it fails.
- Remotion renders use all CPU cores; expect fan noise and battery drain. Plug in for long renders.

## Workflow constraints

- **Narration timing is the master clock.** Animation timing is derived from per-section MP3 durations. Never tune motion beats before the section's audio exists.
- **Brand assets** live in [Logo/](Logo/) — `insightgroup 사인규정.ai` / `.jpg` is the official sign규정 (brand guidelines). Consult before introducing any logo treatment, color, or typography.
- Target output spec (planned): 1920x1080, 30fps, MP4. IG corporate brand colors and fonts to be extracted from the 사인규정 file when frontend work begins.

## Secrets

No secrets are needed for the main workflow (external TTS → `public/audio/` → Remotion render).

Only relevant if the legacy OpenAI script is intentionally revived: `OPENAI_API_KEY` is read from `.env` (gitignored) by [scripts/generate_tts.py](scripts/generate_tts.py). Format: `OPENAI_API_KEY=sk-...` (one line, with the `KEY=` prefix).
