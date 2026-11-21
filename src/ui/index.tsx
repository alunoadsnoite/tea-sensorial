import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MessageKey, Translate } from "../i18n";
import type { Palette } from "../theme";

export interface Ui {
  palette: Palette;
  styles: Styles;
  t: Translate;
  font: (size: number) => number;
}

export const UiContext = createContext<Ui | null>(null);

export function useUi() {
  const ui = useContext(UiContext);
  if (!ui) throw new Error("UiContext ausente");
  return ui;
}

export function fontSize(scale: number) {
  return (size: number) => Math.round(size * scale);
}

export function createStyles(palette: Palette, scale: number) {
  const f = fontSize(scale);

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.canvas },
    scroll: { padding: 20, paddingBottom: 48, gap: 16 },
    header: {
      minHeight: 56,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    brand: { color: palette.accent, fontSize: f(18), fontWeight: "800" },
    headerBack: { minHeight: 48, justifyContent: "center", paddingRight: 8 },
    headerBackText: {
      color: palette.accent,
      fontSize: f(16),
      fontWeight: "600",
    },
    headerAction: {
      minWidth: 48,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    headerActionText: { fontSize: f(22) },
    h1: {
      color: palette.ink,
      fontSize: f(28),
      fontWeight: "800",
      lineHeight: f(35),
    },
    h2: {
      color: palette.ink,
      fontSize: f(20),
      fontWeight: "700",
      lineHeight: f(26),
    },
    body: { color: palette.muted, fontSize: f(16), lineHeight: f(24) },
    caption: { color: palette.muted, fontSize: f(14), lineHeight: f(20) },
    hero: {
      backgroundColor: palette.pale,
      borderRadius: 24,
      padding: 20,
      gap: 10,
    },
    heroTitle: {
      color: palette.ink,
      fontSize: f(26),
      fontWeight: "800",
      lineHeight: f(32),
    },
    heroText: { color: palette.muted, fontSize: f(16), lineHeight: f(23) },
    button: {
      minHeight: 52,
      borderRadius: 14,
      backgroundColor: palette.accent,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
      paddingVertical: 12,
    },
    buttonSecondary: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.accent,
    },
    buttonDanger: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.danger,
    },
    pressed: { opacity: 0.75 },
    buttonDisabled: { opacity: 0.45 },
    buttonText: {
      color: palette.onAccent,
      fontSize: f(17),
      fontWeight: "700",
      textAlign: "center",
    },
    buttonTextSecondary: { color: palette.accent },
    buttonTextDanger: { color: palette.danger },
    buttonRow: { flexDirection: "row", gap: 10 },
    half: { flex: 1 },
    section: { gap: 8 },
    labelRow: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 8,
    },
    label: { color: palette.ink, fontSize: f(15), fontWeight: "700" },
    optional: { color: palette.muted, fontSize: f(13), fontWeight: "500" },
    row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.surface,
    },
    chipSelected: {
      backgroundColor: palette.accent,
      borderColor: palette.accent,
    },
    chipEmoji: { fontSize: f(16) },
    chipText: { color: palette.ink, fontSize: f(15), fontWeight: "600" },
    chipTextSelected: { color: palette.onAccent },
    intensityRow: { flexDirection: "row", gap: 8 },
    intensityButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    intensitySelected: {
      backgroundColor: palette.accent,
      borderColor: palette.accent,
    },
    intensityText: { color: palette.ink, fontSize: f(18), fontWeight: "700" },
    intensityTextSelected: { color: palette.onAccent },
    intensityScale: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 2,
    },
    input: {
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.surface,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: palette.ink,
      fontSize: f(16),
    },
    inputMultiline: { minHeight: 100, textAlignVertical: "top" },
    error: { color: palette.danger, fontSize: f(15), fontWeight: "600" },
    listCard: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 16,
      padding: 16,
      gap: 8,
    },
    listTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    listTitleText: {
      color: palette.ink,
      fontSize: f(17),
      fontWeight: "700",
      flexShrink: 1,
    },
    badge: {
      backgroundColor: palette.pale,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: { color: palette.accent, fontSize: f(13), fontWeight: "700" },
    meta: { color: palette.muted, fontSize: f(14), lineHeight: f(20) },
    note: { color: palette.ink, fontSize: f(15), lineHeight: f(22) },
    actions: { flexDirection: "row", gap: 8, marginTop: 4, flexWrap: "wrap" },
    smallButton: {
      minHeight: 48,
      justifyContent: "center",
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.surface,
    },
    smallButtonText: {
      color: palette.accent,
      fontSize: f(15),
      fontWeight: "600",
    },
    smallDangerText: {
      color: palette.danger,
      fontSize: f(15),
      fontWeight: "600",
    },
    profileCard: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 18,
      padding: 16,
      gap: 10,
    },
    countRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      minHeight: 40,
    },
    countLabel: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
    countLabelText: { color: palette.ink, fontSize: f(16), flexShrink: 1 },
    countValue: { color: palette.muted, fontSize: f(14) },
    progressBox: {
      backgroundColor: palette.pale,
      borderRadius: 18,
      padding: 18,
      gap: 12,
    },
    privacyBox: {
      backgroundColor: palette.highlight,
      borderRadius: 16,
      padding: 16,
      gap: 6,
    },
    privacyTitle: { color: palette.ink, fontSize: f(16), fontWeight: "700" },
    privacyBody: { color: palette.muted, fontSize: f(15), lineHeight: f(22) },
    footer: {
      color: palette.muted,
      fontSize: f(13),
      lineHeight: f(19),
      textAlign: "center",
      marginTop: 8,
    },
    loadingBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 12,
    },
    settingsRow: {
      minHeight: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    settingsText: { flex: 1, gap: 2 },
    link: {
      color: palette.accent,
      fontSize: f(16),
      fontWeight: "600",
      textDecorationLine: "underline",
      paddingVertical: 12,
    },
    preview: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 16,
      padding: 16,
    },
    previewText: { color: palette.ink, fontSize: f(15), lineHeight: f(23) },
    divider: { height: 1, backgroundColor: palette.line, marginVertical: 4 },
  });
}

