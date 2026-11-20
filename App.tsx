import { openDatabaseAsync } from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  contextEmoji,
  detailsBySense,
  contexts,
  helperEmoji,
  helpers,
  senseEmoji,
  senses,
} from './src/catalog';
import type { Context, Helper, Sense, SensoryDetail } from './src/catalog';
import {
  deleteAllEvents,
  deleteEvent,
  exportData,
  initialize,
  listEvents,
  loadSettings,
  saveEvent,
  saveSettings,
} from './src/database';
import {
  contextMessage,
  createTranslator,
  helperMessage,
  languages,
  senseMessage,
} from './src/i18n';
import type { Language, MessageKey, Translate } from './src/i18n';
import { buildProfile } from './src/profile';
import { darkPalette, lightPalette } from './src/theme';
import type { Palette } from './src/theme';
import { defaultSettings } from './src/types';
import type { EventDetails, EventDraft, HelpOutcome, SensoryEvent, Settings, ThemeMode } from './src/types';

const APP_VERSION = '0.1.0';
const DEVELOPER_EMAIL = 'valdenor.sa@proton.me';

type Screen = 'home' | 'log' | 'history' | 'profile' | 'card' | 'settings';
type LoadState = 'loading' | 'error' | 'ready';

interface Ui {
  palette: Palette;
  styles: Styles;
  t: Translate;
  font: (size: number) => number;
}

const UiContext = createContext<Ui | null>(null);

function useUi() {
  const ui = useContext(UiContext);
  if (!ui) throw new Error('UiContext ausente');
  return ui;
}

function fontSize(scale: number) {
  return (size: number) => Math.round(size * scale);
}

function createStyles(palette: Palette, scale: number) {
  const f = fontSize(scale);

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.canvas },
    scroll: { padding: 20, paddingBottom: 48, gap: 16 },
    header: {
      minHeight: 56,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    brand: { color: palette.accent, fontSize: f(18), fontWeight: '800' },
    headerBack: { minHeight: 48, justifyContent: 'center', paddingRight: 8 },
    headerBackText: { color: palette.accent, fontSize: f(16), fontWeight: '600' },
    headerAction: {
      minWidth: 48,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerActionText: { fontSize: f(22) },
    h1: { color: palette.ink, fontSize: f(28), fontWeight: '800', lineHeight: f(35) },
    h2: { color: palette.ink, fontSize: f(20), fontWeight: '700', lineHeight: f(26) },
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
      fontWeight: '800',
      lineHeight: f(32),
    },
    heroText: { color: palette.muted, fontSize: f(16), lineHeight: f(23) },
    button: {
      minHeight: 52,
      borderRadius: 14,
      backgroundColor: palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
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
      fontWeight: '700',
      textAlign: 'center',
    },
    buttonTextSecondary: { color: palette.accent },
    buttonTextDanger: { color: palette.danger },
    buttonRow: { flexDirection: 'row', gap: 10 },
    half: { flex: 1 },
    section: { gap: 8 },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 8,
    },
    label: { color: palette.ink, fontSize: f(15), fontWeight: '700' },
    optional: { color: palette.muted, fontSize: f(13), fontWeight: '500' },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.surface,
    },
    chipSelected: { backgroundColor: palette.accent, borderColor: palette.accent },
    chipEmoji: { fontSize: f(16) },
    chipText: { color: palette.ink, fontSize: f(15), fontWeight: '600' },
    chipTextSelected: { color: palette.onAccent },
    intensityRow: { flexDirection: 'row', gap: 8 },
    intensityButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    intensitySelected: { backgroundColor: palette.accent, borderColor: palette.accent },
    intensityText: { color: palette.ink, fontSize: f(18), fontWeight: '700' },
    intensityTextSelected: { color: palette.onAccent },
    intensityScale: {
      flexDirection: 'row',
      justifyContent: 'space-between',
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
    inputMultiline: { minHeight: 100, textAlignVertical: 'top' },
    error: { color: palette.danger, fontSize: f(15), fontWeight: '600' },
    listCard: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 16,
      padding: 16,
      gap: 8,
    },
    listTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    listTitleText: {
      color: palette.ink,
      fontSize: f(17),
      fontWeight: '700',
      flexShrink: 1,
    },
    badge: {
      backgroundColor: palette.pale,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: { color: palette.accent, fontSize: f(13), fontWeight: '700' },
    meta: { color: palette.muted, fontSize: f(14), lineHeight: f(20) },
    note: { color: palette.ink, fontSize: f(15), lineHeight: f(22) },
    actions: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
    smallButton: {
      minHeight: 48,
      justifyContent: 'center',
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.surface,
    },
    smallButtonText: { color: palette.accent, fontSize: f(15), fontWeight: '600' },
    smallDangerText: { color: palette.danger, fontSize: f(15), fontWeight: '600' },
    profileCard: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 18,
      padding: 16,
      gap: 10,
    },
    countRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      minHeight: 40,
    },
    countLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
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
    privacyTitle: { color: palette.ink, fontSize: f(16), fontWeight: '700' },
    privacyBody: { color: palette.muted, fontSize: f(15), lineHeight: f(22) },
    footer: {
      color: palette.muted,
      fontSize: f(13),
      lineHeight: f(19),
      textAlign: 'center',
      marginTop: 8,
    },
    loadingBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 12,
    },
    settingsRow: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    settingsText: { flex: 1, gap: 2 },
    link: {
      color: palette.accent,
      fontSize: f(16),
      fontWeight: '600',
      textDecorationLine: 'underline',
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

function Header({
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
          accessibilityLabel={t('back')}
          onPress={onBack}
          style={styles.headerBack}
        >
          <Text style={styles.headerBackText}>← {t('back')}</Text>
        </Pressable>
      ) : (
        <Text style={styles.brand}>{t('appName')}</Text>
      )}
      {action ?? <View />}
    </View>
  );
}

