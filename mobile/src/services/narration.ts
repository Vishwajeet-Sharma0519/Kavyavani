// Intentionally unconfigured. No browser TTS or synthetic playback is used.
export interface NarrationRequest {
  poemId: string;
  language: "hi" | "ur";
  voiceId: string;
  sourceScript: "hi" | "ur";
}
export interface NarrationAudio {
  url: string;
  expiresAt?: string;
  cacheKey: string;
}
export interface NarrationProvider {
  generate(
    request: NarrationRequest,
    signal?: AbortSignal,
  ): Promise<NarrationAudio>;
}
export const narrationStatus = "planned" as const;
// A future provider must call an authenticated, rate-limited server which owns
// the credentials and validates poem IDs. Never put provider secrets here.
