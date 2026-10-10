import catalog from "../generated/catalog.json";
import type { Poem, SearchIndex } from "./types";
async function read<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`/data/${path}`, {
      signal: controller.signal,
    });
    if (!response.ok)
      throw new Error(
        "Poetry could not be loaded. Check your connection and try again.",
      );
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError")
      throw new Error("The connection timed out. Please try again.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
export const readChunk = (chunk: string) => read<Poem[]>(chunk);
export const readSearch = () =>
  read<SearchIndex>(`${catalog.fingerprint}/search.json`);
