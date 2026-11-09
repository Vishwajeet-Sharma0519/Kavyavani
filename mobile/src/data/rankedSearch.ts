import { normalizeSearch } from "./search";
import { poetAliases } from "./poetAliases";
import type { Catalog, Poet, SearchIndex } from "./types";

// Normalize search keys only, preserving the vowels in the displayed poems.
export function searchWords(text: string): string[] {
  return (
    normalizeSearch(text)
      .normalize("NFD")
      .replace(/\u093c/g, "")
      .replace(/[\u064b-\u065f\u0670\u0640\u200c\u200d]/g, "")
      .replace(/[يى]/g, "ی")
      .replace(/ك/g, "ک")
      .normalize("NFC")
      .match(/[\p{L}\p{M}\p{N}]+/gu) ?? []
  );
}

function romanKey(word: string) {
  return word
    .replace(/aa/g, "a")
    .replace(/ee|ii/g, "i")
    .replace(/oo|uu/g, "u")
    .replace(/w/g, "v");
}

// Bounded optimal-string-alignment distance includes adjacent swapped letters.
function editDistance(a: string, b: string, bound: number) {
  if (Math.abs(a.length - b.length) > bound) return bound + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  let beforePrevious = previous;
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        row[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + Number(a[i - 1] !== b[j - 1]),
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        row[j] = Math.min(row[j], beforePrevious[j - 2] + 1);
    }
    if (Math.min(...row) > bound) return bound + 1;
    beforePrevious = previous;
    previous = row;
  }
  return previous[b.length];
}

export function wordSimilarity(word: string, query: string): number {
  if (word === query) return 100;
  if (
    /^[a-z]+$/.test(word) &&
    /^[a-z]+$/.test(query) &&
    romanKey(word) === romanKey(query)
  )
    return 100;
  if (word.startsWith(query)) return 90;
  if (query.length >= 3 && word.includes(query)) return 75;
  if (query.length < 4 || query.length > 40 || word.length > 42) return 0;
  // Prevent accidental comparisons between unrelated scripts.
  if (
    /^[a-z]/.test(word) !== /^[a-z]/.test(query) ||
    /^[\u0900-\u097f]/.test(word) !== /^[\u0900-\u097f]/.test(query)
  )
    return 0;
  const bound = query.length >= 8 ? 2 : 1;
  const distance = editDistance(word, query, bound);
  return distance <= bound ? 60 - distance * 10 : 0;
}

function textScores(words: string[], query: string[]) {
  return query.map((term) =>
    words.reduce(
      (score, word) => Math.max(score, wordSimilarity(word, term)),
      0,
    ),
  );
}
function scoreTerms(scores: number[]) {
  return scores.length && scores.every(Boolean)
    ? Math.min(...scores) * 1000 +
        scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;
}
export function poetSearchText(poet: Poet) {
  return `${poet.name} ${poetAliases[poet.name] ?? ""}`;
}
export function rankPoets(poets: Poet[], query: string) {
  const terms = searchWords(query);
  if (!terms.length) return query.trim() ? [] : poets;
  return poets
    .map((poet) => ({
      poet,
      score: scoreTerms(textScores(searchWords(poetSearchText(poet)), terms)),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.poet);
}

type Vocabulary = { words: string[]; positions: number[][] };
const vocabularies = new WeakMap<SearchIndex, Vocabulary>();
const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
function checkCancelled(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error("Search cancelled");
}
async function vocabulary(
  index: SearchIndex,
  signal?: AbortSignal,
): Promise<Vocabulary> {
  const cached = vocabularies.get(index);
  if (cached) return cached;
  const entries = new Map<string, Set<number>>();
  for (let offset = 0; offset < index.tokens.length; offset += 3000) {
    checkCancelled(signal);
    for (
      let i = offset;
      i < Math.min(offset + 3000, index.tokens.length);
      i++
    ) {
      const positions = index.postings[i]
        .split(".")
        .map((value) => parseInt(value, 36));
      for (const word of searchWords(index.tokens[i])) {
        let set = entries.get(word);
        if (!set) {
          set = new Set();
          entries.set(word, set);
        }
        positions.forEach((position) => set.add(position));
      }
    }
    await pause();
  }
  checkCancelled(signal);
  const result = {
    words: [...entries.keys()],
    positions: [...entries.values()].map((set) => [...set]),
  };
  vocabularies.set(index, result);
  return result;
}

export async function rankPoems(
  index: SearchIndex,
  catalog: Catalog,
  query: string,
  signal?: AbortSignal,
) {
  checkCancelled(signal);
  const terms = [...new Set(searchWords(query))];
  if (!terms.length) return query.trim() ? [] : catalog.poems;
  const vocab = await vocabulary(index, signal);
  const matches = terms.map(() => new Map<number, number>());
  for (let offset = 0; offset < vocab.words.length; offset += 8000) {
    checkCancelled(signal);
    for (let i = offset; i < Math.min(offset + 8000, vocab.words.length); i++) {
      for (const [termIndex, term] of terms.entries()) {
        const score = wordSimilarity(vocab.words[i], term);
        if (!score) continue;
        for (const position of vocab.positions[i]) {
          const map = matches[termIndex];
          if (score > (map.get(position) ?? 0)) map.set(position, score);
        }
      }
    }
    await pause();
  }
  const authors = new Map(
    catalog.poets.map((poet) => [
      poet.id,
      textScores(searchWords(poetSearchText(poet)), terms),
    ]),
  );
  const ranked: { position: number; score: number }[] = [];
  for (let offset = 0; offset < catalog.poems.length; offset += 1000) {
    checkCancelled(signal);
    for (
      let position = offset;
      position < Math.min(offset + 1000, catalog.poems.length);
      position++
    ) {
      const poem = catalog.poems[position];
      const author = authors.get(poem.poetId)!;
      const titleWords = searchWords(`${poem.title} ${poem.firstLine}`);
      const title = textScores(titleWords, terms);
      const scores = terms.map((_, i) =>
        Math.max(matches[i].get(position) ?? 0, author[i], title[i]),
      );
      const score = scoreTerms(scores);
      if (!score) continue;
      const titleBonus =
        (title.reduce((sum, value) => sum + value, 0) / terms.length) * 3;
      const authorBonus =
        (author.reduce((sum, value) => sum + value, 0) / terms.length) * 2;
      const phraseBonus = titleWords.join(" ").includes(terms.join(" "))
        ? 400
        : 0;
      ranked.push({
        position,
        score: score + titleBonus + authorBonus + phraseBonus,
      });
    }
    await pause();
  }
  checkCancelled(signal);
  return ranked
    .sort((a, b) => b.score - a.score || a.position - b.position)
    .map((entry) => catalog.poems[entry.position]);
}
