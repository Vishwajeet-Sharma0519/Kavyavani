import { useEffect, useState } from "react";
import { catalog, searchPoems } from "./repository";
import type { PoemSummary } from "./types";

export function usePoemSearch(query: string, enabled = true, retry = 0) {
  const [response, setResponse] = useState<{
    query: string;
    retry: number;
    results: PoemSummary[];
    error: string;
  }>({ query: "", retry: 0, results: catalog.poems, error: "" });
  const searching = enabled && !!query.trim();
  const current = response.query === query && response.retry === retry;
  useEffect(() => {
    if (!searching) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchPoems(query, controller.signal)
        .then((results) => {
          if (!controller.signal.aborted)
            setResponse({ query, retry, results, error: "" });
        })
        .catch((error) => {
          if (!controller.signal.aborted)
            setResponse({
              query,
              retry,
              results: [],
              error:
                error instanceof Error ? error.message : "Search unavailable",
            });
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, searching, retry]);
  return {
    results: query.trim() ? response.results : catalog.poems,
    busy: searching && !current,
    error: searching && current ? response.error : "",
  };
}