type Styles = ReturnType<typeof createStyles>;

export function Header({
  onBack,
  action,
}: {
  onBack?: () => void;
  action?: ReactNode;
}) {
  const { styles, t } = useUi();
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("back")}
          onPress={onBack}
          style={styles.headerBack}
        >
          <Text style={styles.headerBackText}>← {t("back")}</Text>
        </Pressable>
      ) : (
        <Text style={styles.brand}>{t("appName")}</Text>
      )}
      {action ?? <View />}
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  accessibilityHint?: string;
}) {
  const { styles } = useUi();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.buttonSecondary,
        variant === "danger" && styles.buttonDanger,
        pressed && styles.pressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant !== "primary" && styles.buttonTextSecondary,
          variant === "danger" && styles.buttonTextDanger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Chip({
  label,
  emoji,
  selected,
  onPress,
}: {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { styles } = useUi();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      {emoji ? (
        <Text
          style={styles.chipEmoji}
          accessible={false}
          importantForAccessibility="no"
        >
          {emoji}
        </Text>
      ) : null}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function CountList({
  title,
  items,
  total,
  emoji,
  message,
}: {
  title: string;
  items: { key: string; count: number }[];
  total: number;
  emoji?: Record<string, string>;
  message?: Record<string, MessageKey>;
}) {
  const { styles, t } = useUi();
  if (items.length === 0) return null;

  return (
    <View style={styles.profileCard}>
      <Text style={styles.label}>{title}</Text>
      {items.map((item) => (
        <View key={item.key} style={styles.countRow}>
          <View style={styles.countLabel}>
            {emoji?.[item.key] ? (
              <Text accessible={false} importantForAccessibility="no">
                {emoji[item.key]}
              </Text>
            ) : null}
            <Text style={styles.countLabelText}>
              {t(message?.[item.key] ?? (item.key as MessageKey))}
            </Text>
          </View>
          <Text style={styles.countValue}>
            {t("countOf", { count: item.count, total })}
          </Text>
        </View>
      ))}
    </View>
  );
}
