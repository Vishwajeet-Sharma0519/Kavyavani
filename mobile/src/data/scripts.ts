import type { Poem, Script } from "./types";
export const scriptLabels: Record<Script, string> = {
  hi: "देवनागरी",
  en: "Roman",
  ur: "اردو",
};
export function getScriptText(poem: Poem, requested: Script) {
  const script = poem.text[requested] ? requested : poem.scripts[0];
  return {
    script,
    text: poem.text[script] ?? "",
    direction: script === "ur" ? ("rtl" as const) : ("ltr" as const),
    source: "dataset" as const,
    available: !!poem.text[requested],
  };
}
