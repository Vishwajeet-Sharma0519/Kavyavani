import React, { useState } from "react";
import { View } from "react-native";
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
  const selections = poemId
    ? recitationSelections.filter((e) => e.poemId === poemId)
    : recitationSelections;
  const close = () => {
    setError(false);
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
          "Explore recording candidates on their original sites. Sound quality is awaiting review; these recordings are not yet available inside KavyaVani. Internet access is required.",
          "मूल वेबसाइट पर वाचन के विकल्प सुनें। आवाज़ की गुणवत्ता की समीक्षा बाकी है; ये रिकॉर्डिंग अभी काव्यवाणी में उपलब्ध नहीं हैं। इंटरनेट आवश्यक है।",
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
      {selections.map((entry) => (
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
          <Txt>{t(entry.direction, entry.directionHi)}</Txt>
          {entry.url ? (
            <Button
              label={t("Open recording source ↗", "वाचन का स्रोत खोलें ↗")}
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
      ))}
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
