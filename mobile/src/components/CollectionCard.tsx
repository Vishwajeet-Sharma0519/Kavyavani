import React from "react";
import { View, Pressable } from "react-native";
import {
  Leaf,
  Moon,
  Flower2,
  BookOpen,
  ArrowUpRight,
} from "lucide-react-native";
import { useApp } from "../state/AppProvider";
import type { Collection } from "../state/model";
import { useNav } from "../navigation/types";
import { Txt, Row } from "./ui";
import { ThemeBackdrop } from "./ThemeBackdrop";
export function CollectionCard({ collection }: { collection: Collection }) {
  const { theme, t } = useApp(),
    nav = useNav(),
    Icon = [Leaf, Moon, Flower2, BookOpen][collection.color];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={collection.name}
      onPress={() => nav.navigate("Collection", { id: collection.id })}
      style={({ pressed }) => ({
        width: 240,
        flexGrow: 1,
        maxWidth: 360,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View
        style={{
          height: 150,
          backgroundColor: theme.soft,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 12,
          padding: 22,
          justifyContent: "space-between",
          overflow: "hidden",
        }}
      >
        <ThemeBackdrop palette={theme} compact radius={11} />
        <View
          style={{
            position: "absolute",
            right: -20,
            top: -25,
            width: 180,
            height: 180,
            borderWidth: 1,
            borderRadius: 100,
            borderColor: theme.border,
          }}
        />
        <View
          style={{
            position: "absolute",
            right: 0,
            top: -5,
            width: 140,
            height: 140,
            borderWidth: 1,
            borderRadius: 100,
            borderColor: theme.border,
          }}
        />
        <Icon size={44} color={theme.primary} strokeWidth={1} />
        <Row style={{ justifyContent: "space-between" }}>
          <Txt kind="label" muted>
            KAVYAVANI COLLECTION
          </Txt>
          <ArrowUpRight size={16} color={theme.primary} />
        </Row>
      </View>
      <Txt
        kind="title"
        numberOfLines={2}
        style={{ fontSize: 24, marginTop: 10 }}
      >
        {collection.name}
      </Txt>
      <Txt muted style={{ fontSize: 12 }}>
        {collection.poemIds.length} {t("poems", "रचनाएँ")}
      </Txt>
    </Pressable>
  );
}
