import { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Language, MessageKey } from "../i18n";
import { languages } from "../i18n";
import type { Settings, ThemeMode } from "../types";

import { APP_VERSION, DEVELOPER_EMAIL } from "../config";
import { Button, Chip, Header, useUi } from "../ui";

export function SettingsScreen({
  settings,
  onChange,
  onExport,
  onDeleteAll,
  onBack,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onExport: () => Promise<void>;
  onDeleteAll: () => Promise<void>;
  onBack: () => void;
}) {
  const { styles, t } = useUi();
  const [name, setName] = useState(settings.name);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const themeOptions: { value: ThemeMode; label: MessageKey }[] = [
    { value: "light", label: "themeLight" },
    { value: "dark", label: "themeDark" },
    { value: "system", label: "themeSystem" },
  ];

  function confirmDelete() {
    Alert.alert(t("deleteAllTitle"), t("deleteAllBody"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => void onDeleteAll(),
      },
    ]);
  }

  async function handleExport() {
    setExportError(null);
    setExporting(true);
    try {
      await onExport();
    } catch {
      setExportError(t("exportError"));
    } finally {
      setExporting(false);
    }
  }

  async function handleContact() {
    try {
      await Linking.openURL(
        `mailto:${DEVELOPER_EMAIL}?subject=${encodeURIComponent(`TEA Sensorial ${APP_VERSION}`)}`,
      );
    } catch {
      Alert.alert(t("contactError"));
    }
  }

  return (
    <>
      <Header onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text accessibilityRole="header" style={styles.h1}>
          {t("settingsTitle")}
        </Text>

        <View style={styles.section}>
          <Text style={styles.h2}>{t("appearance")}</Text>
          <Text style={styles.label}>{t("theme")}</Text>
          <View style={styles.row}>
            {themeOptions.map((option) => (
              <Chip
                key={option.value}
                label={t(option.label)}
                selected={settings.theme === option.value}
                onPress={() => onChange({ theme: option.value })}
              />
            ))}
          </View>

          <Text style={styles.label}>{t("language")}</Text>
          <View style={styles.row}>
            {(Object.keys(languages) as Language[]).map((language) => (
              <Chip
                key={language}
                label={languages[language]}
                selected={settings.language === language}
                onPress={() => onChange({ language })}
              />
            ))}
          </View>

          <View style={styles.settingsRow}>
            <View style={styles.settingsText}>
              <Text style={styles.label}>{t("largerText")}</Text>
              <Text style={styles.caption}>{t("largerTextHint")}</Text>
            </View>
            <Switch
              accessibilityLabel={t("largerText")}
              value={settings.largerText}
              onValueChange={(largerText) => onChange({ largerText })}
              trackColor={{
                false: styles.divider.backgroundColor,
                true: styles.chipSelected.backgroundColor,
              }}
              thumbColor={styles.safe.backgroundColor}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.h2}>{t("yourName")}</Text>
          <TextInput
            accessibilityLabel={t("yourName")}
            value={name}
            onChangeText={setName}
            onBlur={() => onChange({ name: name.trim().slice(0, 80) })}
            placeholder={t("cardNamePlaceholder")}
            placeholderTextColor={styles.caption.color}
            maxLength={80}
            style={styles.input}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.h2}>{t("data")}</Text>
          <Button
            label={t("exportData")}
            variant="secondary"
            onPress={() => void handleExport()}
            disabled={exporting}
          />
          <Text style={styles.caption}>{t("exportHint")}</Text>
          {exportError ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {exportError}
            </Text>
          ) : null}
          <Button
            label={t("deleteAll")}
            variant="danger"
            onPress={confirmDelete}
          />
        </View>

        <View style={styles.privacyBox}>
          <Text style={styles.privacyTitle}>{t("privacyTitle")}</Text>
          <Text style={styles.privacyBody}>{t("privacyBody")}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>{t("about")}</Text>
          <Text style={styles.body}>{t("version", { v: APP_VERSION })}</Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => void handleContact()}
            style={styles.headerBack}
          >
            <Text style={styles.link}>{t("contact")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}
