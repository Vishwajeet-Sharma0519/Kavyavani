import { ThemeCanvas } from "../components/ThemeBackdrop";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  View,
  Pressable,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Heart,
  FolderPlus,
  Share2,
  SlidersHorizontal,
  Headphones,
} from "lucide-react-native";
import { useApp } from "../state/AppProvider";
import {
  Txt,
  Row,
  Chip,
  Button,
  IconButton,
  Sheet,
  Loading,
  Empty,
} from "../components/ui";
import { getPoemById, getPoetById } from "../data/repository";
import { scriptLabels, getScriptText } from "../data/scripts";
import type { Poem, Script } from "../data/types";
import type { RootRoutes } from "../navigation/types";
import { fonts } from "../theme/themes";
import { toggleId } from "../state/model";
import { NarrationSheet } from "../components/NarrationSheet";
import { recitationSelections } from "../data/recitations";
import { CollectionPicker } from "../components/CollectionEditor";
import { shareText } from "../services/sharing";
export default function ReaderScreen(
  props: NativeStackScreenProps<RootRoutes, "Reader">,
) {
  return <ReaderContents key={props.route.params.id} {...props} />;
}
function ReaderContents({
  route,
  navigation,
}: NativeStackScreenProps<RootRoutes, "Reader">) {
  const windowHeight = useWindowDimensions().height,
    headerHeight = useHeaderHeight();
  const { state, setState, theme, t } = useApp(),
    id = route.params.id,
    [poem, setPoem] = useState<Poem | null>(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0),
    [settings, setSettings] = useState(false),
    [narration, setNarration] = useState(false),
    [picker, setPicker] = useState(false),
    [notice, setNotice] = useState(""),
    [progress, setProgress] = useState(0);
  const recitation = recitationSelections.find((entry) => entry.poemId === id);
  const scroll = useRef<ScrollView>(null),
    last = useRef(state.positions[id] ?? 0),
    restored = useRef(false),
    contentHeight = useRef(0),
    viewport = useRef(windowHeight - headerHeight),
    initialProgress = useRef(state.positions[id] ?? 0);
  useEffect(() => {
    let active = true;
    restored.current = false;
    last.current = initialProgress.current;
    getPoemById(id)
      .then((p) => {
        if (active) {
          setPoem(p);
          setState((s) => ({
            ...s,
            history: [id, ...s.history.filter((x) => x !== id)].slice(0, 100),
          }));
        }
      })
      .catch((e) => {
        if (active)
          setError(e instanceof Error ? e.message : "Unable to load poem");
      });
    return () => {
      active = false;
    };
  }, [id, retry, setState]);
  useFocusEffect(
    useCallback(
      () => () => {
        if (restored.current)
          setState((s) => ({
            ...s,
            positions: { ...s.positions, [id]: last.current },
          }));
      },
      [id, setState],
    ),
  );
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timeout);
  }, [notice]);
  useEffect(() => {
    if (!restored.current) return;
    const timer = setTimeout(
      () =>
        setState((s) => ({
          ...s,
          positions: { ...s.positions, [id]: last.current },
        })),
      500,
    );
    return () => clearTimeout(timer);
  }, [progress, id, setState]);
  const restore = () => {
    if (
      poem &&
      !restored.current &&
      viewport.current > 0 &&
      contentHeight.current > viewport.current
    ) {
      restored.current = true;
      const y =
        initialProgress.current * (contentHeight.current - viewport.current);
      scroll.current?.scrollTo({ y, animated: false });
      setProgress(initialProgress.current);
    }
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent,
      range = contentSize.height - layoutMeasurement.height;
    if (!restored.current && range > 0 && initialProgress.current > 0) {
      restored.current = true;
      scroll.current?.scrollTo({
        y: initialProgress.current * range,
        animated: false,
      });
      return;
    }
    restored.current = true;
    last.current =
      range > 0 ? Math.max(0, Math.min(1, contentOffset.y / range)) : 1;
    setProgress(last.current);
  };
  if (error)
    return (
      <Empty title={t("A little pause", "एक छोटा विराम")} description={error}>
        <Button
          label={t("Try again", "फिर प्रयास करें")}
          onPress={() => {
            setError("");
            setPoem(null);
            setRetry((n) => n + 1);
          }}
        />
      </Empty>
    );
  if (!poem)
    return <Loading label={t("Opening the poem…", "कविता खोल रहे हैं…")} />;
  const displayed = getScriptText(poem, state.script),
    poet = getPoetById(poem.poetId),
    saved = state.favourites.includes(id);
  const share = async () => {
    try {
      const result = await shareText(
        poem.title,
        `${poem.title}\n— ${poet?.name ?? ""}\n\n${displayed.text}\n\nKavyavani`,
      );
      if (result === "copied")
        setNotice(
          t(
            "Poem copied. You can paste it anywhere.",
            "कविता कॉपी हो गई। अब कहीं भी पेस्ट करें।",
          ),
        );
    } catch {
      setNotice(
        t(
          "Sharing was unavailable. Please try again.",
          "साझा नहीं हो सका। फिर प्रयास करें।",
        ),
      );
    }
  };
  return (
    <ThemeCanvas>
      <View style={{ height: 2, backgroundColor: theme.border }}>
        <View
          style={{
            height: 2,
            width: `${Math.round(progress * 100)}%`,
            backgroundColor: theme.primary,
          }}
        />
      </View>
      <ScrollView
        ref={scroll}
        onScroll={onScroll}
        scrollEventThrottle={150}
        onLayout={(e) => {
          viewport.current = e.nativeEvent.layout.height;
          restore();
        }}
        onContentSizeChange={(_, height) => {
          contentHeight.current = height;
          restore();
        }}
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 22,
          paddingBottom: 55,
        }}
      >
        <View style={{ width: "100%", maxWidth: 900, paddingTop: 25, gap: 25 }}>
          <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <Row style={{ flexWrap: "wrap", gap: 7 }}>
              {(["hi", "en", "ur"] as Script[]).map((s) => (
                <Chip
                  key={s}
                  label={
                    scriptLabels[s] +
                    (!poem.text[s] ? t(" · unavailable", " · अनुपलब्ध") : "")
                  }
                  active={displayed.script === s}
                  onPress={() => {
                    if (poem.text[s]) {
                      setState((v) => ({ ...v, script: s }));
                    } else
                      setNotice(
                        t(
                          "This script is not supplied for this poem.",
                          "इस कविता की यह लिपि उपलब्ध नहीं है।",
                        ),
                      );
                  }}
                />
              ))}
            </Row>
            <Row style={{ gap: 0 }}>
              <IconButton
                label={t("Reading settings", "पठन सेटिंग")}
                onPress={() => setSettings(true)}
              >
                <SlidersHorizontal size={19} color={theme.muted} />
              </IconButton>
              <IconButton
                selected={saved}
                label={
                  saved
                    ? t("Remove from saved poems", "सहेजी कविताओं से हटाएँ")
                    : t("Save poem", "कविता सहेजें")
                }
                onPress={() =>
                  setState((s) => ({
                    ...s,
                    favourites: toggleId(s.favourites, id),
                  }))
                }
              >
                <Heart
                  size={20}
                  color={theme.primary}
                  fill={saved ? theme.primary : "transparent"}
                />
              </IconButton>
              <IconButton
                label={t("Add to collection", "संग्रह में जोड़ें")}
                onPress={() => setPicker(true)}
              >
                <FolderPlus size={20} color={theme.muted} />
              </IconButton>
              <IconButton
                label={t("Share poem", "कविता साझा करें")}
                onPress={share}
              >
                <Share2 size={19} color={theme.muted} />
              </IconButton>
            </Row>
          </Row>
          {!!notice && (
            <Txt
              accessibilityRole="alert"
              style={{
                padding: 12,
                backgroundColor: theme.soft,
                borderRadius: 8,
              }}
            >
              {notice}
            </Txt>
          )}
          <View
            style={{
              maxWidth: state.readingWidth,
              width: "100%",
              alignSelf: "center",
              gap: 18,
              paddingTop: 18,
            }}
          >
            <Txt kind="label" style={{ color: theme.accent }}>
              {poem.genre.toUpperCase()} / KAVYAVANI
            </Txt>
            <Txt kind="title" style={{ fontSize: 34, lineHeight: 46 }}>
              {poem.title}
            </Txt>
            <Pressable
              accessibilityRole="link"
              onPress={() => navigation.navigate("Poet", { id: poem.poetId })}
            >
              <Txt style={{ color: theme.primary }}>— {poet?.name}</Txt>
            </Pressable>
            <View
              style={{
                width: 55,
                height: 1,
                backgroundColor: theme.accent,
                marginVertical: 14,
              }}
            />
            <Txt
              selectable
              testID="poem-text"
              style={{
                fontFamily:
                  displayed.script === "ur"
                    ? fonts.urdu
                    : displayed.script === "hi"
                      ? fonts.hindi
                      : fonts.serif,
                fontSize: state.fontSize,
                lineHeight:
                  state.fontSize *
                  Math.max(
                    state.lineHeight,
                    displayed.script === "ur" ? 2.5 : 1.6,
                  ),
                textAlign: displayed.direction === "rtl" ? "right" : "left",
                writingDirection: displayed.direction,
              }}
            >
              {displayed.text}
            </Txt>
            <View
              style={{
                width: 55,
                height: 1,
                backgroundColor: theme.accent,
                marginVertical: 18,
              }}
            />
            <Txt muted style={{ fontSize: 11, lineHeight: 20 }}>
              {t(
                "Script versions are supplied by your dataset. Roman is transliteration, not an English translation. Original line breaks are preserved.",
                "लिपियों के संस्करण दिए गए डेटा से हैं। Roman लिप्यंतरण है, अंग्रेज़ी अनुवाद नहीं। मूल पंक्तियाँ सुरक्षित रखी गई हैं।",
              )}
            </Txt>
            <Button
              label={
                recitation?.url
                  ? t("Listen to the recitation", "वाचन सुनें")
                  : t("Recitation availability", "वाचन की उपलब्धता")
              }
              subtle
              icon={<Headphones size={19} color={theme.primary} />}
              onPress={() => setNarration(true)}
              style={{ marginTop: 8 }}
            />
            <Row style={{ justifyContent: "space-between", paddingTop: 15 }}>
              <Txt muted style={{ fontSize: 11 }}>
                {Math.round(progress * 100)}%{" "}
                {t("reading progress", "पठन प्रगति")}
              </Txt>
              <Button
                subtle
                label={t("Back to the beginning", "शुरुआत पर लौटें")}
                onPress={() =>
                  scroll.current?.scrollTo({ y: 0, animated: false })
                }
              />
            </Row>
          </View>
        </View>
      </ScrollView>
      <NarrationSheet
        visible={narration}
        onClose={() => setNarration(false)}
        poemId={id}
      />
      <CollectionPicker
        visible={picker}
        onClose={() => setPicker(false)}
        poemId={id}
      />
      <Sheet
        visible={settings}
        onClose={() => setSettings(false)}
        title={t("Make yourself comfortable", "आराम से पढ़िए")}
      >
        <Txt>{t("Text size", "अक्षरों का आकार")}</Txt>
        <Row style={{ flexWrap: "wrap" }}>
          {[19, 23, 28].map((n, i) => (
            <Chip
              key={n}
              label={t(
                ["Small", "Medium", "Large"][i],
                ["छोटा", "मध्यम", "बड़ा"][i],
              )}
              active={state.fontSize === n}
              onPress={() => setState((s) => ({ ...s, fontSize: n }))}
            />
          ))}
        </Row>
        <Txt>{t("Line spacing", "पंक्तियों के बीच दूरी")}</Txt>
        <Row>
          {[1.6, 1.9, 2.2].map((n) => (
            <Chip
              key={n}
              label={`${n}×`}
              active={state.lineHeight === n}
              onPress={() => setState((s) => ({ ...s, lineHeight: n }))}
            />
          ))}
        </Row>
        <Txt>{t("Reading width", "पढ़ने की चौड़ाई")}</Txt>
        <Row style={{ flexWrap: "wrap" }}>
          {[520, 680, 840].map((n, i) => (
            <Chip
              key={n}
              label={t(
                ["Narrow", "Comfort", "Wide"][i],
                ["कम", "सहज", "अधिक"][i],
              )}
              active={state.readingWidth === n}
              onPress={() => setState((s) => ({ ...s, readingWidth: n }))}
            />
          ))}
        </Row>
        <Txt muted>
          {t(
            "These preferences are saved for every poem. Choose an app theme in Profile → Settings.",
            "ये पसंद सभी कविताओं के लिए सहेजी जाती है। थीम चुनने के लिए प्रोफ़ाइल → सेटिंग में जाएँ।",
          )}
        </Txt>
      </Sheet>
    </ThemeCanvas>
  );
}
