# Kavyavani

A working Hindi poetry reader built with Expo SDK 57, React Native, TypeScript, and React Navigation. Includes an installable static web app and shared Android/iOS source. No backend, account, subscription, or AI API is required for this release.

## Run locally

Use Node.js 24 LTS and npm. The dependency versions are locked in `package-lock.json`.

```sh
cd mobile
npm ci
npm run web
```

`npm start` starts Expo for a compatible Expo Go / development client. `npm run android` requires an Android emulator or connected device. An iOS simulator requires macOS. Native app-store packaging, signing, store accounts, and physical-device acceptance testing are separate from a JavaScript bundle export.

```sh
npm run build:web
npm run preview
```

The production preview is at `http://localhost:4173`. Use a web server, not a `file://` URL. The preview server is local only; do not use it as a production backend.

## Implemented

- Home, discovery, poet profiles, an immersive reader, library, local profile, settings, and collection detail screens with navigation history and shareable web routes.
- The actual 4,730 supplied poems and 109 poets; no generated replacement poems or invented poet biographies.
- Debounced full-text search across titles, authors, genre, and all three scripts. A–Z/Z–A ordering, real genre filters, script availability filters, recent searches, empty states, and retry handling.
- Original Devanagari, Roman, and Urdu versions; Urdu uses a bundled Nastaliq font and right-to-left reading. These are supplied versions, not newly generated conversions. The `en` field is Roman transliteration, **not English translation**.
- Persistent saved poems, saved poets, the last 100 distinct poems read, reading position, type size, line spacing, width, interface language, and local display name.
- Collections with descriptions, four cover motifs, multiple-collection membership, renaming, deletion confirmation, and poem reordering.
- Five complete themes selected in **Profile → Settings**: Classic Parchment, Midnight Ink, Rose & Romance, Forest Poetry, and Minimal Monochrome. System appearance is also supported.
- Every theme includes soft gradient backgrounds, glowing accents, and gradient controls. Rose & Romance has a pink palette with translucent shaded hearts; Forest Poetry has deep forest greens with leaves and flowers; Minimal Monochrome uses dark blues. Decorative SVGs are static, local, and hidden from assistive technology, with no added runtime dependency or network request.
- Library JSON export / restore, including validation and confirmation before replacing local data.
- PWA manifest, app icons, bundled fonts, and a service worker. After the initial online installation, the app shell and cached poem batches can be read offline. An unopened poem still needs a connection. Full-text search becomes available offline after its index has been downloaded and cached. Browsers may evict caches.
- Narration buttons that open a clear “coming later” explanation. No synthetic timer, pretend audio, or browser TTS.

## Free deployment

The recommended target is **Cloudflare Pages static hosting**. The app exports plain files; there are no server functions, databases, recurring inference costs, or secrets to configure. This project is deployment-ready; no public deployment has been made by the build task.

### Direct upload

1. Run `npm ci` and `npm run build:web`.
2. In Cloudflare, create a **Pages** project using **Direct Upload**.
3. Upload the contents of `mobile/dist/` (or the provided deployment ZIP). `index.html`, `_redirects`, and `_headers` must be at the upload root.
4. Use the assigned HTTPS address. Open it on a phone and use the browser's **Install app / Add to Home Screen** action.

The included `_redirects` supplies the SPA fallback, so refreshing `/poem/<id>`, `/settings`, or other routes works. Host at the domain root; the current asset paths do not support a subfolder such as `/kavyavani/` without configuration changes.

### Git-based builds

Keep both the source JSON at the repository root and the `mobile/` folder. Configure root directory `mobile`, build command `npm run build:web`, output directory `dist`, and Node 24. Do not deploy `node_modules`, the development server, or `dist-native`.

Cloudflare documents a 25 MiB maximum individual asset, 20,000 files for a free Pages site, and 500 builds per month. This build has about 100 files, with its largest file about 9.2 MB, below those limits. The compressed full-text index is about 2.6 MB and is fetched on the first text search; the initial app download is separate. Hosting quotas and policies can change.

