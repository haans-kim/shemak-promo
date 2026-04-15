# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project purpose

Production assets for **쉐막(Shemak) HR AI 홍보영상** — a ~3분 10초 corporate promo video for 인싸이트그룹's HR AI product. Repo contains the narration script, generated TTS audio, brand logos, and tooling to render the final video.

The video is structured as 7 sections (01-intro, 02-ig-intro, 03-hr-agent, 04-bridge, 05-optic-view, 06-pan-hr, 07-closing). All audio, scenes, and component naming should follow this `NN-slug` convention.

## Two narration files — keep both

- [narration 1.txt](narration 1.txt) — original human-readable script with stage directions like `(2초 쉼)`. Source of truth for content.
- [narration_tts.txt](narration_tts.txt) — TTS-optimized version: English acronyms spelled in Hangul (HR→에이치알, AI→에이아이, RAG→래그, etc.), numbers expanded (1대1→일대일), pause markers normalized to `[N초 쉼]` so a regex can strip them. **All TTS generation reads from this file.**

When the wording of a section changes, update **both** files. The `narration 1.txt` version stays human-readable; `narration_tts.txt` mirrors it with the pronunciation fixes re-applied.

## TTS generation

```bash
.venv/bin/python scripts/generate_tts.py        # all 7 sections
.venv/bin/python scripts/generate_tts.py 02     # single section by number
```

Outputs to `public/audio/{NN-slug}.mp3` (Remotion's `staticFile()` resolves `audio/...` against `public/`). Model and voice are constants at the top of [scripts/generate_tts.py](scripts/generate_tts.py) — change there, not via CLI flags.

The script parses sections by the `====...` delimiter pattern in `narration_tts.txt` and strips `[N초 쉼]` markers before sending to OpenAI. If you change the delimiter or section numbering, update `parse_sections()` and `SECTION_SLUGS`.

**Note on TTS quality:** OpenAI TTS has a noticeable foreign accent in Korean. The user evaluated it and may move to Typecast / CLOVA Dubbing / human voice actor. Don't assume the OpenAI pipeline is the final choice — if asked to switch providers, treat `generate_tts.py` as replaceable, not load-bearing.

## Remotion video pipeline

Stack: Remotion 4.x, React 18, TypeScript. Entry point [src/index.ts](src/index.ts) → [src/Root.tsx](src/Root.tsx) registers 8 compositions:
- `Main` — full 3-minute video (all 7 sections sequenced)
- `01-intro` ... `07-closing` — each section renderable standalone for iteration

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
- Scenes 01, 03–07 are currently **title-card placeholders**. Only section 02 (IGIntro) has real animation (four CountUp beats + brand reveal). Other scenes should be built out one at a time with the same pattern.

## Section transitions (`@remotion/transitions`)

Installed at the same `4.0.x` line as core Remotion. Use for cuts between the 7 sections in `Main`.

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

## Workflow constraints

- **Narration timing is the master clock.** Animation timing is derived from per-section MP3 durations. Never tune motion beats before the section's audio exists.
- **Brand assets** live in [Logo/](Logo/) — `insightgroup 사인규정.ai` / `.jpg` is the official sign규정 (brand guidelines). Consult before introducing any logo treatment, color, or typography.
- Target output spec (planned): 1920x1080, 30fps, MP4. IG corporate brand colors and fonts to be extracted from the 사인규정 file when frontend work begins.

## Secrets

`OPENAI_API_KEY` is read from `.env` (gitignored) by [scripts/generate_tts.py](scripts/generate_tts.py). The script has a minimal hand-rolled `.env` parser — no `python-dotenv` dependency. Format: `OPENAI_API_KEY=sk-...` (one line, with the `KEY=` prefix).
