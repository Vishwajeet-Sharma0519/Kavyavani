import { ThemeCanvas } from "../components/ThemeBackdrop";
import React, { useState } from "react";
import { FlatList, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Heart } from "lucide-react-native";
import { useApp } from "../state/AppProvider";
import {
  Txt,
  Row,
  PoetTile,
  Button,
  Chip,
  SearchBox,
  PoemCard,
  Empty,
  Loading,
} from "../components/ui";
import {
  getPoetById,
  getPoemsByPoet,
  getSortedPoems,
} from "../data/repository";
import type { RootRoutes } from "../navigation/types";
import { toggleId } from "../state/model";
import { NarrationSheet } from "../components/NarrationSheet";
import { usePoemSearch } from "../data/usePoemSearch";
export default function PoetScreen({
  route,
}: NativeStackScreenProps<RootRoutes, "Poet">) {
  const { state, setState, theme, t } = useApp(),
    poet = getPoetById(route.params.id),
    [query, setQuery] = useState(""),
    [genre, setGenre] = useState(""),
    [tab, setTab] = useState("Works"),
    [retry, setRetry] = useState(0),
    [narration, setNarration] = useState<string>();
  const { results, busy, error } = usePoemSearch(query, true, retry);
  if (!poet)
    return (
      <Empty
        title={t("Poet unavailable", "कवि उपलब्ध नहीं")}
        description={t(
          "This poet is not in the current dataset.",
          "यह कवि वर्तमान डेटा में नहीं है।",
        )}
      />
    );
  const filtered = (query.trim() ? results : getPoemsByPoet(poet.id)).filter(
    (p) => p.poetId === poet.id && (!genre || p.genre === genre),
  );
  const works = query.trim() ? filtered : getSortedPoems(state.sort, filtered);
  const saved = state.poets.includes(poet.id);
  return (
    <ThemeCanvas>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          width: "100%",
          maxWidth: 1000,
          alignSelf: "center",
          padding: 24,
          paddingBottom: 40,
        }}
        data={tab === "Works" && !busy && !error ? works : []}
        keyExtractor={(p) => p.id}
        initialNumToRender={12}
        windowSize={5}
        ListHeaderComponent={
          <View style={{ gap: 20 }}>
            <Row style={{ flexWrap: "wrap" }}>
              <PoetTile poet={poet} />
              <View style={{ flex: 1, minWidth: 180, gap: 14 }}>
                <Txt kind="label" muted>
                  {t(
                    "THE VOICES WE RETURN TO",
                    "वे आवाज़ें, जिनके पास लौटते हैं",
                  )}
                </Txt>
                <Txt kind="title" style={{ fontSize: 42, lineHeight: 50 }}>
                  {poet.name}
                </Txt>
                <Txt muted>
                  {poet.count}{" "}
                  {t("poems in the collection", "रचनाएँ इस संग्रह में")} ·{" "}
                  {poet.genres.join(", ")}
                </Txt>
                <Button
                  label={
                    saved
                      ? t("Poet saved", "कवि सहेजा गया")
                      : t("Save poet", "कवि सहेजें")
                  }
                  icon={
                    <Heart
                      size={17}
                      color={theme.onPrimary}
                      fill={saved ? theme.onPrimary : "transparent"}
                    />
                  }
                  onPress={() =>
                    setState((s) => ({
                      ...s,
                      poets: toggleId(s.poets, poet.id),
                    }))
                  }
                  style={{ alignSelf: "flex-start" }}
                />
              </View>
            </Row>
            <Row>
              {["Works", "About"].map((label, i) => (
                <Chip
                  key={label}
                  label={t(label, ["रचनाएँ", "परिचय"][i])}
                  active={tab === label}
                  onPress={() => setTab(label)}
                />
              ))}
            </Row>
            {tab === "Works" ? (
              <>
                <SearchBox
                  value={query}
                  onChange={setQuery}
                  placeholder={t(
                    "Search within these poems…",
                    "इन रचनाओं में खोजें…",
                  )}
                />
                <Row style={{ flexWrap: "wrap" }}>
                  <Chip
                    label={t("All forms", "सभी विधाएँ")}
                    active={!genre}
                    onPress={() => setGenre("")}
                  />
                  {poet.genres.map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      active={genre === g}
                      onPress={() => setGenre(g)}
                    />
                  ))}
                  <Button
                    subtle
                    disabled={!!query.trim()}
                    label={
                      query.trim()
                        ? t("Best matches", "सबसे नज़दीकी परिणाम")
                        : state.sort === "az"
                          ? "A → Z"
                          : "Z → A"
                    }
                    onPress={() =>
                      setState((s) => ({
                        ...s,
                        sort: s.sort === "az" ? "za" : "az",
                      }))
                    }
                  />
                </Row>
                <Txt muted style={{ fontSize: 12 }}>
                  {works.length} {t("poems", "रचनाएँ")}
                </Txt>
              </>
            ) : (
              <View
                style={{
                  padding: 24,
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderWidth: 1,
                  borderRadius: 12,
                  gap: 12,
                }}
              >
                <Txt kind="title">
                  {t(
                    "Let the poetry introduce them.",
                    "कविता ही इनका परिचय बने।",
                  )}
                </Txt>
                <Txt muted>
                  {t(
                    "The supplied dataset includes their name and poetry, but no verified biography, dates, or portrait. Their original works are available in the Works tab.",
                    "दिए गए डेटा में इनका नाम और रचनाएँ हैं, लेकिन प्रमाणित जीवनी, तिथियाँ या चित्र नहीं हैं। इनकी कविताएँ रचनाएँ टैब में पढ़ें।",
                  )}
                </Txt>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <PoemCard poem={item} onListen={() => setNarration(item.id)} />
        )}
        ListEmptyComponent={
          tab === "About" ? null : busy ? (
            <Loading label={t("Searching…", "खोज जारी है…")} />
          ) : error ? (
            <Empty
              title={t("Search unavailable", "खोज उपलब्ध नहीं")}
              description={error}
            >
              <Button
                label={t("Retry", "फिर प्रयास करें")}
                onPress={() => setRetry((n) => n + 1)}
              />
            </Empty>
          ) : (
            <Empty
              title={t("No poems match", "कोई रचना नहीं मिली")}
              description={t(
                "Try a shorter search or another form.",
                "छोटे शब्द या दूसरी विधा आज़माएँ।",
              )}
            />
          )
        }
        ListFooterComponent={
          <NarrationSheet
            visible={!!narration}
            poemId={narration}
            onClose={() => setNarration(undefined)}
          />
        }
      />
    </ThemeCanvas>
  );
}
