import { chunks, loadSearch } from "../generated/chunks";
import type { Poem, SearchIndex } from "./types";
export async function readChunk(chunk: string): Promise<Poem[]> {
  return chunks[chunk]();
}
export async function readSearch(): Promise<SearchIndex> {
  return loadSearch();
}
