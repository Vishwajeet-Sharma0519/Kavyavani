import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  type TextProps,
  type ViewStyle,
  type StyleProp,
  type TextInputProps,
} from "react-native";
import {
  ArrowRight,
  BookOpen,
  Heart,
  Headphones,
  Search,
  X,
  Feather,
  UserRound,
} from "lucide-react-native";
import { useApp } from "../state/AppProvider";
import { fonts } from "../theme/themes";
import { useNav } from "../navigation/types";
import { getPoetById } from "../data/repository";
import type { PoemSummary, Poet } from "../data/types";
import { toggleId } from "../state/model";
import { GradientWash, ThemeBackdrop, ThemeCanvas } from "./ThemeBackdrop";
export function Txt({
  children,
  style,
  kind = "body",
  muted,
  ...props
}: TextProps & {
  kind?: "body" | "title" | "label" | "verse";
  muted?: boolean;
}) {
  const { theme } = useApp();
  const hindi =
    typeof children === "string" && /[\u0900-\u097f]/.test(children);
  return (
    <Text
      {...props}
      style={[
        {
          color: muted ? theme.muted : theme.text,
          fontFamily: hindi
            ? fonts.hindi
            : kind === "title" || kind === "verse"
              ? fonts.serif
              : fonts.sans,
          fontSize:
            kind === "title"
              ? 30
              : kind === "label"
                ? 11
                : kind === "verse"
                  ? 24
                  : 14,
          lineHeight: kind === "title" ? 40 : kind === "verse" ? 38 : 23,
          letterSpacing: kind === "label" ? 1.5 : 0,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Button({
  label,
  onPress,
  icon,
  subtle,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  subtle?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useApp();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      aria-disabled={!!disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 46,
          paddingHorizontal: 19,
          paddingVertical: 10,
          borderRadius: 9,
          flexDirection: "row",
          gap: 9,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: subtle ? theme.border : theme.primary,
          backgroundColor: subtle ? theme.surface : theme.primary,
          boxShadow: subtle ? undefined : `0 4px 18px ${theme.glow}38`,
          opacity: disabled ? 0.42 : pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      <GradientWash
        from={subtle ? theme.surface : theme.primary}
        to={subtle ? theme.soft : theme.primaryEnd}
        radius={8}
      />
      {icon}
      <Txt
        style={{ color: subtle ? theme.text : theme.onPrimary, fontSize: 13 }}
      >
        {label}
      </Txt>
    </Pressable>
  );
}
export function IconButton({
  label,
  onPress,
  children,
  selected = false,
}: {
  label: string;
  onPress: () => void;
  children: React.ReactNode;
  selected?: boolean;
}) {
  const { theme } = useApp();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      aria-selected={selected}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: selected || pressed ? theme.soft : "transparent",
      })}
    >
      {children}
    </Pressable>
  );
}
export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const { theme } = useApp();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      aria-selected={!!active}
      style={({ pressed }) => ({
        paddingHorizontal: 16,
        minHeight: 44,
        justifyContent: "center",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: active ? theme.primary : theme.border,
        backgroundColor: active ? theme.primary : theme.surface,
        boxShadow: active ? `0 3px 14px ${theme.glow}30` : undefined,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {active && (
        <GradientWash from={theme.primary} to={theme.primaryEnd} radius={23} />
      )}
      <Txt
        style={{ color: active ? theme.onPrimary : theme.muted, fontSize: 12 }}
      >
        {active ? "✓ " : ""}
        {label}
      </Txt>
    </Pressable>
  );
}
export function Input(props: TextInputProps) {
  const { theme } = useApp();
  return (
    <TextInput
      placeholderTextColor={theme.muted}
      {...props}
      style={[
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 10,
          paddingHorizontal: 16,
          paddingVertical: 12,
          minHeight: 48,
          fontSize: 15,
          color: theme.text,
          fontFamily: fonts.sans,
        },
        props.style,
      ]}
    />
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onSubmit?: () => void;
}) {
  const { theme, t } = useApp();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.surface,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        paddingLeft: 16,
        gap: 10,
      }}
    >
      <Search size={19} color={theme.muted} />
      <Input
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        style={{
          flex: 1,
          borderWidth: 0,
          backgroundColor: "transparent",
          paddingLeft: 0,
        }}
      />
      {!!value && (
        <IconButton
          label={t("Clear search", "खोज मिटाएँ")}
          onPress={() => onChange("")}
        >
          <X size={17} color={theme.muted} />
        </IconButton>
      )}
    </View>
  );
}
export function Screen({
  children,
  style,
}: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <ThemeCanvas>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            {
              width: "100%",
              maxWidth: 1180,
              paddingHorizontal: 24,
              paddingTop: 24,
              gap: 26,
            },
            style,
          ]}
        >
          {children}
        </View>
      </ScrollView>
    </ThemeCanvas>
  );
}
export function Row({
  children,
  style,
}: React.PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View
      style={[{ flexDirection: "row", alignItems: "center", gap: 12 }, style]}
    >
      {children}
    </View>
  );
}
export function Section({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  const { theme } = useApp();
  return (
    <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
      <Txt kind="title" style={{ fontSize: 26 }}>
        {title}
      </Txt>
      {action && onPress && (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={{
            minHeight: 44,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Txt style={{ fontSize: 12, color: theme.primary }}>{action}</Txt>
          <ArrowRight size={16} color={theme.primary} />
        </Pressable>
      )}
    </Row>
  );
}
export function BrandHeader() {
  const { theme, t } = useApp(),
    nav = useNav();
  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: theme.bg,
      }}
    >
      <GradientWash from={theme.surface} to={theme.soft} />
      <Row
        style={{
          width: "100%",
          maxWidth: 1180,
          alignSelf: "center",
          paddingHorizontal: 24,
          height: 76,
          justifyContent: "space-between",
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kavyavani home"
          onPress={() => nav.navigate("Tabs", { screen: "Home" })}
        >
          <Row style={{ gap: 9 }}>
            <Feather color={theme.primary} size={26} />
            <Txt kind="title" style={{ fontSize: 29, color: theme.primary }}>
              Kavyavani<Txt style={{ color: theme.accent }}> .</Txt>
            </Txt>
          </Row>
        </Pressable>
        <Row style={{ gap: 8 }}>
          <IconButton
            label={t("Search poetry", "कविताएँ खोजें")}
            onPress={() => nav.navigate("Tabs", { screen: "Discover" })}
          >
            <Search size={21} color={theme.text} />
          </IconButton>
          <IconButton
            label={t("Your profile", "आपकी प्रोफ़ाइल")}
            onPress={() => nav.navigate("Tabs", { screen: "Profile" })}
          >
            <View
              style={{
                backgroundColor: theme.soft,
                padding: 10,
                borderRadius: 30,
              }}
            >
              <UserRound size={19} color={theme.primary} />
            </View>
          </IconButton>
        </Row>
      </Row>
    </View>
  );
}
export function Empty({
  title,
  description,
  children,
}: React.PropsWithChildren<{ title: string; description: string }>) {
  const { theme } = useApp();
  return (
    <View
      style={{
        paddingVertical: 46,
        paddingHorizontal: 20,
        alignItems: "center",
        gap: 12,
      }}
    >
      <BookOpen size={34} strokeWidth={1} color={theme.accent} />
      <Txt kind="title" style={{ textAlign: "center", fontSize: 25 }}>
        {title}
      </Txt>
      <Txt muted style={{ textAlign: "center", maxWidth: 460 }}>
        {description}
      </Txt>
      {children}
    </View>
  );
}
export function Loading({ label }: { label: string }) {
  const { theme } = useApp();
  return (
    <View style={{ padding: 40, alignItems: "center", gap: 14 }}>
      <ActivityIndicator color={theme.primary} />
      <Txt muted>{label}</Txt>
    </View>
  );
}
export function Sheet({
  visible,
  onClose,
  title,
  children,
}: React.PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title: string;
}>) {
  const { theme, t } = useApp();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: "#00000066",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityLabel={t("Close dialog", "संवाद बंद करें")}
          onPress={onClose}
        />
        <View
          accessibilityViewIsModal
          style={{
            width: "100%",
            maxWidth: 540,
            maxHeight: "88%",
            backgroundColor: theme.bg,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 24,
            boxShadow: `0 8px 40px ${theme.glow}24`,
          }}
        >
          <ThemeBackdrop palette={theme} compact radius={17} />
          <Row style={{ justifyContent: "space-between", marginBottom: 16 }}>
            <Txt kind="title" style={{ fontSize: 25, flex: 1 }}>
              {title}
            </Txt>
            <IconButton label={t("Close", "बंद करें")} onPress={onClose}>
              <X size={20} color={theme.text} />
            </IconButton>
          </Row>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 18 }}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
