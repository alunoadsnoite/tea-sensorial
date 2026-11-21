import { useMemo, useState } from "react";
import { ScrollView, Share, Text, TextInput, View } from "react-native";
import type { Helper } from "../catalog";
import { helperEmoji, helpers } from "../catalog";
import { helperMessage } from "../i18n";
import { buildProfile } from "../profile";
import type { SensoryEvent, Settings } from "../types";

import { Button, Chip, Header, useUi } from "../ui";

export function CardScreen({
  settings,
  events,
  onSaveName,
  onBack,
}: {
  settings: Settings;
  events: SensoryEvent[];
  onSaveName: (name: string) => void;
  onBack: () => void;
}) {
  const { styles, t } = useUi();
  const profile = useMemo(() => buildProfile(events), [events]);
  const suggested = useMemo(
    () => profile.topHelpers.map((item) => item.key),
    [profile],
  );
  const [selected, setSelected] = useState<Helper[]>(suggested);
  const [name, setName] = useState(settings.name);
  const [error, setError] = useState<string | null>(null);

  function toggleHelper(helper: Helper) {
    setSelected((current) =>
      current.includes(helper)
        ? current.filter((item) => item !== helper)
        : [...current, helper],
    );
  }

  const text = useMemo(() => {
    const lines = [`${t("appName")} — ${t("cardTitle")}`];
    if (name.trim()) lines.push("", name.trim());
    lines.push("", t("cardIntro"));
    for (const helper of selected) lines.push(`• ${t(helperMessage[helper])}`);
    lines.push("", t("cardHowTitle"));
    lines.push(
      `• ${t("cardHow1")}`,
      `• ${t("cardHow2")}`,
      `• ${t("cardHow3")}`,
      "",
      t("cardDisclaimer"),
    );
    return lines.join("\n");
  }, [name, selected, t]);

  async function handleShare() {
    if (selected.length === 0) {
      setError(t("cardEmpty"));
      return;
    }
    setError(null);
    try {
      await Share.share({ message: text, title: t("cardTitle") });
    } catch {
      setError(t("shareError"));
    }
  }

  const suggestedLabels = suggested
    .map((item) => t(helperMessage[item]))
    .join(" · ");

  return (
    <>
      <Header onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text accessibilityRole="header" style={styles.h1}>
          {t("cardTitle")}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>{t("cardName")}</Text>
          <TextInput
            accessibilityLabel={t("cardName")}
            value={name}
            onChangeText={setName}
            onBlur={() => onSaveName(name.trim().slice(0, 80))}
            placeholder={t("cardNamePlaceholder")}
            placeholderTextColor={styles.caption.color}
            maxLength={80}
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("cardSelect")}</Text>
          {suggestedLabels ? (
            <Text style={styles.caption}>
              {t("cardSuggested")}: {suggestedLabels}
            </Text>
          ) : null}
          <View style={styles.row}>
            {helpers.map((item) => (
              <Chip
                key={item}
                label={t(helperMessage[item])}
                emoji={helperEmoji[item]}
                selected={selected.includes(item)}
                onPress={() => toggleHelper(item)}
              />
            ))}
          </View>
        </View>

        {error ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.label}>{t("cardPreview")}</Text>
          <View style={styles.preview}>
            <Text selectable style={styles.previewText}>
              {text}
            </Text>
          </View>
        </View>

        <Button label={t("shareCard")} onPress={() => void handleShare()} />
      </ScrollView>
    </>
  );
}
