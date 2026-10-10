import type { Script, Sort } from "../data/types";
export type ThemeChoice =
  "parchment" | "midnight" | "rose" | "forest" | "mono" | "system";
export interface Collection {
  id: string;
  name: string;
  description: string;
  color: number;
  poemIds: string[];
}
export interface UserState {
  version: 1;
  theme: ThemeChoice;
  language: "en" | "hi";
  script: Script;
  fontSize: number;
  lineHeight: number;
  readingWidth: number;
  sort: Sort;
  profileName: string;
  favourites: string[];
  poets: string[];
  collections: Collection[];
  history: string[];
  positions: Record<string, number>;
  searches: string[];
}
export const defaultState: UserState = {
  version: 1,
  theme: "parchment",
  language: "en",
  script: "hi",
  fontSize: 23,
  lineHeight: 1.9,
  readingWidth: 680,
  sort: "az",
  profileName: "Poetry lover",
  favourites: [],
  poets: [],
  collections: [],
  history: [],
  positions: {},
  searches: [],
};
const strings = (v: unknown): string[] =>
  Array.isArray(v)
    ? [
        ...new Set(
          v.filter((x): x is string => typeof x === "string" && x.length < 300),
        ),
      ].slice(0, 10000)
    : [];
export function parseState(raw: string): UserState {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid backup format");
  const s = value as Partial<UserState>;
  if (s.version !== 1)
    throw new Error("This library version is not supported.");
  return {
    ...defaultState,
    theme: [
      "parchment",
      "midnight",
      "rose",
      "forest",
      "mono",
      "system",
    ].includes(s.theme ?? "")
      ? s.theme!
      : "parchment",
    language: s.language === "hi" ? "hi" : "en",
    script: ["hi", "en", "ur"].includes(s.script ?? "") ? s.script! : "hi",
    fontSize: [19, 23, 28].includes(s.fontSize ?? 0) ? s.fontSize! : 23,
    lineHeight: [1.6, 1.9, 2.2].includes(s.lineHeight ?? 0)
      ? s.lineHeight!
      : 1.9,
    readingWidth: [520, 680, 840].includes(s.readingWidth ?? 0)
      ? s.readingWidth!
      : 680,
    sort: s.sort === "za" ? "za" : "az",
    profileName:
      typeof s.profileName === "string"
        ? s.profileName.slice(0, 60)
        : defaultState.profileName,
    favourites: strings(s.favourites),
    poets: strings(s.poets),
    history: strings(s.history).slice(0, 100),
    searches: strings(s.searches).slice(0, 8),
    positions:
      s.positions && typeof s.positions === "object"
        ? Object.fromEntries(
            Object.entries(s.positions).filter(
              ([id, n]) =>
                id.startsWith("p-") &&
                typeof n === "number" &&
                Number.isFinite(n) &&
                n >= 0 &&
                n <= 1,
            ),
          )
        : {},
    collections: Array.isArray(s.collections)
      ? s.collections
          .filter(
            (c) =>
              c &&
              typeof c.id === "string" &&
              typeof c.name === "string" &&
              c.name.trim(),
          )
          .slice(0, 300)
          .filter((c, i, a) => a.findIndex((x) => x.id === c.id) === i)
          .map((c) => ({
            id: c.id.slice(0, 100),
            name: c.name.trim().slice(0, 60),
            description:
              typeof c.description === "string"
                ? c.description.slice(0, 240)
                : "",
            color:
              Number.isInteger(c.color) && c.color >= 0 && c.color <= 3
                ? c.color
                : 0,
            poemIds: strings(c.poemIds),
          }))
      : [],
  };
}
export const toggleId = (ids: string[], id: string) =>
  ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
export function moveItem(ids: string[], index: number, direction: -1 | 1) {
  const next = index + direction;
  if (index < 0 || next < 0 || index >= ids.length || next >= ids.length)
    return ids;
  const copy = [...ids];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return copy;
}
