import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultState, parseState, type UserState } from "./model";
import { themes } from "../theme/themes";
const KEY = "kavyavani.library.v1";
type Context = {
  state: UserState;
  setState: React.Dispatch<React.SetStateAction<UserState>>;
  theme: typeof themes.parchment;
  ready: boolean;
  storageError: string;
  retrySave: () => void;
  t: (english: string, hindi: string) => string;
};
const AppContext = createContext<Context | null>(null);
let writes = Promise.resolve();
export function AppProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState(() => {
      if (Platform.OS === "web" && typeof localStorage !== "undefined") {
        try {
          const raw = localStorage.getItem(KEY);
          if (raw) return parseState(raw);
        } catch {
          /* Recovery is handled by hydration below. */
        }
      }
      return defaultState;
    }),
    [ready, setReady] = useState(false),
    [storageError, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const [loaded, setLoaded] = useState<UserState | null>(null);
  const system = useColorScheme();
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY)
      .then(async (raw) => {
        if (!active) return;
        let next = defaultState;
        if (raw) {
          try {
            next = parseState(raw);
          } catch {
            await AsyncStorage.setItem(`${KEY}.recovery`, raw);
            if (active)
              setError(
                "The saved library could not be read. A recovery copy was kept. You can restore a backup in Settings.",
              );
          }
        }
        if (active) {
          setState(next);
          setLoaded(next);
        }
      })
      .catch(() => {
        if (active)
          setError(
            "Device storage is unavailable. Changes may not survive a restart.",
          );
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!ready || (state === loaded && retry === 0)) return;
    const snapshot = JSON.stringify(state);
    let active = true;
    writes = writes
      .catch(() => {})
      .then(() => AsyncStorage.setItem(KEY, snapshot))
      .then(() => {
        if (active) setError("");
      })
      .catch(() => {
        if (active)
          setError(
            "Your latest changes could not be saved. Free some device space and retry, or export your library.",
          );
      });
    return () => {
      active = false;
    };
  }, [state, ready, retry, loaded]);
  const theme =
    themes[
      state.theme === "system"
        ? system === "dark"
          ? "midnight"
          : "parchment"
        : state.theme
    ];
  const value = useMemo(
    () => ({
      state,
      setState,
      theme,
      ready,
      storageError,
      retrySave: () => setRetry((n) => n + 1),
      t: (en: string, hi: string) => (state.language === "hi" ? hi : en),
    }),
    [state, theme, ready, storageError],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("AppProvider is missing");
  return value;
}
