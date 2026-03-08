# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static website for the Neo Foundation nonprofit. Single-page design built with vanilla HTML/CSS/JavaScript — no build tools, bundler, or package manager. All source lives in `Neo Org/`.

## Running Locally

- Open `Neo Org/index.html` directly in a browser, or use VS Code Live Preview (configured in `.vscode/settings.json`)
- Chrome debugger is configured on `http://localhost:8080` via `.vscode/launch.json`
- No build step, no install step

## File Structure

The entire application is three files:

- **`Neo Org/index.html`** — Full page markup using Tailwind CSS utility classes. Sections: hero, skills, impact stats, events, contact. CDN dependencies: particles.js, odometer.js, Tailwind CSS v3.4.1.
- **`Neo Org/script.js`** (~1250 lines) — All interactive behavior. Key systems:
  - `EnhancedParticleSystem` class — Canvas-based particle effects with device-aware rendering
  - `ModernCursor` class — Custom cursor with follower ring and motion blur (desktop only)
  - Animated starfield, shooting stars, title sparkles — decorative effects
  - Odometer integration — Animates volunteer stats on scroll via Intersection Observer
  - `togglePerformanceMode()` — Disables all decorative animations for low-end devices
- **`Neo Org/styles.css`** (~3540 lines) — Tailwind base + extensive custom animations (`starFloat`, `starTwinkle`, `sparkleFloat`, `spotlight`, `neoFloat`, `neoSlideUp`, `textGlow`, etc.)

## Architecture Patterns

**Device-adaptive rendering:** Mobile detection (`isMobile`) and hardware capability checks (`isLowPowerDevice`) gate expensive features. Particle counts, star counts, shooting stars, and custom cursor are all conditional. Tab visibility detection pauses animations when inactive.

**Performance mode:** A toggle in the navbar that injects CSS to disable backdrop blur, drop shadows, and reduces all animation durations. Controlled via dynamic style injection.

**Initialization flow:** `DOMContentLoaded` → 100ms delay → conditional feature init (cursor on desktop, particles, starfield, counters). Intersection Observer triggers odometer counters when the volunteer section scrolls into view.

## Key Conventions

- All external libraries loaded via CDN `<script>` tags — no npm packages
- Tailwind utility classes for layout; custom CSS for animations and effects
- Section navigation uses anchor IDs: `#home`, `#skills`, `#experience`, `#contact`
- Images are in `Neo Org/images/` as `.webp` files
- No tests, linting, or CI/CD configured
