import React, { useState } from "react";
import { View, Pressable } from "react-native";
import {
  Settings,
  ChevronRight,
  UserRound,
  Heart,
  BookOpen,
  Layers,
  Feather,
  Headphones,
} from "lucide-react-native";
import {
  Screen,
  Txt,
  Row,
  Button,
  Sheet,
  Input,
  Section,
} from "../components/ui";
import { CollectionCard } from "../components/CollectionCard";
import { NarrationSheet } from "../components/NarrationSheet";
import { useApp } from "../state/AppProvider";
import { useNav } from "../navigation/types";
export default function ProfileScreen() {
  const { state, setState, theme, t } = useApp(),
    nav = useNav(),
    [edit, setEdit] = useState(false),
    [name, setName] = useState(state.profileName),
    [narration, setNarration] = useState(false);
  return (
    <Screen>
      <Txt kind="label" muted>
        {t("A READER, A DREAMER, YOU.", "एक पाठक, एक स्वप्नदर्शी, आप।")}
      </Txt>
      <Row style={{ flexWrap: "wrap" }}>
        <View
          style={{
            width: 90,
            height: 90,
            borderRadius: 50,
            backgroundColor: theme.soft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserRound size={40} color={theme.primary} strokeWidth={1} />
        </View>
        <View style={{ gap: 5, flex: 1, minWidth: 170 }}>
          <Txt kind="title" style={{ fontSize: 38, lineHeight: 50 }}>
            {state.profileName}
          </Txt>
          <Txt muted>
            {t("Your personal poetry space", "कविताओं की आपकी अपनी जगह")}
          </Txt>
          <Txt muted style={{ fontSize: 11 }}>
            {t(
              "Local profile · no account needed",
              "स्थानीय प्रोफ़ाइल · खाते की ज़रूरत नहीं",
            )}
          </Txt>
        </View>
        <Button
          label={t("Edit name", "नाम बदलें")}
          subtle
          onPress={() => {
            setName(state.profileName);
            setEdit(true);
          }}
        />
      </Row>
      <Row style={{ flexWrap: "wrap", gap: 12 }}>
        {[
          [BookOpen, state.history.length, t("Recently read", "हाल में पढ़ीं")],
          [Heart, state.favourites.length, t("Saved poems", "सहेजी कविताएँ")],
          [Feather, state.poets.length, t("Saved poets", "सहेजे कवि")],
          [Layers, state.collections.length, t("Collections", "संग्रह")],
        ].map(([Icon, value, label], i) => {
          const StatIcon = Icon as typeof BookOpen;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                minWidth: 140,
                backgroundColor: theme.surface,
                padding: 22,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: 12,
                gap: 10,
              }}
            >
              <StatIcon size={20} color={theme.accent} strokeWidth={1.3} />
              <Txt kind="title" style={{ fontSize: 34 }}>
                {value as number}
              </Txt>
              <Txt muted style={{ fontSize: 12 }}>
                {label as string}
              </Txt>
            </View>
          );
        })}
      </Row>
      <Pressable
        accessibilityRole="button"
        onPress={() => nav.navigate("Settings")}
        style={{
          padding: 22,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 12,
          backgroundColor: theme.surface,
        }}
      >
        <Row>
          <Settings size={23} color={theme.primary} />
          <View style={{ flex: 1, gap: 4 }}>
            <Txt>{t("Settings & personalization", "सेटिंग और निजीकरण")}</Txt>
            <Txt muted style={{ fontSize: 12 }}>
              {t(
                "Themes, language, reading comfort, and your library backup",
                "थीम, भाषा, पढ़ने की सुविधा और लाइब्रेरी बैकअप",
              )}
            </Txt>
          </View>
          <ChevronRight size={19} color={theme.muted} />
        </Row>
      </Pressable>
      <View style={{ gap: 16 }}>
        <Section
          title={t("Your collections", "आपके संग्रह")}
          action={t("Open library", "लाइब्रेरी खोलें")}
          onPress={() => nav.navigate("Tabs", { screen: "Library" })}
        />
        {state.collections.length ? (
          <Row style={{ flexWrap: "wrap", alignItems: "flex-start" }}>
            {state.collections.slice(0, 3).map((c) => (
              <CollectionCard key={c.id} collection={c} />
            ))}
          </Row>
        ) : (
          <Txt muted>
            {t(
              "Your first collection is waiting to be written. Create it in your library.",
              "आपका पहला संग्रह बनना बाकी है। लाइब्रेरी में शुरुआत करें।",
            )}
          </Txt>
        )}
      </View>
      <Button
        subtle
        label={t("About emotional narration", "भावपूर्ण वाचन के बारे में")}
        icon={<Headphones size={18} color={theme.primary} />}
        onPress={() => setNarration(true)}
        style={{ alignSelf: "flex-start" }}
      />
      <Txt muted style={{ fontSize: 12 }}>
        {t(
          "Your library belongs to this device and browser. Export a backup before clearing browser data or changing devices. Recently read keeps your last 100 distinct poems.",
          "आपकी लाइब्रेरी इस डिवाइस और ब्राउज़र पर रहती है। ब्राउज़र डेटा साफ़ करने या डिवाइस बदलने से पहले बैकअप लें। हाल में पढ़ा अनुभाग पिछली 100 अलग कविताएँ रखता है।",
        )}
      </Txt>
      <Sheet
        visible={edit}
        onClose={() => setEdit(false)}
        title={t("What should we call you?", "आपको किस नाम से बुलाएँ?")}
      >
        <Input
          value={name}
          onChangeText={setName}
          maxLength={60}
          accessibilityLabel={t("Display name", "आपका नाम")}
        />
        <Button
          label={t("Save name", "नाम सहेजें")}
          disabled={!name.trim()}
          onPress={() => {
            setState((s) => ({ ...s, profileName: name.trim() }));
            setEdit(false);
          }}
        />
      </Sheet>
      <NarrationSheet visible={narration} onClose={() => setNarration(false)} />
    </Screen>
  );
}
