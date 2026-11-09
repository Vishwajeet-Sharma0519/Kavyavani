import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { ArrowUpRight, BookOpen, Headphones, Heart } from "lucide-react-native";
import { useApp } from "../state/AppProvider";
import {
  Screen,
  Row,
  Txt,
  Section,
  PoetTile,
  Button,
  Chip,
  PoemCard,
  SearchBox,
  IconButton,
} from "../components/ui";
import { Botanical } from "../components/Botanical";
import {
  ThemeBackdrop,
  GradientWash,
  ThemeOrnament,
} from "../components/ThemeBackdrop";
import { NarrationSheet } from "../components/NarrationSheet";
import {
  catalog,
  dailyPoet,
  getPoemsByPoet,
  getPoemById,
  getPoemSummary,
} from "../data/repository";
import { useNav } from "../navigation/types";
import { toggleId } from "../state/model";
export default function HomeScreen() {
  const { state, setState, theme, t } = useApp(),
    nav = useNav(),
    { width } = useWindowDimensions(),
    [query, setQuery] = useState(""),
    [narration, setNarration] = useState(false),
    [excerpt, setExcerpt] = useState("");
  const poet = dailyPoet(),
    poem = poet ? getPoemsByPoet(poet.id)[0] : undefined;
  useEffect(() => {
    let active = true;
    if (poem)
      getPoemById(poem.id)
        .then((p) => {
          if (active)
            setExcerpt(
              (p.text[state.script] ?? p.text.hi ?? "")
                .split("\n")
                .slice(0, 4)
                .join("\n"),
            );
        })
        .catch(() => {
          if (active) setExcerpt(poem.firstLine);
        });
    return () => {
      active = false;
    };
  }, [poem, state.script]);
  const discover = () =>
    nav.navigate("Tabs", { screen: "Discover", params: { query } });
  const poets = [...catalog.poets]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  return (
    <Screen>
      <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <Txt kind="label" muted>
          {t(
            "A LITTLE STILLNESS. A FEW GOOD WORDS.",
            "थोड़ा ठहराव। कुछ सुंदर शब्द।",
          )}
        </Txt>
        <Row style={{ gap: 5 }}>
          {(["en", "hi"] as const).map((l) => (
            <Pressable
              key={l}
              accessibilityRole="button"
              accessibilityState={{ selected: state.language === l }}
              aria-selected={state.language === l}
              onPress={() => setState((s) => ({ ...s, language: l }))}
              style={{
                paddingHorizontal: 12,
                minHeight: 44,
                justifyContent: "center",
                borderBottomWidth: state.language === l ? 1 : 0,
                borderColor: theme.primary,
              }}
            >
              <Txt
                style={{
                  fontSize: 12,
                  color: state.language === l ? theme.primary : theme.muted,
                }}
              >
                {l === "en" ? "English" : "हिन्दी"}
              </Txt>
            </Pressable>
          ))}
        </Row>
      </Row>
      <View
        style={{
          flexDirection: width > 780 ? "row" : "column",
          alignItems: "center",
          gap: 20,
          paddingBottom: 8,
        }}
      >
        <View style={{ flex: 1, width: "100%", gap: 18 }}>
          <Txt
            kind="title"
            style={{
              fontSize: width > 780 ? 64 : 43,
              lineHeight: width > 780 ? 70 : 54,
              maxWidth: 650,
            }}
          >
            {t("Words that stay\nwith you.", "शब्द, जो आपके\nसाथ ठहर जाएँ।")}
          </Txt>
          <Txt muted style={{ maxWidth: 490, fontSize: 15, lineHeight: 26 }}>
            {t(
              "Find a familiar feeling in an unfamiliar verse. A quiet corner for poetry, and for yourself.",
              "किसी अनजान पंक्ति में अपना-सा एहसास खोजिए। कविताओं के लिए, और अपने लिए, एक शांत कोना।",
            )}
          </Txt>
          <View style={{ maxWidth: 510, width: "100%", marginTop: 4 }}>
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder={t(
                "Find a poet, a poem, a feeling…",
                "कवि, कविता या कोई शब्द खोजें…",
              )}
              onSubmit={discover}
            />
            {!!query && (
              <Button
                label={t("Search the collection", "रचनाओं में खोजें")}
                onPress={discover}
                style={{ marginTop: 8 }}
              />
            )}
          </View>
          <Row style={{ gap: 14, marginTop: 5 }}>
            <View
              style={{ width: 28, height: 1, backgroundColor: theme.accent }}
            />
            <Txt muted style={{ fontSize: 11 }}>
              {catalog.poets.length} {t("poets", "कवि")} ·{" "}
              {catalog.poems.length.toLocaleString()} {t("poems", "रचनाएँ")} ·{" "}
              {t("a world within", "अपने भीतर एक दुनिया")}
            </Txt>
          </Row>
        </View>
        {width > 680 &&
          (theme.motif === "none" ? (
            <Botanical size={width > 1000 ? 310 : 235} />
          ) : (
            <View
              style={{
                width: width > 1000 ? 310 : 235,
                aspectRatio: 1,
                opacity: 0.34,
              }}
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              aria-hidden
            >
              <ThemeOrnament palette={theme} />
            </View>
          ))}
      </View>
      <View style={{ height: 1, backgroundColor: theme.border }} />
      <View style={{ gap: 10 }}>
        <Section
          title={t("Meet the poets", "कवियों से मिलिए")}
          action={t("Explore all poets", "सभी कवि देखें")}
          onPress={() =>
            nav.navigate("Tabs", {
              screen: "Discover",
              params: { query: "", genre: "", tab: "Poets" },
            })
          }
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 7 }}
        >
          {poets.map((p) => (
            <PoetTile key={p.id} poet={p} compact={width < 600} />
          ))}
        </ScrollView>
      </View>
      {poem && poet && (
        <View
          style={{ flexDirection: width > 850 ? "row" : "column", gap: 24 }}
        >
          <View
            style={{
              flex: 1.7,
              backgroundColor: theme.soft,
              borderRadius: 14,
              padding: width > 600 ? 32 : 23,
              borderColor: theme.border,
              borderWidth: 1,
              gap: 16,
              boxShadow: `0 6px 28px ${theme.glow}24`,
            }}
          >
            <ThemeBackdrop palette={theme} compact radius={13} />
            <Row style={{ justifyContent: "space-between" }}>
              <Txt kind="label" style={{ color: theme.primary }}>
                {t("THE DAILY VERSE", "आज की कविता")}
              </Txt>
              <BookOpen size={20} strokeWidth={1.2} color={theme.accent} />
            </Row>
            <Txt
              kind="verse"
              style={{
                fontSize: width > 600 ? 24 : 20,
                lineHeight: state.script === "ur" ? 47 : 39,
                textAlign: state.script === "ur" ? "right" : "left",
                writingDirection: state.script === "ur" ? "rtl" : "ltr",
                fontFamily:
                  state.script === "ur"
                    ? "Nastaliq"
                    : state.script === "en"
                      ? "Literary"
                      : "Devanagari",
              }}
            >
              {excerpt || poem.firstLine}
            </Txt>
            <Txt muted style={{ fontSize: 12 }}>
              — {poet.name}
            </Txt>
            <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <Button
                label={t("Read the poem", "कविता पढ़ें")}
                icon={<BookOpen size={16} color={theme.onPrimary} />}
                onPress={() => nav.navigate("Reader", { id: poem.id })}
              />
              <Row style={{ gap: 2 }}>
                <IconButton
                  label={t("Find a recitation", "वाचन खोजें")}
                  onPress={() => setNarration(true)}
                >
                  <Headphones size={20} color={theme.primary} />
                </IconButton>
                <IconButton
                  selected={state.favourites.includes(poem.id)}
                  label={t("Save daily poem", "आज की कविता सहेजें")}
                  onPress={() =>
                    setState((s) => ({
                      ...s,
                      favourites: toggleId(s.favourites, poem.id),
                    }))
                  }
                >
                  <Heart
                    size={20}
                    color={theme.primary}
                    fill={
                      state.favourites.includes(poem.id)
                        ? theme.primary
                        : "transparent"
                    }
                  />
                </IconButton>
              </Row>
            </Row>
          </View>
          <View
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.surface,
              borderRadius: 14,
              padding: 28,
              gap: 18,
              justifyContent: "center",
              boxShadow: `0 6px 28px ${theme.glow}18`,
            }}
          >
            <GradientWash from={theme.surface} to={theme.soft} radius={13} />
            <Txt kind="label" muted>
              {t("POET IN FOCUS", "आज के कवि")}
            </Txt>
            <Txt kind="title" style={{ fontSize: 34 }}>
              {poet.name}
            </Txt>
            <Txt muted>
              {poet.count}{" "}
              {t(
                "poems to spend a little time with. Let the first line lead the way.",
                "रचनाएँ, जिनके साथ कुछ समय बिताएँ। पहली पंक्ति से शुरुआत करें।",
              )}
            </Txt>
            <Pressable
              accessibilityRole="button"
              onPress={() => nav.navigate("Poet", { id: poet.id })}
            >
              <Row style={{ minHeight: 44 }}>
                <Txt style={{ color: theme.primary }}>
                  {t("Step into their words", "इनकी रचनाएँ पढ़ें")}
                </Txt>
                <ArrowUpRight size={18} color={theme.primary} />
              </Row>
            </Pressable>
          </View>
        </View>
      )}
      <View style={{ gap: 16 }}>
        <Section
          title={t("Find your kind of poetry", "अपनी पसंद की कविता खोजें")}
        />
        <Row style={{ flexWrap: "wrap", gap: 10 }}>
          {catalog.genres.map((g) => (
            <Chip
              key={g}
              label={g.charAt(0).toUpperCase() + g.slice(1)}
              onPress={() =>
                nav.navigate("Tabs", {
                  screen: "Discover",
                  params: { genre: g, query: "" },
                })
              }
            />
          ))}
        </Row>
      </View>
      {!!state.history.length && (
        <View>
          <Section
            title={t(
              "Pick up where you left off",
              "जहाँ रुके थे, वहीं से शुरू करें",
            )}
            action={t("Your library", "आपका संग्रह")}
            onPress={() => nav.navigate("Tabs", { screen: "Library" })}
          />
          {state.history.slice(0, 3).map((id) => {
            const p = getPoemSummary(id);
            return p ? <PoemCard key={id} poem={p} /> : null;
          })}
        </View>
      )}
      <View style={{ alignItems: "center", paddingVertical: 22, gap: 8 }}>
        <Txt kind="title" style={{ color: theme.accent, fontSize: 27 }}>
          काव्यवाणी
        </Txt>
        <Txt muted style={{ fontSize: 11 }}>
          {t("Make a little room for poetry.", "कविता के लिए थोड़ी जगह बनाइए।")}
        </Txt>
      </View>
      <NarrationSheet
        visible={narration}
        onClose={() => setNarration(false)}
        poemId={poem?.id}
      />
    </Screen>
  );
}
