import type { SQLiteDatabase } from "expo-sqlite";
import { openDatabaseAsync } from "expo-sqlite";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Share,
  StatusBar,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  deleteAllEvents,
  deleteEvent,
  exportData,
  initialize,
  listEvents,
  loadSettings,
  saveEvent,
  saveSettings,
} from "./src/database";
import { createTranslator } from "./src/i18n";
import { darkPalette, lightPalette } from "./src/theme";
import type { EventDraft, SensoryEvent, Settings } from "./src/types";
import { defaultSettings } from "./src/types";

import { CardScreen } from "./src/screens/CardScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LogScreen } from "./src/screens/LogScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import type { Ui } from "./src/ui";
import { Button, createStyles, fontSize, UiContext } from "./src/ui";

type Screen = "home" | "log" | "history" | "profile" | "card" | "settings";
type LoadState = "loading" | "error" | "ready";

function AppContent() {
  const scheme = useColorScheme();
  const dbRef = useRef<SQLiteDatabase | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [reloadToken, setReloadToken] = useState(0);
  const [events, setEvents] = useState<SensoryEvent[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [screen, setScreen] = useState<Screen>("home");
  const [editing, setEditing] = useState<SensoryEvent | null>(null);

  const dark =
    settings.theme === "dark" ||
    (settings.theme === "system" && scheme === "dark");
  const palette = dark ? darkPalette : lightPalette;
  const scale = settings.largerText ? 1.18 : 1;
  const styles = useMemo(() => createStyles(palette, scale), [palette, scale]);
  const t = useMemo(
    () => createTranslator(settings.language),
    [settings.language],
  );
  const ui = useMemo<Ui>(
    () => ({ palette, styles, t, font: fontSize(scale) }),
    [palette, styles, t, scale],
  );

  useEffect(() => {
    let active = true;
    setLoadState("loading");

    void (async () => {
      try {
        let database = dbRef.current;
        if (!database) {
          database = await openDatabaseAsync("tea-sensorial.db");
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
        setLoadState("ready");
      } catch {
        if (active) setLoadState("error");
      }
    })();

    return () => {
      active = false;
    };
  }, [reloadToken]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (screen === "home") return false;
        setScreen("home");
        setEditing(null);
        return true;
      },
    );
    return () => subscription.remove();
  }, [screen]);

  function goHome() {
    setScreen("home");
    setEditing(null);
  }

  function openLog(event: SensoryEvent | null) {
    setEditing(event);
    setScreen("log");
  }

  function updateSettings(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    if (dbRef.current) {
      void saveSettings(dbRef.current, next).catch(() => {
        Alert.alert(t("saveError"));
      });
    }
  }

  async function handleSave(draft: EventDraft) {
    const database = dbRef.current;
    if (!database) throw new Error("Banco indisponível");

    await saveEvent(database, draft, editing?.id);
    const next = await listEvents(database);
    setEvents(next);
    setEditing(null);
    setScreen("home");
  }

  async function handleDelete(event: SensoryEvent) {
    Alert.alert(t("deleteTitle"), t("deleteBody"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => {
          const database = dbRef.current;
          if (!database) return;
          void (async () => {
            try {
              await deleteEvent(database, event.id);
              setEvents(await listEvents(database));
            } catch {
              Alert.alert(t("saveError"));
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
      Alert.alert(t("dataDeleted"));
    } catch {
      Alert.alert(t("saveError"));
    }
  }

  async function handleExport() {
    const database = dbRef.current;
    if (!database) throw new Error("Banco indisponível");
    const text = await exportData(database);
    await Share.share({ message: text, title: t("exportData") });
  }

  function renderScreen() {
    switch (screen) {
      case "log":
        return (
          <LogScreen event={editing} onSave={handleSave} onBack={goHome} />
        );
      case "history":
        return (
          <HistoryScreen
            events={events}
            language={settings.language}
            onEdit={(event) => openLog(event)}
            onDelete={(event) => void handleDelete(event)}
            onBack={goHome}
          />
        );
      case "profile":
        return (
          <ProfileScreen
            events={events}
            onCard={() => setScreen("card")}
            onLog={() => openLog(null)}
            onBack={goHome}
          />
        );
      case "card":
        return (
          <CardScreen
            settings={settings}
            events={events}
            onSaveName={(name) => updateSettings({ name })}
            onBack={goHome}
          />
        );
      case "settings":
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
            onProfile={() => setScreen("profile")}
            onCard={() => setScreen("card")}
            onHistory={() => setScreen("history")}
            onSettings={() => setScreen("settings")}
          />
        );
    }
  }

  return (
    <UiContext.Provider value={ui}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <StatusBar
          barStyle={dark ? "light-content" : "dark-content"}
          backgroundColor={palette.canvas}
        />
        {loadState === "loading" ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={palette.accent} />
            <Text style={styles.body}>{t("loading")}</Text>
          </View>
        ) : loadState === "error" ? (
          <View style={styles.loadingBox}>
            <Text style={styles.h2}>{t("loadError")}</Text>
            <Button
              label={t("retry")}
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
