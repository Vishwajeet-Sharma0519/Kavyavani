import rawCatalog from "../generated/catalog.json";
import { readChunk, readSearch } from "./loader";
import { matches, normalizeSearch, searchIndex } from "./search";
import type {
  Catalog,
  Poem,
  PoemSummary,
  Script,
  Sort,
  SearchIndex,
} from "./types";
export const catalog = rawCatalog as Catalog;
const poemMap = new Map(catalog.poems.map((p) => [p.id, p]));
const poetMap = new Map(catalog.poets.map((p) => [p.id, p]));
const chunkCache = new Map<string, Promise<Poem[]>>();
const collator = new Intl.Collator("hi", {
  numeric: true,
  sensitivity: "base",
});
let searchData: Promise<SearchIndex> | undefined;
export const getAllPoets = () => catalog.poets;
export const getPoetById = (id: string) => poetMap.get(id);
export const getPoemSummary = (id: string) => poemMap.get(id);
export const getPoemsByPoet = (id: string) =>
  catalog.poems.filter((p) => p.poetId === id);
export const searchPoets = (q: string) =>
  catalog.poets.filter((p) => matches(normalizeSearch(p.name), q));
export function getSortedPoets(sort: Sort = "az", list = catalog.poets) {
  return [...list].sort(
    (a, b) => collator.compare(a.name, b.name) * (sort === "az" ? 1 : -1),
  );
}
export function getSortedPoems(sort: Sort = "az", list = catalog.poems) {
  return [...list].sort(
    (a, b) => collator.compare(a.title, b.title) * (sort === "az" ? 1 : -1),
  );
}
export const getFilteredPoems = (
  {
    genre,
    script,
    poetId,
  }: { genre?: string; script?: Script; poetId?: string } = {},
  list = catalog.poems,
) =>
  list.filter(
    (p) =>
      (!genre || p.genre === genre) &&
      (!script || p.scripts.includes(script)) &&
      (!poetId || p.poetId === poetId),
  );
export async function getPoemById(id: string) {
  const summary = poemMap.get(id);
  if (!summary) throw new Error("This poem is not in the current collection.");
  if (!chunkCache.has(summary.chunk)) {
    const pending = readChunk(summary.chunk).catch((error) => {
      chunkCache.delete(summary.chunk);
      throw error;
    });
    chunkCache.set(summary.chunk, pending);
    if (chunkCache.size > 12)
      chunkCache.delete(chunkCache.keys().next().value!);
  }
  const record = (await chunkCache.get(summary.chunk)!).find(
    (p) => p.id === id,
  );
  if (!record?.text)
    throw new Error("This poem could not be read. Please retry.");
  return record;
}
export async function searchPoems(
  query: string,
  signal?: AbortSignal,
): Promise<PoemSummary[]> {
  if (!query.trim()) return catalog.poems;
  if (!searchData)
    searchData = readSearch().catch((error) => {
      searchData = undefined;
      throw error;
    });
  const ids = await searchIndex(await searchData, query, signal);
  return catalog.poems.filter((_, i) => ids.has(i));
}
export function dailyPoet(date = new Date()) {
  const day = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000,
  );
  return catalog.poets[day % catalog.poets.length];
}
