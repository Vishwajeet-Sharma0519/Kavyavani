import { ThemeCanvas } from "../components/ThemeBackdrop";
import React, { useState } from "react";
import { FlatList, View } from "react-native";
import { ArrowUp, ArrowDown, X, Headphones } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useApp } from "../state/AppProvider";
import {
  Txt,
  Row,
  Button,
  PoemCard,
  Empty,
  IconButton,
  Sheet,
} from "../components/ui";
import { CollectionEditor } from "../components/CollectionEditor";
import { NarrationSheet } from "../components/NarrationSheet";
import { getPoemSummary } from "../data/repository";
import { moveItem } from "../state/model";
import type { RootRoutes } from "../navigation/types";
export default function CollectionScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootRoutes, "Collection">) {
  const { state, setState, theme, t } = useApp(),
    c = state.collections.find((c) => c.id === route.params.id),
    [edit, setEdit] = useState(false),
    [remove, setRemove] = useState(false),
    [narration, setNarration] = useState(false);
  if (!c)
    return (
      <Empty
        title={t("Collection unavailable", "संग्रह उपलब्ध नहीं")}
        description={t(
          "It may have been removed from your library.",
          "यह संग्रह लाइब्रेरी से हटाया गया हो सकता है।",
        )}
      >
        <Button
          label={t("Open library", "लाइब्रेरी खोलें")}
          onPress={() => navigation.navigate("Tabs", { screen: "Library" })}
        />
      </Empty>
    );
  const move = (index: number, direction: -1 | 1) =>
    setState((s) => ({
      ...s,
      collections: s.collections.map((x) =>
        x.id === c.id
          ? { ...x, poemIds: moveItem(x.poemIds, index, direction) }
          : x,
      ),
    }));
  return (
    <ThemeCanvas>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          maxWidth: 1000,
          width: "100%",
          alignSelf: "center",
          padding: 24,
          paddingBottom: 40,
        }}
        data={c.poemIds}
        keyExtractor={(id) => id}
        initialNumToRender={12}
        ListHeaderComponent={
          <View style={{ gap: 20, paddingBottom: 24 }}>
            <Txt kind="label" muted>
              {t("YOUR PERSONAL ANTHOLOGY", "आपका निजी संकलन")}
            </Txt>
            <Txt kind="title" style={{ fontSize: 42, lineHeight: 54 }}>
              {c.name}
            </Txt>
            {!!c.description && <Txt muted>{c.description}</Txt>}
            <Txt muted>
              {c.poemIds.length} {t("poems", "रचनाएँ")}
            </Txt>
            <Row style={{ flexWrap: "wrap" }}>
              <Button
                label={t("Edit collection", "संग्रह बदलें")}
                onPress={() => setEdit(true)}
                subtle
              />
              <Button
                label={t("Add poems", "कविताएँ जोड़ें")}
                onPress={() =>
                  navigation.navigate("Tabs", { screen: "Discover" })
                }
                subtle
              />
              <Button
                label={t("Delete collection", "संग्रह हटाएँ")}
                onPress={() => setRemove(true)}
                subtle
              />
            </Row>
            <Button
              label={t(
                "Find recitations for this collection",
                "इस संग्रह के वाचन खोजें",
              )}
              icon={<Headphones size={17} color={theme.primary} />}
              onPress={() => setNarration(true)}
              subtle
              style={{ alignSelf: "flex-start" }}
            />
          </View>
        }
        renderItem={({ item, index }) => {
          const p = getPoemSummary(item);
          return (
            <View style={{ paddingBottom: 8 }}>
              {p ? (
                <PoemCard poem={p} />
              ) : (
                <Txt muted>
                  {t(
                    "Poem no longer in the dataset",
                    "कविता अब डेटा में नहीं है",
                  )}
                </Txt>
              )}
              <Row style={{ justifyContent: "flex-end", gap: 4 }}>
                <Txt muted style={{ fontSize: 11, marginRight: 6 }}>
                  {index + 1} / {c.poemIds.length}
                </Txt>
                {index > 0 && (
                  <IconButton
                    label={t("Move poem up", "कविता ऊपर करें")}
                    onPress={() => move(index, -1)}
                  >
                    <ArrowUp size={17} color={theme.muted} />
                  </IconButton>
                )}
                {index < c.poemIds.length - 1 && (
                  <IconButton
                    label={t("Move poem down", "कविता नीचे करें")}
                    onPress={() => move(index, 1)}
                  >
                    <ArrowDown size={17} color={theme.muted} />
                  </IconButton>
                )}
                <IconButton
                  label={t("Remove from this collection", "इस संग्रह से हटाएँ")}
                  onPress={() =>
                    setState((s) => ({
                      ...s,
                      collections: s.collections.map((x) =>
                        x.id === c.id
                          ? {
                              ...x,
                              poemIds: x.poemIds.filter((id) => id !== item),
                            }
                          : x,
                      ),
                    }))
                  }
                >
                  <X size={17} color={theme.muted} />
                </IconButton>
              </Row>
            </View>
          );
        }}
        ListEmptyComponent={
          <Empty
            title={t(
              "A blank page, full of possibilities.",
              "एक खाली पन्ना, अनगिनत संभावनाएँ।",
            )}
            description={t(
              "Open a poem and use “Add to collection” to place it here.",
              "कविता खोलें और “संग्रह में जोड़ें” विकल्प चुनें।",
            )}
          />
        }
        ListFooterComponent={
          <>
            <CollectionEditor
              visible={edit}
              collection={c}
              onClose={() => setEdit(false)}
            />
            <NarrationSheet
              poemIds={c.poemIds}
              visible={narration}
              onClose={() => setNarration(false)}
            />
            <Sheet
              visible={remove}
              onClose={() => setRemove(false)}
              title={t("Delete this collection?", "यह संग्रह हटाएँ?")}
            >
              <Txt>
                {t(
                  `“${c.name}” will be deleted. The poems and your saved favourites will remain.`,
                  `“${c.name}” हट जाएगा। कविताएँ और आपकी सहेजी पसंद बनी रहेगी।`,
                )}
              </Txt>
              <Button
                label={t("Yes, delete collection", "हाँ, संग्रह हटाएँ")}
                onPress={() => {
                  setState((s) => ({
                    ...s,
                    collections: s.collections.filter((x) => x.id !== c.id),
                  }));
                  setRemove(false);
                  navigation.replace("Tabs", { screen: "Library" });
                }}
              />
              <Button
                subtle
                label={t("Keep it", "रखें")}
                onPress={() => setRemove(false)}
              />
            </Sheet>
          </>
        }
      />
    </ThemeCanvas>
  );
}
