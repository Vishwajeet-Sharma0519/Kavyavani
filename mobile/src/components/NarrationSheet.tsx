import React, { useState } from "react";
import { Platform, View } from "react-native";
import * as Linking from "expo-linking";
import { Sheet, Txt, Button } from "./ui";
import { useApp } from "../state/AppProvider";
import { recitationSelections } from "../data/recitations";

export function NarrationSheet({
  visible,
  onClose,
  poemId,
}: {
  visible: boolean;
  onClose: () => void;
  poemId?: string;
}) {
  const { theme, t } = useApp();
  const [error, setError] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string>();
  const selections = poemId
    ? recitationSelections.filter((e) => e.poemId === poemId)
    : recitationSelections;
  const close = () => {
    setError(false);
    setActiveVideo(undefined);
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
          "Listen to performances from YouTube or Rekhta. Internet access is required.",
          "YouTube या रेख़्ता पर उपलब्ध वाचन सुनें। इंटरनेट आवश्यक है।",
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
                  "A suitable recording is still being sought.",
                  "उपयुक्त वाचन की तलाश जारी है।",
                )}
              </Txt>
            )}
          </View>
        );
      })}
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
