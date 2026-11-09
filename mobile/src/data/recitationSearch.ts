import type { PoemSummary } from "./types";

export function recitationSearchUrl(poem: PoemSummary, poet: string) {
  const verse = poem.firstLine.trim() || poem.title.trim();
  const query = [verse, poet.trim(), "poem recitation"]
    .filter(Boolean)
    .join(" ");
  return (
    "https://www.youtube.com/results?search_query=" + encodeURIComponent(query)
  );
}
