import { Pressable, ScrollView, Text, View } from "react-native";

import { Button, Header, useUi } from "../ui";

export function HomeScreen({
  eventCount,
  onLog,
  onProfile,
  onCard,
  onHistory,
  onSettings,
}: {
  eventCount: number;
  onLog: () => void;
  onProfile: () => void;
  onCard: () => void;
  onHistory: () => void;
  onSettings: () => void;
}) {
  const { styles, t } = useUi();
  return (
    <>
      <Header
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("settings")}
            onPress={onSettings}
            style={styles.headerAction}
          >
            <Text
              style={styles.headerActionText}
              accessible={false}
              importantForAccessibility="no"
            >
              ⚙️
            </Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.caption}>{t("tagline")}</Text>
          <Text accessibilityRole="header" style={styles.heroTitle}>
            {t("homeTitle")}
          </Text>
          <Text style={styles.heroText}>{t("homeHint")}</Text>
        </View>

        <Button label={t("logNow")} onPress={onLog} />

        <View style={styles.buttonRow}>
          <View style={styles.half}>
            <Button
              label={t("profile")}
              onPress={onProfile}
              variant="secondary"
            />
          </View>
          <View style={styles.half}>
            <Button label={t("card")} onPress={onCard} variant="secondary" />
          </View>
        </View>

        <Button label={t("history")} onPress={onHistory} variant="secondary" />

        {eventCount > 0 ? (
          <Text style={styles.caption}>
            {t(eventCount === 1 ? "recordsOne" : "recordsMany", {
              n: eventCount,
            })}
          </Text>
        ) : null}

        <Text style={styles.footer}>{t("localOnly")}</Text>
      </ScrollView>
    </>
  );
}
