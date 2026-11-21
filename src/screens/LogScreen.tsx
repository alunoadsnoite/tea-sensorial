import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import type { Context, Helper, Sense, SensoryDetail } from "../catalog";
import {
  contextEmoji,
  contexts,
  detailsBySense,
  helperEmoji,
  helpers,
  senseEmoji,
  senses,
} from "../catalog";
import { contextMessage, helperMessage, senseMessage } from "../i18n";
import type {
  EventDetails,
  EventDraft,
  HelpOutcome,
  SensoryEvent,
} from "../types";

import { Button, Chip, Header, useUi } from "../ui";

function SenseDetailOptions({
  sense,
  selected,
  custom,
  onToggle,
  onChangeCustom,
}: {
  sense: Sense;
  selected: SensoryDetail[];
  custom: string;
  onToggle: (option: SensoryDetail) => void;
  onChangeCustom: (value: string) => void;
}) {
  const { styles, t } = useUi();
  const [expanded, setExpanded] = useState(false);
  const [addingCustom, setAddingCustom] = useState(Boolean(custom));
  const options: readonly SensoryDetail[] = detailsBySense[sense];
  const label = t("detailOther", { sense: t(senseMessage[sense]) });
  const visible = options.filter(
    (option, index) => expanded || index < 2 || selected.includes(option),
  );

  return (
    <View style={styles.section}>
      <Text style={styles.label}>{t(senseMessage[sense])}</Text>
      <View style={styles.row}>
        {visible.map((option) => (
          <Chip
            key={option}
            label={t(option)}
            selected={selected.includes(option)}
            onPress={() => onToggle(option)}
          />
        ))}
      </View>
      {expanded || visible.length < options.length ? (
        <Button
          variant="secondary"
          label={t(expanded ? "showLess" : "showMore")}
          onPress={() => setExpanded(!expanded)}
        />
      ) : null}
      {addingCustom ? (
        <TextInput
          accessibilityLabel={label}
          placeholder={label}
          placeholderTextColor={styles.caption.color}
          style={styles.input}
          maxLength={120}
          value={custom}
          onChangeText={onChangeCustom}
        />
      ) : (
        <Button
          variant="secondary"
          label={label}
          onPress={() => setAddingCustom(true)}
        />
      )}
    </View>
  );
}

const helpOutcomes: HelpOutcome[] = ["nothingHelped", "nothingTried"];

