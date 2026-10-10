import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  parseState,
  defaultState,
  moveItem,
  toggleId,
} from "../src/state/model.ts";
import { normalizeSearch, matches, searchIndex } from "../src/data/search.ts";
import { getScriptText } from "../src/data/scripts.ts";
import { themes } from "../src/theme/themes.ts";
import type { Poem, SourceRecord, Catalog } from "../src/data/types.ts";
const root = new URL("../", import.meta.url);
const source: SourceRecord[] = JSON.parse(
  await readFile(
    new URL("../../kavya_merged_final.json", import.meta.url),
    "utf8",
  ),
);
const catalog: Catalog = JSON.parse(
  await readFile(new URL("src/generated/catalog.json", root), "utf8"),
);
test("compact full-text index agrees with canonical text in all scripts", async () => {
  const index = JSON.parse(
    await readFile(
      new URL(`public/data/${catalog.fingerprint}/search.json`, root),
      "utf8",
    ),
  );
  const searchable = source.map((r) =>
    normalizeSearch(
      [r.title, r.author, r.type, ...r.hi, ...r.en, ...r.ur].join(" "),
    ),
  );
  for (const query of [
    "Ghalib",
    "प्रेम",
    "बाग़",
    "آسمان",
    "aa gayaa",
    "Mirza ghazal",
    "zzzzzznotapoem",
  ]) {
    const actual = await searchIndex(index, query);
    const expected = searchable.flatMap((text, i) =>
      matches(text, query) ? [i] : [],
    );
    assert.deepEqual(
      [...actual].sort((a, b) => a - b),
      expected,
      query,
    );
  }
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    searchIndex(index, "ghalib", controller.signal),
    /cancelled/,
  );
});
test("all supplied entries, poets, IDs and exact script line breaks survive normalization", async () => {
  assert.equal(catalog.poems.length, source.length);
  assert.equal(catalog.poets.length, 109);
  assert.equal(new Set(catalog.poems.map((p) => p.id)).size, source.length);
  const chunks = new Map<string, Poem[]>();
  for (const p of catalog.poems) {
    if (!chunks.has(p.chunk))
      chunks.set(
        p.chunk,
        JSON.parse(
          await readFile(new URL(`public/data/${p.chunk}`, root), "utf8"),
        ),
      );
  }
  for (const [i, p] of catalog.poems.entries()) {
    const record = chunks.get(p.chunk)!.find((r) => r.id === p.id)!;
    assert.equal(record.title, source[i].title);
    for (const script of ["hi", "en", "ur"] as const) {
      assert.equal(record.text[script], source[i][script].join("\n"));
      assert.equal(
        getScriptText(record, script).text,
        source[i][script].join("\n"),
      );
    }
    const identity = JSON.stringify([
      source[i].author
        .normalize("NFKC")
        .toLocaleLowerCase()
        .replace(/\s+/g, " ")
        .trim(),
      record.text,
    ]);
    assert.equal(
      record.id,
      `p-${createHash("sha256").update(identity).digest("hex").slice(0, 16)}`,
    );
  }
  for (const poet of catalog.poets)
    assert.equal(
      poet.count,
      catalog.poems.filter((p) => p.poetId === poet.id).length,
    );
});
test("search folds Latin accents but preserves Hindi vowels and finds real verses", () => {
  assert.equal(normalizeSearch("  Ghālib  "), "ghalib");
  assert.equal(normalizeSearch("कवि"), "कवि");
  assert.notEqual(normalizeSearch("कवि"), normalizeSearch("कव"));
  assert(matches(normalizeSearch("Meer Taqi Meer"), "meer taqi"));
  assert(
    source.some((r) => matches(normalizeSearch(r.hi.join("\n")), "प्रेम")),
  );
});
test("saved libraries round-trip without losing collections, themes, order or reading progress", () => {
  const state = {
    ...defaultState,
    theme: "midnight" as const,
    favourites: [catalog.poems[0].id],
    poets: [catalog.poets[0].id],
    history: [catalog.poems[0].id],
    positions: { [catalog.poems[0].id]: 0.63 },
    collections: [
      {
        id: "test",
        name: "Night",
        description: "Quiet words",
        color: 2,
        poemIds: catalog.poems.slice(0, 3).map((p) => p.id),
      },
    ],
  };
  assert.deepEqual(parseState(JSON.stringify(state)), state);
  assert.deepEqual(moveItem(["a", "b", "c"], 1, -1), ["b", "a", "c"]);
  assert.deepEqual(moveItem(["a", "b"], 0, -1), ["a", "b"]);
  assert.deepEqual(toggleId(["a"], "a"), []);
});
test("corrupt, malicious and incompatible storage is handled safely", () => {
  assert.throws(() => parseState("{"));
  assert.throws(() => parseState("null"));
  assert.throws(() => parseState('{"version":2}'));
  const s = parseState(
    JSON.stringify({
      version: 1,
      theme: "invalid",
      fontSize: 500,
      positions: { "p-test": 2 },
      favourites: [null, 4, "ok", "ok"],
      collections: [
        null,
        {},
        { id: "one", name: "A", color: 900, poemIds: [4, "p-1"] },
      ],
    }),
  );
  assert.equal(s.theme, "parchment");
  assert.equal(s.fontSize, 23);
  assert.deepEqual(s.positions, {});
  assert.deepEqual(s.favourites, ["ok"]);
  assert.equal(s.collections[0].color, 0);
});
test("unavailable scripts fall back honestly; Urdu has RTL direction", () => {
  const p: Poem = {
    ...catalog.poems[0],
    scripts: ["hi"],
    text: { hi: "मूल\nपाठ" },
  };
  const v = getScriptText(p, "ur");
  assert.equal(v.available, false);
  assert.equal(v.script, "hi");
  assert.equal(v.text, p.text.hi);
  assert.equal(
    getScriptText({ ...p, scripts: ["ur"], text: { ur: "شعر" } }, "ur")
      .direction,
    "rtl",
  );
});
function luminance(hex: string) {
  const rgb = hex
    .match(/[a-f\d]{2}/gi)!
    .map((x) => parseInt(x, 16) / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
test("all five themes maintain readable text and button contrast", () => {
  assert.equal(Object.keys(themes).length, 5);
  for (const p of Object.values(themes)) {
    for (const background of [
      p.bg,
      p.surface,
      p.soft,
      p.gradientStart,
      p.gradientEnd,
    ]) {
      assert(contrast(p.text, background) >= 4.5, p.name + " body");
      assert(contrast(p.muted, background) >= 4.5, p.name + " secondary");
    }
    for (const background of [p.primary, p.primaryEnd]) {
      assert(
        contrast(p.onPrimary, background) >= 4.5,
        p.name + " button gradient",
      );
    }
  }
});
