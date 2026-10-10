import React from "react";
import { View } from "react-native";
import { Headphones } from "lucide-react-native";
import { Sheet, Txt, Button } from "./ui";
import { useApp } from "../state/AppProvider";
export function NarrationSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { theme, t } = useApp();
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t("Some words deserve a voice.", "कुछ शब्द आवाज़ के हक़दार हैं।")}
    >
      <View
        style={{
          backgroundColor: theme.soft,
          padding: 22,
          borderRadius: 12,
          alignItems: "center",
          gap: 14,
        }}
      >
        <Headphones size={36} strokeWidth={1} color={theme.primary} />
        <Txt kind="label" style={{ color: theme.primary }}>
          {t("AI NARRATION · COMING LATER", "AI वाचन · अभी उपलब्ध नहीं")}
        </Txt>
      </View>
      <Txt>
        {t(
          "Poetry needs feeling, a thoughtful pause, and the right pronunciation. Emotional Hindi narration is being reserved for a future release.",
          "कविता को भाव, सही ठहराव और सटीक उच्चारण चाहिए। भावपूर्ण हिंदी वाचन आगे के संस्करण के लिए रखा गया है।",
        )}
      </Txt>
      <Txt muted>
        {t(
          "No audio is generated or played in this version. Read in any of the supplied scripts, and make a collection for another day.",
          "इस संस्करण में ऑडियो बनाया या चलाया नहीं जाता। उपलब्ध लिपियों में पढ़ें और अपनी पसंद की रचनाएँ सहेजें।",
        )}
      </Txt>
      <Button
        label={t("Back to the words", "कविता पर लौटें")}
        onPress={onClose}
      />
    </Sheet>
  );
}