export function LogScreen({
  event,
  onSave,
  onBack,
}: {
  event: SensoryEvent | null;
  onSave: (draft: EventDraft) => Promise<void>;
  onBack: () => void;
}) {
  const { styles, t } = useUi();
  const [context, setContext] = useState<Context | null>(
    event?.context ?? null,
  );
  const [selectedSenses, setSelectedSenses] = useState<Sense[]>(
    event?.senses ?? [],
  );
  const [intensity, setIntensity] = useState(event?.intensity ?? 3);
  const [selectedHelpers, setSelectedHelpers] = useState<Helper[]>(
    event?.helpers ?? [],
  );
  const [options, setOptions] = useState<SensoryDetail[]>(
    event?.details?.options ?? [],
  );
  const [custom, setCustom] = useState<EventDetails["custom"]>(
    event?.details?.custom ?? {},
  );
  const [customHelper, setCustomHelper] = useState(
    event?.details?.customHelper ?? "",
  );
  const [helpOutcome, setHelpOutcome] = useState(event?.details?.helpOutcome);
  const [showDetails, setShowDetails] = useState(
    Boolean(
      event?.details?.options.length ||
        Object.keys(event?.details?.custom ?? {}).length,
    ),
  );
  const [showHelpers, setShowHelpers] = useState(false);
  const [addHelper, setAddHelper] = useState(Boolean(customHelper));
  const [note, setNote] = useState(event?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle<T extends string>(
    value: T,
    list: T[],
    setList: (next: T[]) => void,
  ) {
    setList(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value],
    );
  }

  async function handleSave() {
    if (!context) {
      setError(t("chooseContext"));
      return;
    }
    if (selectedSenses.length === 0) {
      setError(t("chooseSense"));
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await onSave({
        context,
        senses: selectedSenses,
        intensity,
        helpers: selectedHelpers,
        details: { options, custom, customHelper, helpOutcome },
        note,
      });
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
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
          {event ? t("editTitle") : t("logTitle")}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>{t("where")}</Text>
          <View style={styles.row}>
            {contexts.map((item) => (
              <Chip
                key={item}
                label={t(contextMessage[item])}
                emoji={contextEmoji[item]}
                selected={context === item}
                onPress={() => setContext(item)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t("whatHurt")}</Text>
          <View style={styles.row}>
            {senses.map((item) => (
              <Chip
                key={item}
                label={t(senseMessage[item])}
                emoji={senseEmoji[item]}
                selected={selectedSenses.includes(item)}
                onPress={() => toggle(item, selectedSenses, setSelectedSenses)}
              />
            ))}
          </View>
        </View>

        {selectedSenses.length > 0 ? (
          <View style={styles.section}>
            <Button
              variant="secondary"
              label={t(showDetails ? "showLess" : "detailPrompt")}
              onPress={() => setShowDetails(!showDetails)}
            />
            {showDetails &&
              selectedSenses.map((sense) => (
                <SenseDetailOptions
                  key={sense}
                  sense={sense}
                  selected={options}
                  custom={custom[sense] ?? ""}
                  onToggle={(option) => toggle(option, options, setOptions)}
                  onChangeCustom={(value) =>
                    setCustom({ ...custom, [sense]: value })
                  }
                />
              ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t("intensity")}</Text>
            <Text style={styles.optional}>{intensity} / 5</Text>
          </View>
          <View style={styles.intensityRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: intensity === value }}
                accessibilityLabel={t("intensityLabel", { n: value })}
                onPress={() => setIntensity(value)}
                style={[
                  styles.intensityButton,
                  intensity === value && styles.intensitySelected,
                ]}
              >
                <Text
                  style={[
                    styles.intensityText,
                    intensity === value && styles.intensityTextSelected,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.intensityScale}>
            <Text style={styles.caption}>{t("intensityLow")}</Text>
            <Text style={styles.caption}>{t("intensityHigh")}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t("whatHelped")}</Text>
            <Text style={styles.optional}>{t("optional")}</Text>
          </View>
          <View style={styles.row}>
            {helpers
              .filter(
                (item, index) =>
                  showHelpers || index < 5 || selectedHelpers.includes(item),
              )
              .filter(
                (item) => item !== "other" || selectedHelpers.includes(item),
              )
              .map((item) => (
                <Chip
                  key={item}
                  label={t(helperMessage[item])}
                  emoji={helperEmoji[item]}
                  selected={selectedHelpers.includes(item)}
                  onPress={() => {
                    setHelpOutcome(undefined);
                    toggle(item, selectedHelpers, setSelectedHelpers);
                  }}
                />
              ))}
          </View>
          <Button
            variant="secondary"
            label={t(showHelpers ? "showLess" : "showMore")}
            onPress={() => setShowHelpers(!showHelpers)}
          />
          {showHelpers || helpOutcome ? (
            <View style={styles.row}>
              {helpOutcomes.map((outcome) => (
                <Chip
                  key={outcome}
                  label={t(outcome)}
                  selected={outcome === helpOutcome}
                  onPress={() => {
                    setHelpOutcome(
                      helpOutcome === outcome ? undefined : outcome,
                    );
                    setSelectedHelpers([]);
                    setCustomHelper("");
                    setAddHelper(false);
                  }}
                />
              ))}
            </View>
          ) : null}
          {addHelper ? (
            <TextInput
              accessibilityLabel={t("helperCustom")}
              placeholder={t("helperCustom")}
              placeholderTextColor={styles.caption.color}
              style={styles.input}
              maxLength={120}
              value={customHelper}
              onChangeText={(value) => {
                setCustomHelper(value);
                if (value.trim()) setHelpOutcome(undefined);
              }}
            />
          ) : showHelpers ? (
            <Button
              variant="secondary"
              label={t("addAnother")}
              onPress={() => setAddHelper(true)}
            />
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t("note")}</Text>
            <Text style={styles.optional}>{t("optional")}</Text>
          </View>
          <TextInput
            accessibilityLabel={t("note")}
            multiline
            maxLength={500}
            value={note}
            onChangeText={setNote}
            placeholder={t("notePlaceholder")}
            placeholderTextColor={styles.caption.color}
            style={[styles.input, styles.inputMultiline]}
          />
        </View>

        {error ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Button
          label={saving ? t("saving") : t("save")}
          disabled={saving}
          onPress={() => void handleSave()}
        />
      </ScrollView>
    </>
  );
}
