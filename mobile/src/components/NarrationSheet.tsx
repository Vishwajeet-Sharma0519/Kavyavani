import React, { useState } from "react";
import { Platform, View } from "react-native";
import * as Linking from "expo-linking";
import { Sheet, Txt, Button } from "./ui";
import { useApp } from "../state/AppProvider";
import { recitationSelections } from "../data/recitations";
import { getPoemSummary, getPoetById } from "../data/repository";
import { recitationSearchUrl } from "../data/recitationSearch";

export function NarrationSheet({
  visible,
  onClose,
  poemId,
  poemIds,
}: {
  visible: boolean;
  onClose: () => void;
  poemId?: string;
  poemIds?: string[];
}) {
  const { theme, t } = useApp();
  const [error, setError] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string>();
  const [limit, setLimit] = useState(20);
  const ids = poemId
    ? [poemId]
    : (poemIds ?? recitationSelections.map((e) => e.poemId));
  const selections = ids.slice(0, limit).flatMap((id) => {
    const poem = getPoemSummary(id);
    if (!poem) return [];
    const source = recitationSelections.find((e) => e.poemId === id);
    const poet = getPoetById(poem.poetId)?.name ?? "";
    return [
      {
        poemId: id,
        title: source?.title ?? poem.firstLine ?? poem.title,
        poet,
        url: source?.url ?? "",
        searchUrl: recitationSearchUrl(poem, poet),
      },
    ];
  });
  const close = () => {
    setError(false);
    setActiveVideo(undefined);
    setLimit(20);
    onClose();
  };
  const openSource = async (url: string) => {
    setError(false);
    try {
      await Linking.openURL(url);
    } catch {
      setError(true);
    }
  };
  return (
    <Sheet
      visible={visible}
      onClose={close}
      title={t("Poetry, in a voice", "कविता की आवाज़")}
    >
      <Txt muted>
        {t(
          "Open a recording or search YouTube using the poem and poet. Search results may include explanations or different versions. Internet access is required.",
          "वाचन खोलें या कविता और कवि के नाम से YouTube पर खोजें। परिणामों में व्याख्याएँ और अलग संस्करण भी हो सकते हैं। इंटरनेट आवश्यक है।",
        )}
      </Txt>
      {selections.length === 0 && (
        <Txt>
          {t(
            "No recording has been selected for this poem yet.",
            "इस कविता के लिए अभी वाचन नहीं चुना गया है।",
          )}
        </Txt>
      )}
      {selections.map((entry) => {
        const videoId =
          Platform.OS === "web"
            ? /^https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})$/.exec(
                entry.url,
              )?.[1]
            : undefined;
        return (
          <View
            key={entry.poemId}
            style={{
              backgroundColor: theme.soft,
              padding: 16,
              borderRadius: 12,
              gap: 10,
            }}
          >
            <Txt style={{ fontSize: 18 }}>{entry.title}</Txt>
            <Txt muted>{entry.poet}</Txt>
            {visible && videoId && activeVideo === videoId ? (
              <iframe
                title={entry.title}
                src={`https://www.youtube.com/embed/${videoId}?playsinline=1`}
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ width: "100%", minWidth: 200, height: 220, border: 0 }}
              />
            ) : videoId ? (
              <Button
                label={t("Show YouTube player", "YouTube प्लेयर खोलें")}
                onPress={() => setActiveVideo(videoId)}
              />
            ) : null}
            {entry.url ? (
              <Button
                label={
                  entry.url.includes("rekhta.org")
                    ? t("Listen on Rekhta ↗", "रेख़्ता पर सुनें ↗")
                    : t("Open on YouTube ↗", "YouTube पर खोलें ↗")
                }
                onPress={() => {
                  void openSource(entry.url);
                }}
              />
            ) : (
              <Txt muted>
                {t(
                  "Find a performance of this poem on YouTube.",
                  "इस कविता का वाचन YouTube पर खोजें।",
                )}
              </Txt>
            )}
            <Button
              label={t("Search YouTube ↗", "YouTube पर खोजें ↗")}
              subtle={!!entry.url}
              onPress={() => {
                void openSource(entry.searchUrl);
              }}
            />
          </View>
        );
      })}
      {ids.length > limit && (
        <Button
          label={t("Show more poems", "और कविताएँ दिखाएँ")}
          onPress={() => setLimit((value) => value + 20)}
        />
      )}
      {error && (
        <Txt accessibilityRole="alert">
          {t(
            "Could not open the source. Check your connection and try again.",
            "स्रोत नहीं खुला। इंटरनेट जाँचें और फिर प्रयास करें।",
          )}
        </Txt>
      )}
      <Button
        label={t("Back to the words", "कविता पर लौटें")}
        onPress={close}
      />
    </Sheet>
  );
}
