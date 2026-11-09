# Five-poem recitation pilot

Prepared 9 November 2026. These are audition candidates, not approved audio. No audio has been generated, downloaded, licensed, or assessed by listening. The app opens the original external sources; it does not play or cache their audio.

| Poem | Source candidate | Performance direction |
| --- | --- | --- |
| Ab to mazhab koi aisa bhi chalaya jae — Neeraj | https://www.youtube.com/watch?v=zj9UiEz2MrU (The Quest; indexed listing) | Compassionate appeal; warm middle register; meaningful pauses after each thought. Avoid a sermon or rally cadence. |
| Main toofanon mein chalne ka aadi hoon — Neeraj | https://www.youtube.com/watch?v=ntozSrYXYfI (linked by Vivek Pareek's official Telegram listing) | Firm resolve; gradual build across stanzas; vary each refrain without shouting. This is the catalog match for the user's second title. |
| Hamara dil savere ka sunehra jaam ho jae — Bashir Badr | https://www.rekhta.org/ghazals/hamaaraa-dil-savere-kaa-sunahraa-jaam-ho-jaae-bashir-badr-ghazals | Intimate ghazal delivery; distinct couplets; leave room after each second line. Page lists Nomaan Shauque recitation and RJ Sayema video. |
| Chanda mama, aa jana — Dwarika Prasad Maheshwari | https://www.youtube.com/watch?v=pEVMtydlG24 (indexed listing) | Affectionate storytelling; playful opening; gentle bedtime finish; natural adult voice without a caricatured child accent. |
| Apne andaaz ka akela tha — Waseem Barelvi | No reliable recording located. Text reference: https://www.rekhta.org/ghazals/apne-andaaz-kaa-akelaa-thaa-waseem-barelvi-ghazals | Quiet dignity; restrained loneliness; vary the repeated ending; let the final image settle in silence. |

## Production brief

Use the existing supplied Devanagari poem text as the starting script. Compare every word against an authoritative edition before recording: online versions can differ. Keep pronunciation annotations in a separate performance script; never silently rewrite the reader text. No poet voice imitation is requested.

Record or generate three different short audition takes before a full performance. Prioritize native Hindi/Urdu diction, intact vowel lengths, natural breath groups, verse rhythm, and emotional progression. Explicitly check nukta sounds and words such as mazhab, toofaan, manzil, charaagh, ehtiyaatan, bakhshish, dast-e-dua, and aaina where present. Have a fluent listener approve each word in context. Do not assume Roman transliteration produces reliable pronunciation.

For AI, use an authorized voice and a connected speech provider; neither is configured here. Direct the emotional arc stanza by stanza, but generate coherent passages to avoid audible joins. Audition the complete assembled recording after any edits. Keep the first pass voice-only; music can obscure diction and needs separate rights.

Acceptance: no missing/repeated words, pronunciation errors, odd accent shifts, mechanical phrase endings, clipping, intrusive reverb, or unnatural joins. Compare against the approved script in real time. Check both headphones and a phone speaker. User listening approval is still needed to establish the desired warmth.

Before hosting recordings, document permission for the poem and recording, narrator/voice rights, permitted app streaming/download uses, attribution, and any expiry. External links are discovery references, not evidence of reuse permission. YouTube pages could not be fetched directly during this session; availability, exact contents, narrator identity, completeness and audio quality remain unverified.

## Implementation and remaining work

The five stable catalog IDs and external candidates are in src/data/recitations.ts. Reader narration opens only the matching entry; other narration entry points show the five-poem selection. Waseem's entry explicitly remains pending. There is no invented progress, AI generation, or in-app playback.

Next dependency: an approved recording with hosting rights, or a connected speech provider plus an authorized voice and script. Once supplied, implement actual audio playback and interruption/error handling against that real asset.

The original source dataset kavya_merged_final.json was already deleted in the working tree at the start of this task. Standard data rebuild and core tests depend on that file; do not recreate or overwrite it without understanding the user's removal. Existing generated catalog data remains available.