Sources checked October 10, 2026: [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/), [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [Expo website publishing](https://docs.expo.dev/guides/publishing-websites/).

## Data architecture

`../kavya_merged_final.json` is the original source. Each record has `title`, `author`, `type`, and `hi`, `en`, `ur` arrays of verse lines. `npm run data:build` validates this schema, creates stable content-derived IDs, merges only exact duplicates, calculates counts, and emits:

- `src/generated/catalog.json`: small metadata catalog, with no full verse bodies.
- `public/data/<revision>/0.json` and other numbered files: 64 poems per batch, read lazily on web. Native uses lazy bundled module lookups.
- `public/data/<revision>/search.json`: a compact token/posting index for substring search across all supplied text. Searches yield between batches and cancel obsolete queries.
- `DATA-AUDIT.json`: data quality findings.

No exact duplicates or absent scripts were found. Ten records have different line counts between supplied scripts; those differences are retained. The source has no verified biography, portrait, dates, popularity, mood tags, or publication-rights metadata. Era, mood, and popularity filters are therefore not fabricated. Script versions have not been independently proofread for literary accuracy.

IDs depend on author identity and supplied poem text, not array position. Reordering the dataset preserves IDs; editing a poem's text changes its identity and may require an explicit migration of user saves. Native source contains the full corpus for offline use and therefore has a larger bundle than the web shell. After replacing the dataset, regenerate, test, and rebuild. Old generated revision folders can be removed before a fresh deployment once no old release depends on them.

Read-only source data is separated from mutable user data. `src/data/repository.ts` exposes catalog, search, filtering, sorting, and lazy lookup functions. `src/data/scripts.ts` exposes supported script selection and explicit unavailable-script fallback.

## Local storage and privacy

Preferences and library data use AsyncStorage (browser local storage on web). There is no authentication or cloud synchronization. Different browsers/devices have separate libraries; clearing site data or uninstalling can remove them. Export a backup before moving devices or clearing data. Restore validates the version and value ranges before applying it. A corrupt stored payload is preserved under the recovery key when storage permits, and the app shows an error instead of crashing.

The active theme applies before the normal app UI is displayed. Storage-write failures remain visible with a retry action. There is no analytics or remote font dependency.

## Emotional Hindi narration — intentionally deferred

`src/services/narration.ts` defines a provider interface only. There is **no working audio generator/player**, no recently-played history, and no listening statistics in this release. This follows the requirement to wait for convincing emotional Hindi recitation instead of shipping ordinary text-to-speech.

To implement it later:

1. Evaluate Hindi pronunciation, meter, pauses, emotion, and Urdu-derived vocabulary with representative poems and a fluent listener. A text-to-speech API alone does not establish acceptable quality.
2. Implement an authenticated, rate-limited server endpoint accepting a poem ID and a permitted voice. Resolve canonical text on the server and keep provider credentials there.
3. Return validated audio URLs, cache by poem revision and voice, and apply explicit budget/rate limits.
4. Add real audio playback with measured progress, interruption handling, voice options, playlists, a mini-player, repeat, speed, and sleep timer.

Provider fees, voice rights, audio storage, and server limits must be assessed then. `.env.example` contains no secrets; no environment variables are needed now. Nothing in this release guarantees that future emotional narration can run free.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build:web
npx expo export --platform android --platform ios --output-dir dist-native
```

The browser suite starts a production preview itself; if your environment restricts subprocess networking, start `npm run preview` separately first. Tests cover the actual dataset, text preservation, multilingual matching, stable identities, backup corruption, collection state, theme contrast, desktop/mobile navigation, persisted favourites and themes, script changes, failures/retries, cached offline reading, backup import/export, collection CRUD/reordering, sort/filter behavior, and reading preferences/position.

TypeScript uses a larger Node stack to handle the generated corpus and library type definitions; type errors are not suppressed. See `VERIFICATION.md` for the checks actually run and their limits.

## Constraints

- Automated checks cannot establish that every device/browser has no bugs. Android/iOS exports do not substitute for installation and testing on physical devices.
- Free static hosting covers the current reading/library app; custom domains, app-store publication, cloud sync, and future AI may have separate costs.
- The first app load and first full-text search need downloads. Low-bandwidth devices will benefit from the subsequent cache.
- Narration remains deferred, and no new transliteration/translation service is configured.
- No UI reference image was supplied; the design follows the written parchment-and-burgundy brief.
- `npm audit` currently reports 22 transitive findings (15 high, 7 moderate) in the Expo/native build toolchain, rooted in `braces`, `node-forge`, and `uuid`. The current latest `braces` / `node-forge` registry releases are also flagged. These packages are not imported into the static reader runtime. No forced downgrade to incompatible Expo/React Native versions was applied. Recheck upstream patches before a native production release; do not expose development tooling publicly.

## Five-poem recitation pilot (9 November 2026)

The narration panel now lists external recording candidates for the five selected poems, with poem-specific matching in the reader. Four have external source links; the Waseem Barelvi recording is pending. These supersede the earlier generic coming-later panel. Audio quality, source availability and reuse rights have not been approved. No audio is generated, hosted or played within the app yet. See [RECITATION-PILOT.md](RECITATION-PILOT.md) for sources, performance directions and remaining dependencies.
