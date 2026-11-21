import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { contextEmoji, helperEmoji, senseEmoji } from "../catalog";
import { contextMessage, helperMessage, senseMessage } from "../i18n";
import { buildProfile } from "../profile";
import type { SensoryEvent } from "../types";

import { Button, CountList, Header, useUi } from "../ui";

export function ProfileScreen({
  events,
  onCard,
  onLog,
  onBack,
}: {
  events: SensoryEvent[];
  onCard: () => void;
  onLog: () => void;
  onBack: () => void;
}) {
  const { styles, t } = useUi();
  const profile = useMemo(() => buildProfile(events), [events]);

  return (
    <>
      <Header onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text accessibilityRole="header" style={styles.h1}>
          {t("profileTitle")}
        </Text>
        <Text style={styles.caption}>
          {t(events.length === 1 ? "recordsOne" : "recordsMany", {
            n: events.length,
          })}
        </Text>

        {!profile.enough ? (
          <View style={styles.progressBox}>
            <Text style={styles.body}>
              {t("profileNeedMore", { n: profile.total })}
            </Text>
            <Button label={t("logNow")} onPress={onLog} />
          </View>
        ) : (
          <>
            <CountList
              title={t("topSenses")}
              items={profile.topSenses}
              total={profile.total}
              emoji={senseEmoji}
              message={senseMessage}
            />
            <CountList
              title={t("topDetails")}
              items={profile.topDetails}
              total={profile.total}
            />
            <CountList
              title={t("topContexts")}
              items={profile.topContexts}
              total={profile.total}
              emoji={contextEmoji}
              message={contextMessage}
            />
            <CountList
              title={t("topHelpers")}
              items={profile.topHelpers}
              total={profile.total}
              emoji={helperEmoji}
              message={helperMessage}
            />
            {profile.topHelpers.length === 0 ? (
              <Text style={styles.body}>{t("noHelpers")}</Text>
            ) : null}

            <View style={styles.privacyBox}>
              <Text style={styles.privacyBody}>{t("profileNote")}</Text>
            </View>

            <Button label={t("createCard")} onPress={onCard} />
          </>
        )}
      </ScrollView>
    </>
  );
}
