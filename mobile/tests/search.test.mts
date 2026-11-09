import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  rankPoets,
  rankPoems,
  searchWords,
  wordSimilarity,
} from "../src/data/rankedSearch.ts";
import { poetAliases } from "../src/data/poetAliases.ts";
import type { Catalog, SearchIndex } from "../src/data/types.ts";
const catalog: Catalog = JSON.parse(
  readFileSync(
    new URL("../src/generated/catalog.json", import.meta.url),
    "utf8",
  ),
);
const index: SearchIndex = JSON.parse(
  readFileSync(
    new URL(
      `../public/data/${catalog.fingerprint}/search.json`,
      import.meta.url,
    ),
    "utf8",
  ),
);
test("all poets have searchable Devanagari and Urdu names", () => {
  for (const poet of catalog.poets) {
    assert.match(poetAliases[poet.name], /[\u0900-\u097f]/, poet.name);
    assert.match(poetAliases[poet.name], /[\u0600-\u06ff]/, poet.name);
  }
});
test("poets rank correctly for scripts, typos, transposition and Roman variants", () => {
  for (const [query, expected] of [
    ["गालिब", "Mirza Ghalib"],
    ["ग़ालिब", "Mirza Ghalib"],
    ["غالب", "Mirza Ghalib"],
    ["ghlaib", "Mirza Ghalib"],
    ["galib", "Mirza Ghalib"],
    ["kumar vishvas", "Kumar Vishwas"],
    ["महादेवी", "Mahadevi Verma"],
    ["महादेवि", "Mahadevi Verma"],
    ["بشیر بدر", "Bashir Badr"],
    ["gopal das neeraj", "Gopaldas Neeraj"],
  ])
    assert.equal(rankPoets(catalog.poets, query)[0]?.name, expected, query);
  assert.deepEqual(rankPoets(catalog.poets, "zzzzzznotapoet"), []);
});
test("normalization preserves Hindi vowel distinctions and tolerates punctuation", () => {
  assert.notDeepEqual(searchWords("कवि"), searchWords("कव"));
  assert.deepEqual(searchWords("ग़ालिब"), searchWords("गालिब"));
  assert.deepEqual(searchWords("بشیر، بدر"), ["بشیر", "بدر"]);
  assert(wordSimilarity("hamaaraa", "hamara") > 0);
  assert.equal(wordSimilarity("राम", "काम"), 0);
});
test("poems prioritize a remembered title, spelling variants and mixed author/verse queries", async () => {
  for (const query of [
    "हमारा दिल सवेरे",
    "hamara dil",
    "hamaara dil",
    "हमारा दिल सवरे",
  ])
    assert.equal(
      (await rankPoems(index, catalog, query))[0]?.id,
      "p-6d77145f83d8b9d5",
      query,
    );
  assert.equal(
    (await rankPoems(index, catalog, "नीरज मजहब"))[0]?.id,
    "p-5162bf4911e11684",
  );
  const ghalib = catalog.poets.find((p) => p.name === "Mirza Ghalib")!;
  assert.equal(
    (await rankPoems(index, catalog, "ghlaib"))[0]?.poetId,
    ghalib.id,
  );
  assert.deepEqual(await rankPoems(index, catalog, "zzzzzznotapoem"), []);
  assert.deepEqual(await rankPoems(index, catalog, "!!!"), []);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    rankPoems(index, catalog, "ghalib", controller.signal),
    /cancelled/,
  );
});

test("Neeraj's storm poem is the top match for common Roman spellings", async () => {
  for (const query of [
    "main tufaano mein",
    "main tufaanon mein chalnein ka aadi hoon",
    "maiñ tuufaanoñ me chalane kaa aadii huuñ",
  ])
    assert.equal(
      (await rankPoems(index, catalog, query))[0]?.id,
      "p-ba56ddaf943b1119",
      query,
    );
});
