export type Script = "hi" | "en" | "ur";
export type Genre = "kavita" | "ghazal" | "pada" | "shayari" | "bhajan";
export type Sort = "az" | "za";
export interface SearchIndex {
  tokens: string[];
  postings: string[];
}
export interface SourceRecord {
  title: string;
  author: string;
  type: string;
  hi: string[];
  en: string[];
  ur: string[];
}
export interface Poet {
  id: string;
  name: string;
  count: number;
  genres: string[];
}
export interface PoemSummary {
  id: string;
  poetId: string;
  title: string;
  firstLine: string;
  genre: string;
  scripts: Script[];
  chunk: string;
}
export interface Poem extends PoemSummary {
  text: Partial<Record<Script, string>>;
}
export interface Catalog {
  version: number;
  fingerprint: string;
  poets: Poet[];
  poems: PoemSummary[];
  genres: string[];
  sourceCount: number;
}
