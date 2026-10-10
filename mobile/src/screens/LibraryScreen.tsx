import { ThemeCanvas } from "../components/ThemeBackdrop";
import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { Plus } from "lucide-react-native";
import { useApp } from "../state/AppProvider";
import {
  Txt,
  Row,
  Button,
  Chip,
  PoemCard,
  PoetTile,
  Empty,
} from "../components/ui";
import { CollectionCard } from "../components/CollectionCard";
import { CollectionEditor } from "../components/CollectionEditor";
import { getPoemSummary, getPoetById } from "../data/repository";
import { useNav } from "../navigation/types";
export default function LibraryScreen() {
  const { state, theme, t } = useApp(),
    nav = useNav(),
    [tab, setTab] = useState("collections"),
    [create, setCreate] = useState(false);
  const data =
    tab === "poems"
      ? state.favourites
      : tab === "poets"
        ? state.poets
        : tab === "history"
          ? state.history
          : state.collections.map((c) => c.id);
  return (
    <ThemeCanvas>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          maxWidth: 1120,
          width: "100%",
          alignSelf: "center",
          padding: 24,
          paddingBottom: 50,
        }}
        data={tab === "collections" ? [] : data}
        keyExtractor={(id) => id}
        initialNumToRender={12}
        windowSize={5}
        ListHeaderComponent={
          <View style={{ gap: 22 }}>
            <Txt kind="label" muted>
              {t("WORDS YOU WANT TO KEEP", "शब्द, जिन्हें सहेज लेना चाहें")}
            </Txt>
            <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <Txt kind="title" style={{ fontSize: 44, lineHeight: 54 }}>
                {t("Your little library.", "आपकी अपनी लाइब्रेरी।")}
              </Txt>
              <Button
                label={t("New collection", "नया संग्रह")}
                icon={<Plus size={17} color={theme.onPrimary} />}
                onPress={() => setCreate(true)}
              />
            </Row>
            <Txt muted>
              {t(
                "The lines that found you. The poets you return to. All in one place.",
                "वे पंक्तियाँ जो अपनी लगीं। वे कवि जिन्हें बार-बार पढ़ना चाहें। सब एक जगह।",
              )}
            </Txt>
            <Row style={{ flexWrap: "wrap" }}>
              {[
                [
                  "collections",
                  t("Collections", "संग्रह"),
                  state.collections.length,
                ],
                [
                  "poems",
                  t("Saved poems", "सहेजी कविताएँ"),
                  state.favourites.length,
                ],
                ["poets", t("Saved poets", "सहेजे कवि"), state.poets.length],
                [
                  "history",
                  t("Recently read", "हाल में पढ़ा"),
                  state.history.length,
                ],
              ].map(([key, label, count]) => (
                <Chip
                  key={key}
                  label={`${label} · ${count}`}
                  active={tab === key}
                  onPress={() => setTab(String(key))}
                />
              ))}
            </Row>
            {tab === "collections" && !!state.collections.length && (
              <Row
                style={{
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  gap: 22,
                  paddingVertical: 10,
                }}
              >
                {state.collections.map((c) => (
                  <CollectionCard key={c.id} collection={c} />
                ))}
              </Row>
            )}
          </View>
        }
        renderItem={({ item }) => {
          if (tab === "poets") {
            const p = getPoetById(item);
            return p ? (
              <Row style={{ borderBottomWidth: 1, borderColor: theme.border }}>
                <PoetTile poet={p} compact />
                <View style={{ flex: 1 }}>
                  <Txt kind="title">{p.name}</Txt>
                  <Txt muted>
                    {p.count} {t("poems", "रचनाएँ")}
                  </Txt>
                </View>
              </Row>
            ) : null;
          }
          const p = getPoemSummary(item);
          return p ? <PoemCard poem={p} /> : null;
        }}
        ListEmptyComponent={
          !data.length ? (
            <Empty
              title={
                tab === "collections"
                  ? t(
                      "Every collection starts with a verse.",
                      "हर संग्रह एक कविता से शुरू होता है।",
                    )
                  : tab === "history"
                    ? t(
                        "Your next favourite is waiting.",
                        "आपकी अगली पसंद इंतज़ार में है।",
                      )
                    : t(
                        "Keep the words that move you.",
                        "मन को छू जाएँ, उन शब्दों को सहेजें।",
                      )
              }
              description={
                tab === "collections"
                  ? t(
                      "Gather poems by feeling, by poet, or just because.",
                      "एहसास के नाम पर, कवि के नाम पर, या बस यूँ ही।",
                    )
                  : t(
                      "Read a poem or tap a heart to make this space yours.",
                      "कोई कविता पढ़ें या दिल के निशान को दबाएँ।",
                    )
              }
            >
              <Button
                label={
                  tab === "collections"
                    ? t("Create a collection", "संग्रह बनाएँ")
                    : t("Discover poetry", "कविताएँ खोजें")
                }
                onPress={() =>
                  tab === "collections"
                    ? setCreate(true)
                    : nav.navigate("Tabs", { screen: "Discover" })
                }
              />
            </Empty>
          ) : null
        }
        ListFooterComponent={
          <>
            <Txt
              muted
              style={{ fontSize: 11, textAlign: "center", marginTop: 36 }}
            >
              {t(
                "Saved on this device. Back up your library in Settings.",
                "इस डिवाइस पर सहेजा गया। सेटिंग में लाइब्रेरी का बैकअप लें।",
              )}
            </Txt>
            <CollectionEditor
              visible={create}
              onClose={() => setCreate(false)}
            />
          </>
        }
      />
    </ThemeCanvas>
  );
}
