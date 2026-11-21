import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { Context } from "../catalog";
import { contextEmoji, contexts, detailsBySense } from "../catalog";
import type { Language } from "../i18n";
import { contextMessage, helperMessage, senseMessage } from "../i18n";
import type { SensoryEvent } from "../types";

import { Chip, Header, useUi } from "../ui";

function dayKey(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function HistoryScreen({
  events,
  language,
  onEdit,
  onDelete,
  onBack,
}: {
  events: SensoryEvent[];
  language: Language;
  onEdit: (event: SensoryEvent) => void;
  onDelete: (event: SensoryEvent) => void;
  onBack: () => void;
}) {
  const { styles, t } = useUi();
  const [filter, setFilter] = useState<Context | "all">("all");

  const visibleContexts = useMemo(
    () =>
      contexts.filter((item) => events.some((event) => event.context === item)),
    [events],
  );

  const filtered = useMemo(
    () =>
      filter === "all"
        ? events
        : events.filter((event) => event.context === filter),
    [events, filter],
  );

  const groups = useMemo(() => {
    const map = new Map<string, SensoryEvent[]>();
    for (const event of filtered) {
      const key = dayKey(event.createdAt);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [filtered]);

  function dayLabel(timestamp: number) {
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (dayKey(timestamp) === dayKey(now.getTime())) return t("today");
    if (dayKey(timestamp) === dayKey(yesterday.getTime()))
      return t("yesterday");
    return new Date(timestamp).toLocaleDateString(language, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  return (
    <>
      <Header onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text accessibilityRole="header" style={styles.h1}>
          {t("historyTitle")}
        </Text>
        <Text style={styles.caption}>
          {t(events.length === 1 ? "recordsOne" : "recordsMany", {
            n: events.length,
          })}
        </Text>

        {events.length === 0 ? (
          <View style={styles.progressBox}>
            <Text style={styles.body}>{t("emptyHistory")}</Text>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
            >
              <Chip
                label={t("filterAll")}
                selected={filter === "all"}
                onPress={() => setFilter("all")}
              />
              {visibleContexts.map((item) => (
                <Chip
                  key={item}
                  label={t(contextMessage[item])}
                  emoji={contextEmoji[item]}
                  selected={filter === item}
                  onPress={() => setFilter(item)}
                />
              ))}
            </ScrollView>

            {filtered.length === 0 ? (
              <Text style={styles.body}>{t("noResults")}</Text>
            ) : (
              groups.map(([key, list]) => (
                <View key={key} style={styles.section}>
                  <Text style={styles.h2}>{dayLabel(list[0].createdAt)}</Text>
                  {list.map((event) => {
                    const senseLabels = event.senses
                      .map((sense) => {
                        const detail = event.details;
                        const labels = detailsBySense[sense]
                          .filter((option) => detail?.options.includes(option))
                          .map((option) => t(option));
                        const customLabel = detail?.custom[sense];
                        if (customLabel) labels.push(customLabel);
                        const senseLabel = t(senseMessage[sense]);
                        return labels.length
                          ? `${senseLabel} (${labels.join(", ")})`
                          : senseLabel;
                      })
                      .join(" · ");
                    const helperLabels = [
                      ...event.helpers.map((item) => t(helperMessage[item])),
                      event.details?.customHelper,
                    ]
                      .filter(Boolean)
                      .join(" · ");
                    const contextLabel = t(contextMessage[event.context]);

                    return (
                      <View key={event.id} style={styles.listCard}>
                        <View style={styles.listTitle}>
                          <Text
                            accessible={false}
                            importantForAccessibility="no"
                          >
                            {contextEmoji[event.context]}
                          </Text>
                          <Text style={styles.listTitleText}>
                            {contextLabel}
                          </Text>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                              {t("intensityLabel", { n: event.intensity })}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.meta}>
                          {t("summary", {
                            senses: senseLabels,
                            n: event.intensity,
                          })}
                        </Text>
                        {helperLabels ? (
                          <Text style={styles.meta}>✓ {helperLabels}</Text>
                        ) : null}
                        {event.details?.helpOutcome ? (
                          <Text style={styles.meta}>
                            {t(event.details.helpOutcome)}
                          </Text>
                        ) : null}
                        {event.note ? (
                          <Text style={styles.note}>{event.note}</Text>
                        ) : null}
                        <View style={styles.actions}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${t("edit")}: ${contextLabel}`}
                            onPress={() => onEdit(event)}
                            style={styles.smallButton}
                          >
                            <Text style={styles.smallButtonText}>
                              {t("edit")}
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${t("delete")}: ${contextLabel}`}
                            onPress={() => onDelete(event)}
                            style={styles.smallButton}
                          >
                            <Text style={styles.smallDangerText}>
                              {t("delete")}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </>
  );
}
