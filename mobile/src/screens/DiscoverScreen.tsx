import { ThemeCanvas } from "../components/ThemeBackdrop";
import React, { useMemo, useState } from "react";
import { FlatList, View, Pressable } from "react-native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useApp } from "../state/AppProvider";
import {
  Txt,
  Row,
  SearchBox,
  Chip,
  PoemCard,
  Empty,
  Loading,
  Button,
  PoetTile,
} from "../components/ui";
import {
  catalog,
  searchPoets,
  getSortedPoems,
  getSortedPoets,
  getFilteredPoems,
  getPoemSummary,
  getPoetById,
} from "../data/repository";
import type { Script } from "../data/types";
import { usePoemSearch } from "../data/usePoemSearch";
import type { TabRoutes } from "../navigation/types";
import { useNav } from "../navigation/types";
import { scriptLabels } from "../data/scripts";
import { matches, normalizeSearch } from "../data/search";
export default function DiscoverScreen(
  props: BottomTabScreenProps<TabRoutes, "Discover">,
) {
  return (
    <DiscoverContents
      key={JSON.stringify(props.route.params ?? {})}
      {...props}
    />
  );
}
function DiscoverContents({
  route,
}: BottomTabScreenProps<TabRoutes, "Discover">) {
  const { state, setState, theme, t } = useApp(),
    nav = useNav(),
    [query, setQuery] = useState(route.params?.query ?? ""),
    [genre, setGenre] = useState(route.params?.genre ?? ""),
    [script, setScript] = useState<Script | undefined>(),
    [tab, setTab] = useState<string>(route.params?.tab ?? "Poems"),
    [retry, setRetry] = useState(0);
  const { results, busy, error } = usePoemSearch(query, tab === "Poems", retry);
  const remember = () => {
    if (query.trim())
      setState((s) => ({
        ...s,
        searches: [
          query.trim(),
          ...s.searches.filter((q) => q !== query.trim()),
        ].slice(0, 8),
      }));
  };
  const data = useMemo(
    () =>
      tab === "Poems"
        ? getSortedPoems(
            state.sort,
            getFilteredPoems({ genre, script }, results),
          ).map((p) => p.id)
        : tab === "Poets"
          ? getSortedPoets(
              state.sort,
              searchPoets(query).filter(
                (p) => !genre || p.genres.includes(genre),
              ),
            ).map((p) => p.id)
          : state.collections
              .filter((c) =>
                matches(normalizeSearch(`${c.name} ${c.description}`), query),
              )
              .map((c) => c.id),
    [tab, state.sort, state.collections, results, query, genre, script],
  );
  return (
    <ThemeCanvas>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: "100%",
          maxWidth: 1120,
          alignSelf: "center",
          padding: 24,
          paddingBottom: 48,
        }}
        data={busy || error ? [] : data}
        keyExtractor={(id) => id}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={5}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: 18, paddingBottom: 12 }}>
            <Txt kind="label" muted>
              {t("FOLLOW YOUR CURIOSITY", "अपनी जिज्ञासा के साथ चलिए")}
            </Txt>
            <Txt kind="title" style={{ fontSize: 43, lineHeight: 56 }}>
              {t("A verse for every version of you.", "हर मन के लिए एक कविता।")}
            </Txt>
            <SearchBox
              value={query}
              onChange={setQuery}
              onSubmit={remember}
              placeholder={t(
                "Search poets, titles, or any line of a poem…",
                "कवि, शीर्षक या कविता की कोई पंक्ति खोजें…",
              )}
            />
            {!query && (
              <Row style={{ flexWrap: "wrap" }}>
                <Txt muted style={{ fontSize: 12 }}>
                  {state.searches.length
                    ? t("Recent", "हाल की खोज")
                    : t("Try", "खोजकर देखें")}
                </Txt>
                {(state.searches.length
                  ? state.searches
                  : ["Ghalib", "Kabir", "प्रेम"]
                ).map((q) => (
                  <Chip key={q} label={q} onPress={() => setQuery(q)} />
                ))}
                {!!state.searches.length && (
                  <Button
                    subtle
                    label={t("Clear recent", "हाल की खोज मिटाएँ")}
                    onPress={() => setState((s) => ({ ...s, searches: [] }))}
                  />
                )}
              </Row>
            )}
            <Row style={{ flexWrap: "wrap" }}>
              {["Poems", "Poets", "Collections"].map((label, i) => (
                <Chip
                  key={label}
                  label={t(label, ["कविताएँ", "कवि", "संग्रह"][i])}
                  active={tab === label}
                  onPress={() => {
                    remember();
                    setTab(label);
                  }}
                />
              ))}
            </Row>
            {tab !== "Collections" && (
              <>
                <Row style={{ flexWrap: "wrap", gap: 8 }}>
                  <Chip
                    label={t("All forms", "सभी विधाएँ")}
                    active={!genre}
                    onPress={() => setGenre("")}
                  />
                  {catalog.genres.map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      active={genre === g}
                      onPress={() => setGenre(g)}
                    />
                  ))}
                </Row>
                <Row
                  style={{ flexWrap: "wrap", justifyContent: "space-between" }}
                >
                  <Row style={{ flexWrap: "wrap", gap: 8 }}>
                    {tab === "Poems" && (
                      <>
                        <Txt muted style={{ fontSize: 12 }}>
                          {t("Script", "लिपि")}
                        </Txt>
                        {(["hi", "en", "ur"] as Script[]).map((s) => (
                          <Chip
                            key={s}
                            label={scriptLabels[s]}
                            active={script === s}
                            onPress={() =>
                              setScript(script === s ? undefined : s)
                            }
                          />
                        ))}
                      </>
                    )}
                  </Row>
                  <Button
                    subtle
                    label={state.sort === "az" ? "A → Z" : "Z → A"}
                    onPress={() =>
                      setState((s) => ({
                        ...s,
                        sort: s.sort === "az" ? "za" : "az",
                      }))
                    }
                  />
                </Row>
              </>
            )}
            <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <Txt muted style={{ fontSize: 12 }}>
                {busy
                  ? t(
                      "Searching the full verses…",
                      "सभी पंक्तियों में खोज रहे हैं…",
                    )
                  : `${data.length.toLocaleString()} ${t("results", "परिणाम")}`}
              </Txt>
              <Pressable
                accessibilityRole="button"
                style={{ minHeight: 44, justifyContent: "center" }}
                onPress={() => {
                  setQuery("");
                  setGenre("");
                  setScript(undefined);
                  setState((s) => ({ ...s, sort: "az" }));
                }}
              >
                <Txt style={{ color: theme.primary, fontSize: 12 }}>
                  {t("Reset filters", "फ़िल्टर हटाएँ")}
                </Txt>
              </Pressable>
            </Row>
          </View>
        }
        renderItem={({ item }) => {
          if (tab === "Poems") {
            const p = getPoemSummary(item);
            return p ? <PoemCard poem={p} /> : null;
          }
          if (tab === "Poets") {
            const p = getPoetById(item);
            return p ? (
              <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: theme.border,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <PoetTile poet={p} compact />
                <View style={{ flex: 1 }}>
                  <Txt kind="title" style={{ fontSize: 24 }}>
                    {p.name}
                  </Txt>
                  <Txt muted>{p.genres.join(" · ")}</Txt>
                  <Button
                    subtle
                    label={t("Read their work", "रचनाएँ पढ़ें")}
                    onPress={() => nav.navigate("Poet", { id: p.id })}
                    style={{ alignSelf: "flex-start", marginTop: 10 }}
                  />
                </View>
              </View>
            ) : null;
          }
          const c = state.collections.find((c) => c.id === item);
          return c ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => nav.navigate("Collection", { id: c.id })}
              style={{
                padding: 24,
                borderBottomWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Txt kind="title">{c.name}</Txt>
              <Txt muted>
                {c.poemIds.length} {t("poems", "रचनाएँ")}
              </Txt>
            </Pressable>
          ) : null;
        }}
        ListEmptyComponent={
          busy ? (
            <Loading
              label={t(
                "Searching all three scripts. The index downloads on your first search.",
                "तीनों लिपियों में खोज रहे हैं। पहली खोज पर अनुक्रमणिका डाउनलोड होती है।",
              )}
            />
          ) : error ? (
            <Empty
              title={t("Search needs a connection", "खोज के लिए कनेक्शन चाहिए")}
              description={error}
            >
              <Button
                label={t("Retry", "फिर प्रयास करें")}
                onPress={() => setRetry((n) => n + 1)}
              />
            </Empty>
          ) : (
            <Empty
              title={
                tab === "Collections"
                  ? t("Your own little anthologies", "आपके अपने छोटे संकलन")
                  : t("No verse found, yet", "अभी कोई रचना नहीं मिली")
              }
              description={
                tab === "Collections"
                  ? t(
                      "Create a collection in your Library, then find it here.",
                      "लाइब्रेरी में संग्रह बनाएँ, फिर उसे यहाँ खोजें।",
                    )
                  : t(
                      "Try a poet’s name, a shorter phrase, or another script.",
                      "कवि का नाम, छोटा वाक्यांश या दूसरी लिपि आज़माएँ।",
                    )
              }
            />
          )
        }
      />
    </ThemeCanvas>
  );
}
