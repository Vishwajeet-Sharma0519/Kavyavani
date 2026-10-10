import type { SearchIndex } from "./types";
// Fold Latin accents without stripping Devanagari matras or Urdu marks.
export const normalizeSearch = (text: string) =>
  text
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[\u00c0-\u024f\u1e00-\u1eff]/g, (letter) =>
      letter.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
    )
    .replace(/\s+/g, " ")
    .trim();
export const matches = (haystack: string, query: string) =>
  normalizeSearch(query)
    .split(" ")
    .every((word) => haystack.includes(word));

// Substring matching across all original-script tokens, with intersections for
// multiword queries. Work is yielded between batches to keep typing responsive.
export async function searchIndex(
  index: SearchIndex,
  query: string,
  signal?: AbortSignal,
) {
  let result: Set<number> | undefined;
  for (const word of normalizeSearch(query).split(" ").filter(Boolean)) {
    const found = new Set<number>();
    for (let offset = 0; offset < index.tokens.length; offset += 2000) {
      if (signal?.aborted) throw new Error("Search cancelled");
      for (
        let i = offset;
        i < Math.min(offset + 2000, index.tokens.length);
        i++
      ) {
        if (index.tokens[i].includes(word))
          for (const position of index.postings[i].split("."))
            found.add(parseInt(position, 36));
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    result = result
      ? new Set([...result].filter((id) => found.has(id)))
      : found;
    if (!result.size) break;
  }
  return result ?? new Set<number>();
}