export function PoetTile({
  poet,
  compact = false,
}: {
  poet: Poet;
  compact?: boolean;
}) {
  const { theme, t } = useApp(),
    nav = useNav();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${poet.name}, ${poet.count} poems`}
      onPress={() => nav.navigate("Poet", { id: poet.id })}
      style={({ pressed }) => ({
        width: compact ? 150 : 178,
        alignItems: "center",
        gap: 9,
        opacity: pressed ? 0.7 : 1,
        paddingVertical: 12,
      })}
    >
      <View
        style={{
          width: compact ? 86 : 110,
          height: compact ? 86 : 110,
          borderRadius: 60,
          borderWidth: 1,
          borderColor: theme.border,
          padding: 6,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.soft,
            borderRadius: 60,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GradientWash from={theme.surface} to={theme.wash} radius={60} />
          <Txt
            kind="title"
            style={{ fontSize: compact ? 31 : 42, color: theme.primary }}
          >
            {poet.name
              .split(" ")
              .filter(Boolean)
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </Txt>
          <View style={{ position: "absolute", bottom: 7 }}>
            <Feather size={15} strokeWidth={1} color={theme.accent} />
          </View>
        </View>
      </View>
      <Txt style={{ textAlign: "center", fontSize: 13 }} numberOfLines={2}>
        {poet.name}
      </Txt>
      <Txt muted style={{ fontSize: 11 }}>
        {poet.count} {t("poems", "रचनाएँ")}
      </Txt>
    </Pressable>
  );
}
export function PoemCard({
  poem,
  onListen,
}: {
  poem: PoemSummary;
  onListen?: () => void;
}) {
  const { state, setState, theme, t } = useApp(),
    nav = useNav(),
    saved = state.favourites.includes(poem.id);
  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderColor: theme.border,
        paddingVertical: 18,
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${poem.title} by ${getPoetById(poem.poetId)?.name}`}
        onPress={() => nav.navigate("Reader", { id: poem.id })}
        style={{ flex: 1, gap: 6, minHeight: 62, justifyContent: "center" }}
      >
        <Txt
          kind="verse"
          numberOfLines={2}
          style={{ fontSize: 20, lineHeight: 32 }}
        >
          {poem.firstLine}
        </Txt>
        <Txt muted style={{ fontSize: 12 }}>
          {getPoetById(poem.poetId)?.name} · {poem.genre}
        </Txt>
      </Pressable>
      <Row style={{ gap: 0 }}>
        {onListen && (
          <IconButton
            label={t("Find a recitation", "वाचन खोजें")}
            onPress={onListen}
          >
            <Headphones size={18} color={theme.muted} />
          </IconButton>
        )}
        <IconButton
          selected={saved}
          label={
            saved
              ? t("Unsave poem", "संग्रह से हटाएँ")
              : t("Save poem", "कविता सहेजें")
          }
          onPress={() =>
            setState((s) => ({
              ...s,
              favourites: toggleId(s.favourites, poem.id),
            }))
          }
        >
          <Heart
            size={19}
            color={saved ? theme.primary : theme.muted}
            fill={saved ? theme.primary : "transparent"}
          />
        </IconButton>
      </Row>
    </View>
  );
}
