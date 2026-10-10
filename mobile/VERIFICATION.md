# Verification record

Checked on October 10, 2026, on Windows with Node 24.19.0. The original dataset SHA-256 remains `3449b2e25ad13d2ceb520dd0ccbdd78ffbb799702e1c7eda1c4ec185b41413fc`.

## Completed checks

| Check | Result |
| --- | --- |
| Dataset normalization | 4,730 entries, 109 poets, 74 text batches; no exact duplicates or missing scripts |
| Exact text comparison | Every entry and all three script arrays match the source after newline joining |
| Core automated tests | 7 passing: full-text equivalence, data fidelity/IDs/counts, Unicode search, persistence/order, corrupted backups, unsupported scripts/RTL, theme contrast |
| TypeScript | Passed, no suppressed type errors |
| ESLint | Passed, zero warnings; includes the app entry point, source, scripts, and tests |
| Browser workflow suite | All 5 tests passed on the refreshed production web build (15.2 seconds) |
| Expo Doctor | All 21 checks passed after removing duplicate native dependency copies |
| Production web export | Passed; static `dist/` plus installable PWA shell and service worker |
| Android Hermes export | Passed; native bundle generated |
| iOS Hermes export | Passed; native bundle generated |

The browser suite contains five workflow tests covering:

1. Desktop home, actual Ghalib search, poet lookup, all supplied scripts, exact Hindi text, saved poems/poets/history after reload, and the honest narration state.
2. Failed poem download and retry, a 320 px viewport without page overflow, cached offline reading after reload, invalid/valid backup restoration, and exported JSON download.
3. Collection creation, adding two poems, renaming, persistence, reordering, removing poems, cancellation of deletion, and confirmed deletion.
4. Real genre filtering, both title sort orders, font size, line spacing, position persistence, and restored reading position.
5. All five themes, selected-state accessibility, theme persistence, a 390 px mobile layout, Hindi/English interface switching, and empty full-text results.

Desktop parchment, mobile midnight, and Urdu-reader screenshots were visually inspected. Browser tests use a production build, not the development server. Screenshots are retained in the handoff's `screenshots/` folder.

## Theme refresh

The October 10 theme revision adds pink shaded hearts, deep forest greens with leaves and flowers, dark blue Minimal Monochrome, and gradients/glows across all themes. The same backdrop is used on home, search, library, profile, settings, poet, collection, and reading screens. Previews, dialogs, buttons, selected chips, and featured cards use matching colors.

- TypeScript, ESLint, all 7 core tests, and all 5 production browser workflows passed after the theme changes.
- Contrast checks now cover body and secondary text against base colors, card surfaces, and both gradient endpoints, plus text at both button-gradient endpoints.
- All five themes were captured at 1280 × 900 and 390 × 844. No browser errors or horizontal page overflow were reported. Rose and Forest mobile screens, blue desktop, Rose desktop, settings, and the Hindi reader were visually inspected.
- Decorations use small static SVGs with unique paint IDs and no pointer events. They are hidden from screen readers. No dependency, remote image request, animation loop, server, or paid service was added.
- Reproduce the visual captures with `node scripts/capture-themes.mjs` while the production preview runs at port 4173; screenshots are written to `artifacts/themes/`.

## Limits of this verification

- Native bundle exports are not signed APK/AAB/IPA builds. No physical Android/iOS device, emulator, Safari, or iOS installation was tested.
- No public hosting deployment or custom domain has been created. Hosting readiness is based on a successful static export, SPA routes in the production preview, and the checked Cloudflare limits.
- AI narration is deliberately unimplemented. No generation, voice quality, audio playback, or player timing test is claimed.
- Source-script alignment and literary/transliteration quality were not independently proofread. Ten source entries have differing line counts across scripts; those are preserved.
- `npm audit` reports 22 upstream toolchain findings (15 high, 7 moderate); this is not a clean security audit. Details are in the README. Expo Doctor compatibility checks and npm security audits address different things.
- Automated checks reduce defects; they do not guarantee every possible device, input, storage condition, or deployment environment is bug-free.

## Corrections made during verification

- Darkened secondary theme text to meet the tested 4.5:1 contrast threshold.
- Added web-accessible selected states and stable control labels.
- Repaired reading-position capture/restore and removed dialog transition timing issues.
- Added a home action for directly opened deep links with no back history.
- Reduced the compressed search payload from about 5.6 MB to 2.6 MB while retaining equivalent matches.
- Added offline font caching, safe backup validation, and download retry coverage.
- Removed synchronous effect-driven UI resets, shared the asynchronous search hook, and deduplicated the native module tree.