function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
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
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        pressed && styles.pressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          variant !== 'primary' && styles.buttonTextSecondary,
          variant === 'danger' && styles.buttonTextDanger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Chip({
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
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function CountList({
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
              <Text accessible={false} importantForAccessibility="no">{emoji[item.key]}</Text>
            ) : null}
            <Text style={styles.countLabelText}>{t(message?.[item.key] ?? item.key as MessageKey)}</Text>
          </View>
          <Text style={styles.countValue}>
            {t('countOf', { count: item.count, total })}
          </Text>
        </View>
      ))}
    </View>
  );
}

function HomeScreen({
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
            accessibilityLabel={t('settings')}
            onPress={onSettings}
            style={styles.headerAction}
          >
            <Text style={styles.headerActionText} accessible={false} importantForAccessibility="no">
              ⚙️
            </Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.caption}>{t('tagline')}</Text>
          <Text accessibilityRole="header" style={styles.heroTitle}>
            {t('homeTitle')}
          </Text>
          <Text style={styles.heroText}>{t('homeHint')}</Text>
        </View>

        <Button label={t('logNow')} onPress={onLog} />

        <View style={styles.buttonRow}>
          <View style={styles.half}>
            <Button label={t('profile')} onPress={onProfile} variant="secondary" />
          </View>
          <View style={styles.half}>
            <Button label={t('card')} onPress={onCard} variant="secondary" />
          </View>
        </View>

        <Button label={t('history')} onPress={onHistory} variant="secondary" />

        {eventCount > 0 ? (
          <Text style={styles.caption}>
            {t(eventCount === 1 ? 'recordsOne' : 'recordsMany', { n: eventCount })}
          </Text>
        ) : null}

        <Text style={styles.footer}>{t('localOnly')}</Text>
      </ScrollView>
    </>
  );
}

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
  const label = t('detailOther', { sense: t(senseMessage[sense]) });
  const visible = options.filter((option, index) => expanded || index < 2 || selected.includes(option));

  return (
    <View style={styles.section}>
      <Text style={styles.label}>{t(senseMessage[sense])}</Text>
      <View style={styles.row}>
        {visible.map((option) => (
          <Chip key={option} label={t(option)} selected={selected.includes(option)}
            onPress={() => onToggle(option)} />
        ))}
      </View>
      {expanded || visible.length < options.length ? (
        <Button variant="secondary" label={t(expanded ? 'showLess' : 'showMore')}
          onPress={() => setExpanded(!expanded)} />
      ) : null}
      {addingCustom ? (
        <TextInput accessibilityLabel={label} placeholder={label}
          placeholderTextColor={styles.caption.color} style={styles.input}
          maxLength={120} value={custom} onChangeText={onChangeCustom} />
      ) : (
        <Button variant="secondary" label={label} onPress={() => setAddingCustom(true)} />
      )}
    </View>
  );
}

const helpOutcomes: HelpOutcome[] = ['nothingHelped', 'nothingTried'];

