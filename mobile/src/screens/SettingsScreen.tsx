import React, { useState } from "react";
import { View, Pressable, Platform } from "react-native";
import { Check, Download, Upload, Monitor, Feather } from "lucide-react-native";
import {
  Screen,
  Txt,
  Row,
  Chip,
  Button,
  Sheet,
  Input,
  Section,
} from "../components/ui";
import { useApp } from "../state/AppProvider";
import { themes, type ThemeName } from "../theme/themes";
import { parseState, type UserState } from "../state/model";
import { shareText } from "../services/sharing";
import { scriptLabels } from "../data/scripts";
import type { Script } from "../data/types";
import { catalog } from "../data/repository";
import { ThemeBackdrop } from "../components/ThemeBackdrop";
export default function SettingsScreen() {
  const { state, setState, theme, t } = useApp(),
    [notice, setNotice] = useState(""),
    [restore, setRestore] = useState(false),
    [backup, setBackup] = useState(""),
    [preview, setPreview] = useState<UserState | null>(null),
    [error, setError] = useState("");
  const exportBackup = async () => {
    try {
      const text = JSON.stringify(state, null, 2);
      if (Platform.OS === "web") {
        const url = URL.createObjectURL(
          new Blob([text], { type: "application/json" }),
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = "kavyavani-library.json";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setNotice(
          t(
            "Your library backup has been downloaded.",
            "लाइब्रेरी बैकअप डाउनलोड हो गया।",
          ),
        );
      } else {
        const result = await shareText("Kavyavani library backup", text);
        if (result === "copied")
          setNotice(
            t(
              "Backup copied. Save the text in a safe place.",
              "बैकअप कॉपी हुआ। इसे सुरक्षित जगह सहेजें।",
            ),
          );
      }
    } catch {
      setNotice(
        t(
          "Could not export. Please try again.",
          "बैकअप नहीं बन सका। फिर प्रयास करें।",
        ),
      );
    }
  };
  return (
    <Screen>
      <Txt kind="label" muted>
        {t("MAKE THIS SPACE YOURS", "इस जगह को अपना बनाइए")}
      </Txt>
      <Txt kind="title" style={{ fontSize: 43, lineHeight: 54 }}>
        {t("The art of feeling at home.", "यहाँ अपना-सा महसूस हो।")}
      </Txt>
      <View style={{ gap: 12 }}>
        <Section title={t("Appearance & themes", "रूप और थीम")} />
        <Txt muted>
          {t(
            "A different mood. The same words. Applied everywhere, saved on this device.",
            "एक अलग एहसास। वही शब्द। थीम पूरे ऐप पर लागू होती है और इस डिवाइस पर सहेजी जाती है।",
          )}
        </Txt>
        <Row style={{ flexWrap: "wrap", alignItems: "stretch", gap: 16 }}>
          {(Object.entries(themes) as [ThemeName, typeof theme][]).map(
            ([key, palette]) => (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={palette.name}
                accessibilityState={{ selected: state.theme === key }}
                aria-selected={state.theme === key}
                onPress={() => setState((s) => ({ ...s, theme: key }))}
                style={{
                  minWidth: 220,
                  maxWidth: 355,
                  flex: 1,
                  backgroundColor: theme.surface,
                  borderWidth: state.theme === key ? 2 : 1,
                  borderColor:
                    state.theme === key ? theme.primary : theme.border,
                  borderRadius: 12,
                  padding: 14,
                  gap: 12,
                  boxShadow:
                    state.theme === key
                      ? `0 0 22px ${theme.glow}38`
                      : undefined,
                }}
              >
                <View
                  style={{
                    height: 144,
                    backgroundColor: palette.bg,
                    borderRadius: 7,
                    padding: 14,
                    gap: 9,
                    borderWidth: 1,
                    borderColor: palette.border,
                  }}
                >
                  <ThemeBackdrop palette={palette} compact radius={6} />
                  <Row style={{ justifyContent: "space-between" }}>
                    <Feather size={16} color={palette.primary} />
                    <View
                      style={{
                        height: 6,
                        width: 28,
                        borderRadius: 3,
                        backgroundColor: palette.border,
                      }}
                    />
                  </Row>
                  <View
                    style={{
                      height: 6,
                      width: "64%",
                      backgroundColor: palette.text,
                      borderRadius: 3,
                      opacity: 0.8,
                    }}
                  />
                  <View
                    style={{
                      height: 4,
                      width: "45%",
                      backgroundColor: palette.muted,
                      borderRadius: 3,
                      opacity: 0.6,
                    }}
                  />
                  <View
                    style={{
                      backgroundColor: palette.soft,
                      flex: 1,
                      width: "70%",
                      borderRadius: 5,
                      padding: 10,
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        height: 4,
                        width: "76%",
                        backgroundColor: palette.primary,
                        borderRadius: 3,
                      }}
                    />
                    <View
                      style={{
                        height: 4,
                        width: "50%",
                        backgroundColor: palette.accent,
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </View>
                <Row style={{ justifyContent: "space-between" }}>
                  <Txt style={{ fontSize: 13, flex: 1 }}>
                    {state.language === "hi" ? palette.hindi : palette.name}
                  </Txt>
                  {state.theme === key && (
                    <Check size={19} color={theme.primary} />
                  )}
                </Row>
                <Txt muted style={{ fontSize: 11, lineHeight: 18 }}>
                  {palette.mood}
                </Txt>
                <Row style={{ gap: 5 }}>
                  {[
                    palette.bg,
                    palette.primary,
                    palette.soft,
                    palette.accent,
                  ].map((color, i) => (
                    <View
                      key={i}
                      style={{
                        backgroundColor: color,
                        borderColor: theme.border,
                        borderWidth: 1,
                        width: 15,
                        height: 15,
                        borderRadius: 8,
                      }}
                    />
                  ))}
                </Row>
              </Pressable>
            ),
          )}
        </Row>
        <Button
          subtle
          label={
            state.theme === "system"
              ? t("✓ Following system appearance", "✓ डिवाइस की थीम चुनी गई")
              : t("Follow system appearance", "डिवाइस की थीम अपनाएँ")
          }
          icon={<Monitor size={17} color={theme.primary} />}
          onPress={() => setState((s) => ({ ...s, theme: "system" }))}
          style={{ alignSelf: "flex-start" }}
        />
      </View>
      <View style={{ height: 1, backgroundColor: theme.border }} />
      <View style={{ gap: 16 }}>
        <Section title={t("Language & reading", "भाषा और पठन")} />
        <Txt>{t("Interface language", "ऐप की भाषा")}</Txt>
        <Row>
          <Chip
            label="English"
            active={state.language === "en"}
            onPress={() => setState((s) => ({ ...s, language: "en" }))}
          />
          <Chip
            label="हिन्दी"
            active={state.language === "hi"}
            onPress={() => setState((s) => ({ ...s, language: "hi" }))}
          />
        </Row>
        <Txt>{t("Preferred poem script", "कविता की पसंदीदा लिपि")}</Txt>
        <Row>
          {(["hi", "en", "ur"] as Script[]).map((s) => (
            <Chip
              key={s}
              label={scriptLabels[s]}
              active={state.script === s}
              onPress={() => setState((v) => ({ ...v, script: s }))}
            />
          ))}
        </Row>
        <Txt muted style={{ fontSize: 12 }}>
          {t(
            "These are writing systems, not different translations. Your original text is always preserved.",
            "ये लिपियाँ हैं, अलग-अलग अनुवाद नहीं। मूल रचना हमेशा सुरक्षित रहती है।",
          )}
        </Txt>
        <Txt>{t("Reading size", "पढ़ने के अक्षरों का आकार")}</Txt>
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
      </View>
      <View style={{ height: 1, backgroundColor: theme.border }} />
      <View style={{ gap: 14 }}>
        <Section
          title={t("Your library, safely kept", "आपकी लाइब्रेरी, सुरक्षित")}
        />
        <Txt muted>
          {t(
            "Favourites, collections, and preferences stay in this browser or app. There is no cloud sync. Export a backup to take them to another device.",
            "पसंदीदा कविताएँ, संग्रह और सेटिंग इस ब्राउज़र या ऐप में रहते हैं। क्लाउड सिंक नहीं है। दूसरे डिवाइस पर ले जाने के लिए बैकअप लें।",
          )}
        </Txt>
        <Row style={{ flexWrap: "wrap" }}>
          <Button
            subtle
            label={t("Export backup", "बैकअप डाउनलोड करें")}
            icon={<Download size={17} color={theme.primary} />}
            onPress={exportBackup}
          />
          <Button
            subtle
            label={t("Restore backup", "बैकअप बहाल करें")}
            icon={<Upload size={17} color={theme.primary} />}
            onPress={() => {
              setRestore(true);
              setBackup("");
              setPreview(null);
              setError("");
            }}
          />
        </Row>
        {!!notice && <Txt accessibilityRole="alert">{notice}</Txt>}
      </View>
      <View
        style={{
          padding: 24,
          backgroundColor: theme.soft,
          borderRadius: 12,
          gap: 10,
        }}
      >
        <Txt kind="title">Kavyavani</Txt>
        <Txt muted>
          {t(
            "Version 1.0 · A place for the words that stay.",
            "संस्करण 1.0 · ठहर जाने वाले शब्दों की जगह।",
          )}
        </Txt>
        <Txt muted style={{ fontSize: 12 }}>
          {catalog.poets.length} {t("poets", "कवि")} ·{" "}
          {catalog.poems.length.toLocaleString()}{" "}
          {t("poems from your supplied dataset.", "आपके दिए डेटा की रचनाएँ।")}
        </Txt>
        <Txt muted style={{ fontSize: 12 }}>
          {t(
            "AI emotional narration is planned. This release reads and organizes poetry without AI services, subscriptions, or a server.",
            "भावपूर्ण AI वाचन की सुविधा आगे जोड़ी जाएगी। इस संस्करण में कविताएँ पढ़ने और सहेजने के लिए AI सेवा, सदस्यता या सर्वर नहीं चाहिए।",
          )}
        </Txt>
      </View>
      <Sheet
        visible={restore}
        onClose={() => setRestore(false)}
        title={t("Restore your library", "अपनी लाइब्रेरी बहाल करें")}
      >
        {preview ? (
          <>
            <Txt>
              {t(
                `This backup has ${preview.favourites.length} saved poems and ${preview.collections.length} collections. Restoring replaces this device’s current library and preferences.`,
                `इस बैकअप में ${preview.favourites.length} सहेजी कविताएँ और ${preview.collections.length} संग्रह हैं। बहाल करने पर वर्तमान लाइब्रेरी और सेटिंग बदल जाएँगी।`,
              )}
            </Txt>
            <Button
              label={t(
                "Replace library with this backup",
                "इस बैकअप से लाइब्रेरी बदलें",
              )}
              onPress={() => {
                setState(preview);
                setRestore(false);
                setNotice(t("Library restored.", "लाइब्रेरी बहाल हुई।"));
              }}
            />
            <Button
              subtle
              label={t("Go back", "वापस जाएँ")}
              onPress={() => setPreview(null)}
            />
          </>
        ) : (
          <>
            <Txt>
              {t(
                "Open your exported JSON file and paste its contents below. Your current library stays unchanged until you confirm.",
                "डाउनलोड की गई JSON फ़ाइल का पाठ नीचे पेस्ट करें। पुष्टि से पहले वर्तमान लाइब्रेरी नहीं बदलेगी।",
              )}
            </Txt>
            <Input
              accessibilityLabel={t("Backup JSON", "बैकअप JSON")}
              multiline
              value={backup}
              onChangeText={setBackup}
              style={{ height: 180, textAlignVertical: "top" }}
              placeholder='{"version": 1, ...}'
            />
            <Button
              label={t("Check backup", "बैकअप जाँचें")}
              onPress={() => {
                try {
                  if (backup.length > 5_000_000)
                    throw new Error("Backup is too large");
                  setPreview(parseState(backup));
                  setError("");
                } catch {
                  setError(
                    t(
                      "This is not a supported Kavyavani backup. Nothing was changed.",
                      "यह मान्य Kavyavani बैकअप नहीं है। कोई बदलाव नहीं हुआ।",
                    ),
                  );
                }
              }}
            />
            {!!error && <Txt accessibilityRole="alert">{error}</Txt>}
          </>
        )}
      </Sheet>
    </Screen>
  );
}