function LogScreen({
  event,
  onSave,
  onBack,
}: {
  event: SensoryEvent | null;
  onSave: (draft: EventDraft) => Promise<void>;
  onBack: () => void;
}) {
  const { styles, t } = useUi();
  const [context, setContext] = useState<Context | null>(event?.context ?? null);
  const [selectedSenses, setSelectedSenses] = useState<Sense[]>(event?.senses ?? []);
  const [intensity, setIntensity] = useState(event?.intensity ?? 3);
  const [selectedHelpers, setSelectedHelpers] = useState<Helper[]>(event?.helpers ?? []);
  const [options, setOptions] = useState<SensoryDetail[]>(event?.details?.options ?? []);
  const [custom, setCustom] = useState<EventDetails['custom']>(event?.details?.custom ?? {});
  const [customHelper, setCustomHelper] = useState(event?.details?.customHelper ?? '');
  const [helpOutcome, setHelpOutcome] = useState(event?.details?.helpOutcome);
  const [showDetails, setShowDetails] = useState(Boolean(event?.details?.options.length || Object.keys(event?.details?.custom ?? {}).length));
  const [showHelpers, setShowHelpers] = useState(false);
  const [addHelper, setAddHelper] = useState(Boolean(customHelper));
  const [note, setNote] = useState(event?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle<T extends string>(value: T, list: T[], setList: (next: T[]) => void) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  async function handleSave() {
    if (!context) {
      setError(t('chooseContext'));
      return;
    }
    if (selectedSenses.length === 0) {
      setError(t('chooseSense'));
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
      setError(t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.h1}>
          {event ? t('editTitle') : t('logTitle')}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>{t('where')}</Text>
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
          <Text style={styles.label}>{t('whatHurt')}</Text>
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
            <Button variant="secondary" label={t(showDetails ? 'showLess' : 'detailPrompt')}
              onPress={() => setShowDetails(!showDetails)} />
            {showDetails && selectedSenses.map((sense) => (
              <SenseDetailOptions
                key={sense}
                sense={sense}
                selected={options}
                custom={custom[sense] ?? ''}
                onToggle={(option) => toggle(option, options, setOptions)}
                onChangeCustom={(value) => setCustom({ ...custom, [sense]: value })}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t('intensity')}</Text>
            <Text style={styles.optional}>{intensity} / 5</Text>
          </View>
          <View style={styles.intensityRow}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: intensity === value }}
                accessibilityLabel={t('intensityLabel', { n: value })}
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
            <Text style={styles.caption}>{t('intensityLow')}</Text>
            <Text style={styles.caption}>{t('intensityHigh')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t('whatHelped')}</Text>
            <Text style={styles.optional}>{t('optional')}</Text>
          </View>
          <View style={styles.row}>
            {helpers.filter((item, index) => showHelpers || index < 5 || selectedHelpers.includes(item))
              .filter((item) => item !== 'other' || selectedHelpers.includes(item)).map((item) => (
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
          <Button variant="secondary" label={t(showHelpers ? 'showLess' : 'showMore')}
            onPress={() => setShowHelpers(!showHelpers)} />
          {(showHelpers || helpOutcome) ? (
            <View style={styles.row}>
              {helpOutcomes.map((outcome) => (
                <Chip key={outcome} label={t(outcome)} selected={outcome === helpOutcome}
                  onPress={() => {
                    setHelpOutcome(helpOutcome === outcome ? undefined : outcome);
                    setSelectedHelpers([]);
                    setCustomHelper('');
                    setAddHelper(false);
                  }} />
              ))}
            </View>
          ) : null}
          {addHelper ? (
            <TextInput accessibilityLabel={t('helperCustom')} placeholder={t('helperCustom')}
              placeholderTextColor={styles.caption.color} style={styles.input}
              maxLength={120} value={customHelper}
              onChangeText={(value) => {
                setCustomHelper(value);
                if (value.trim()) setHelpOutcome(undefined);
              }} />
          ) : showHelpers ? (
            <Button variant="secondary" label={t('addAnother')} onPress={() => setAddHelper(true)} />
          ) : null}

        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{t('note')}</Text>
            <Text style={styles.optional}>{t('optional')}</Text>
          </View>
          <TextInput
            accessibilityLabel={t('note')}
            multiline
            maxLength={500}
            value={note}
            onChangeText={setNote}
            placeholder={t('notePlaceholder')}
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
          label={saving ? t('saving') : t('save')}
          disabled={saving}
          onPress={() => void handleSave()}
        />
      </ScrollView>
    </>
  );
}

function dayKey(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function HistoryScreen({
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
  const [filter, setFilter] = useState<Context | 'all'>('all');

  const visibleContexts = useMemo(
    () => contexts.filter((item) => events.some((event) => event.context === item)),
    [events],
  );

  const filtered = useMemo(
    () => (filter === 'all' ? events : events.filter((event) => event.context === filter)),
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

    if (dayKey(timestamp) === dayKey(now.getTime())) return t('today');
    if (dayKey(timestamp) === dayKey(yesterday.getTime())) return t('yesterday');
    return new Date(timestamp).toLocaleDateString(language, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  return (
    <>
      <Header onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text accessibilityRole="header" style={styles.h1}>
          {t('historyTitle')}
        </Text>
        <Text style={styles.caption}>
          {t(events.length === 1 ? 'recordsOne' : 'recordsMany', { n: events.length })}
        </Text>

        {events.length === 0 ? (
          <View style={styles.progressBox}>
            <Text style={styles.body}>{t('emptyHistory')}</Text>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.row}
            >
              <Chip
                label={t('filterAll')}
                selected={filter === 'all'}
                onPress={() => setFilter('all')}
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
              <Text style={styles.body}>{t('noResults')}</Text>
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
                        return labels.length ? `${senseLabel} (${labels.join(', ')})` : senseLabel;
                      })
                      .join(' · ');
                    const helperLabels = [
                      ...event.helpers.map((item) => t(helperMessage[item])),
                      event.details?.customHelper,
                    ].filter(Boolean).join(' · ');
                    const contextLabel = t(contextMessage[event.context]);

                    return (
                      <View key={event.id} style={styles.listCard}>
                        <View style={styles.listTitle}>
                          <Text accessible={false} importantForAccessibility="no">
                            {contextEmoji[event.context]}
                          </Text>
                          <Text style={styles.listTitleText}>{contextLabel}</Text>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                              {t('intensityLabel', { n: event.intensity })}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.meta}>
                          {t('summary', { senses: senseLabels, n: event.intensity })}
                        </Text>
                        {helperLabels ? (
                          <Text style={styles.meta}>✓ {helperLabels}</Text>
                        ) : null}
                        {event.details?.helpOutcome ? (
                          <Text style={styles.meta}>{t(event.details.helpOutcome)}</Text>
                        ) : null}
                        {event.note ? <Text style={styles.note}>{event.note}</Text> : null}
                        <View style={styles.actions}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${t('edit')}: ${contextLabel}`}
                            onPress={() => onEdit(event)}
                            style={styles.smallButton}
                          >
                            <Text style={styles.smallButtonText}>{t('edit')}</Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${t('delete')}: ${contextLabel}`}
                            onPress={() => onDelete(event)}
                            style={styles.smallButton}
                          >
                            <Text style={styles.smallDangerText}>{t('delete')}</Text>
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

function ProfileScreen({
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
          {t('profileTitle')}
        </Text>
        <Text style={styles.caption}>
          {t(events.length === 1 ? 'recordsOne' : 'recordsMany', { n: events.length })}
        </Text>

        {!profile.enough ? (
          <View style={styles.progressBox}>
            <Text style={styles.body}>
              {t('profileNeedMore', { n: profile.total })}
            </Text>
            <Button label={t('logNow')} onPress={onLog} />
          </View>
        ) : (
          <>
            <CountList
              title={t('topSenses')}
              items={profile.topSenses}
              total={profile.total}
              emoji={senseEmoji}
              message={senseMessage}
            />
            <CountList title={t('topDetails')} items={profile.topDetails} total={profile.total} />
            <CountList
              title={t('topContexts')}
              items={profile.topContexts}
              total={profile.total}
              emoji={contextEmoji}
              message={contextMessage}
            />
            <CountList
              title={t('topHelpers')}
              items={profile.topHelpers}
              total={profile.total}
              emoji={helperEmoji}
              message={helperMessage}
            />
            {profile.topHelpers.length === 0 ? (
              <Text style={styles.body}>{t('noHelpers')}</Text>
            ) : null}

            <View style={styles.privacyBox}>
              <Text style={styles.privacyBody}>{t('profileNote')}</Text>
            </View>

            <Button label={t('createCard')} onPress={onCard} />
          </>
        )}
      </ScrollView>
    </>
  );
}

function CardScreen({
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
    const lines = [`${t('appName')} — ${t('cardTitle')}`];
    if (name.trim()) lines.push('', name.trim());
    lines.push('', t('cardIntro'));
    for (const helper of selected) lines.push(`• ${t(helperMessage[helper])}`);
    lines.push('', t('cardHowTitle'));
    lines.push(
      `• ${t('cardHow1')}`,
      `• ${t('cardHow2')}`,
      `• ${t('cardHow3')}`,
      '',
      t('cardDisclaimer'),
    );
    return lines.join('\n');
  }, [name, selected, t]);

  async function handleShare() {
    if (selected.length === 0) {
      setError(t('cardEmpty'));
      return;
    }
    setError(null);
    try {
      await Share.share({ message: text, title: t('cardTitle') });
    } catch {
      setError(t('shareError'));
    }
  }

  const suggestedLabels = suggested
    .map((item) => t(helperMessage[item]))
    .join(' · ');

  return (
    <>
      <Header onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.h1}>
          {t('cardTitle')}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>{t('cardName')}</Text>
          <TextInput
            accessibilityLabel={t('cardName')}
            value={name}
            onChangeText={setName}
            onBlur={() => onSaveName(name.trim().slice(0, 80))}
            placeholder={t('cardNamePlaceholder')}
            placeholderTextColor={styles.caption.color}
            maxLength={80}
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('cardSelect')}</Text>
          {suggestedLabels ? (
            <Text style={styles.caption}>
              {t('cardSuggested')}: {suggestedLabels}
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
          <Text style={styles.label}>{t('cardPreview')}</Text>
          <View style={styles.preview}>
            <Text selectable style={styles.previewText}>
              {text}
            </Text>
          </View>
        </View>

        <Button label={t('shareCard')} onPress={() => void handleShare()} />
      </ScrollView>
    </>
  );
}

function SettingsScreen({
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
    { value: 'light', label: 'themeLight' },
    { value: 'dark', label: 'themeDark' },
    { value: 'system', label: 'themeSystem' },
  ];

  function confirmDelete() {
    Alert.alert(t('deleteAllTitle'), t('deleteAllBody'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
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
      setExportError(t('exportError'));
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
      Alert.alert(t('contactError'));
    }
  }

  return (
    <>
      <Header onBack={onBack} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={styles.h1}>
          {t('settingsTitle')}
        </Text>

        <View style={styles.section}>
          <Text style={styles.h2}>{t('appearance')}</Text>
          <Text style={styles.label}>{t('theme')}</Text>
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

          <Text style={styles.label}>{t('language')}</Text>
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
              <Text style={styles.label}>{t('largerText')}</Text>
              <Text style={styles.caption}>{t('largerTextHint')}</Text>
            </View>
            <Switch
              accessibilityLabel={t('largerText')}
              value={settings.largerText}
              onValueChange={(largerText) => onChange({ largerText })}
              trackColor={{ false: styles.divider.backgroundColor, true: styles.chipSelected.backgroundColor }}
              thumbColor={styles.safe.backgroundColor}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.h2}>{t('yourName')}</Text>
          <TextInput
            accessibilityLabel={t('yourName')}
            value={name}
            onChangeText={setName}
            onBlur={() => onChange({ name: name.trim().slice(0, 80) })}
            placeholder={t('cardNamePlaceholder')}
            placeholderTextColor={styles.caption.color}
            maxLength={80}
            style={styles.input}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.h2}>{t('data')}</Text>
          <Button
            label={t('exportData')}
            variant="secondary"
            onPress={() => void handleExport()}
            disabled={exporting}
          />
          <Text style={styles.caption}>{t('exportHint')}</Text>
          {exportError ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {exportError}
            </Text>
          ) : null}
          <Button
            label={t('deleteAll')}
            variant="danger"
            onPress={confirmDelete}
          />
        </View>

        <View style={styles.privacyBox}>
          <Text style={styles.privacyTitle}>{t('privacyTitle')}</Text>
          <Text style={styles.privacyBody}>{t('privacyBody')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>{t('about')}</Text>
          <Text style={styles.body}>{t('version', { v: APP_VERSION })}</Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => void handleContact()}
            style={styles.headerBack}
          >
            <Text style={styles.link}>{t('contact')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

function AppContent() {
  const scheme = useColorScheme();
  const dbRef = useRef<SQLiteDatabase | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [reloadToken, setReloadToken] = useState(0);
  const [events, setEvents] = useState<SensoryEvent[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [screen, setScreen] = useState<Screen>('home');
  const [editing, setEditing] = useState<SensoryEvent | null>(null);

  const dark = settings.theme === 'dark' || (settings.theme === 'system' && scheme === 'dark');
  const palette = dark ? darkPalette : lightPalette;
  const scale = settings.largerText ? 1.18 : 1;
  const styles = useMemo(() => createStyles(palette, scale), [palette, scale]);
  const t = useMemo(() => createTranslator(settings.language), [settings.language]);
  const ui = useMemo<Ui>(
    () => ({ palette, styles, t, font: fontSize(scale) }),
    [palette, styles, t, scale],
  );

  useEffect(() => {
    let active = true;
    setLoadState('loading');

    void (async () => {
      try {
        let database = dbRef.current;
        if (!database) {
          database = await openDatabaseAsync('tea-sensorial.db');
          await initialize(database);
          dbRef.current = database;
        }

        const [nextSettings, nextEvents] = await Promise.all([
          loadSettings(database),
          listEvents(database),
        ]);

        if (!active) return;
        setSettings(nextSettings);
        setEvents(nextEvents);
        setLoadState('ready');
      } catch {
        if (active) setLoadState('error');
      }
    })();

    return () => {
      active = false;
    };
  }, [reloadToken]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'home') return false;
      setScreen('home');
      setEditing(null);
      return true;
    });
    return () => subscription.remove();
  }, [screen]);

  function goHome() {
    setScreen('home');
    setEditing(null);
  }

  function openLog(event: SensoryEvent | null) {
    setEditing(event);
    setScreen('log');
  }

  function updateSettings(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    if (dbRef.current) {
      void saveSettings(dbRef.current, next).catch(() => {
        Alert.alert(t('saveError'));
      });
    }
  }

  async function handleSave(draft: EventDraft) {
    const database = dbRef.current;
    if (!database) throw new Error('Banco indisponível');

    await saveEvent(database, draft, editing?.id);
    const next = await listEvents(database);
    setEvents(next);
    setEditing(null);
    setScreen('home');
  }

  async function handleDelete(event: SensoryEvent) {
    Alert.alert(t('deleteTitle'), t('deleteBody'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          const database = dbRef.current;
          if (!database) return;
          void (async () => {
            try {
              await deleteEvent(database, event.id);
              setEvents(await listEvents(database));
            } catch {
              Alert.alert(t('saveError'));
            }
          })();
        },
      },
    ]);
  }

  async function handleDeleteAll() {
    const database = dbRef.current;
    if (!database) return;
    try {
      await deleteAllEvents(database);
      setEvents(await listEvents(database));
      Alert.alert(t('dataDeleted'));
    } catch {
      Alert.alert(t('saveError'));
    }
  }

  async function handleExport() {
    const database = dbRef.current;
    if (!database) throw new Error('Banco indisponível');
    const text = await exportData(database);
    await Share.share({ message: text, title: t('exportData') });
  }

  function renderScreen() {
    switch (screen) {
      case 'log':
        return (
          <LogScreen
            event={editing}
            onSave={handleSave}
            onBack={goHome}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            events={events}
            language={settings.language}
            onEdit={(event) => openLog(event)}
            onDelete={(event) => void handleDelete(event)}
            onBack={goHome}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            events={events}
            onCard={() => setScreen('card')}
            onLog={() => openLog(null)}
            onBack={goHome}
          />
        );
      case 'card':
        return (
          <CardScreen
            settings={settings}
            events={events}
            onSaveName={(name) => updateSettings({ name })}
            onBack={goHome}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            settings={settings}
            onChange={updateSettings}
            onExport={handleExport}
            onDeleteAll={handleDeleteAll}
            onBack={goHome}
          />
        );
      default:
        return (
          <HomeScreen
            eventCount={events.length}
            onLog={() => openLog(null)}
            onProfile={() => setScreen('profile')}
            onCard={() => setScreen('card')}
            onHistory={() => setScreen('history')}
            onSettings={() => setScreen('settings')}
          />
        );
    }
  }

  return (
    <UiContext.Provider value={ui}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar
          barStyle={dark ? 'light-content' : 'dark-content'}
          backgroundColor={palette.canvas}
        />
        {loadState === 'loading' ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={palette.accent} />
            <Text style={styles.body}>{t('loading')}</Text>
          </View>
        ) : loadState === 'error' ? (
          <View style={styles.loadingBox}>
            <Text style={styles.h2}>{t('loadError')}</Text>
            <Button
              label={t('retry')}
              onPress={() => setReloadToken((value) => value + 1)}
            />
          </View>
        ) : (
          renderScreen()
        )}
      </SafeAreaView>
    </UiContext.Provider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
