import { useEffect, useState } from "react";

/**
 * Mia voice preferences.
 *
 * The mute switch lives only in Settings, so it must be a real, persisted
 * preference that Mia's speech layer reads — never a decorative toggle.
 */
export type MiaPreferences = {
  /** When false, Mia never speaks answers aloud. */
  voiceResponses: boolean;
  /** Playback rate for spoken answers (0.75 – 1.5). */
  speechRate: number;
};

const STORAGE_KEY = "mealmate-mia-preferences";
const CHANGE_EVENT = "mealmate-mia-preferences-changed";

export const DEFAULT_MIA_PREFERENCES: MiaPreferences = {
  voiceResponses: true,
  speechRate: 1,
};

export function getMiaPreferences(): MiaPreferences {
  if (typeof window === "undefined") return DEFAULT_MIA_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MIA_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<MiaPreferences>;
    return {
      voiceResponses: parsed.voiceResponses !== false,
      speechRate:
        typeof parsed.speechRate === "number" && parsed.speechRate >= 0.5 && parsed.speechRate <= 2
          ? parsed.speechRate
          : DEFAULT_MIA_PREFERENCES.speechRate,
    };
  } catch {
    return DEFAULT_MIA_PREFERENCES;
  }
}

export function setMiaPreferences(patch: Partial<MiaPreferences>): MiaPreferences {
  const next = { ...getMiaPreferences(), ...patch };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — preferences stay in memory for this session */
    }
    window.dispatchEvent(new CustomEvent<MiaPreferences>(CHANGE_EVENT, { detail: next }));
  }
  return next;
}

export function subscribeMiaPreferences(listener: (prefs: MiaPreferences) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<MiaPreferences>).detail;
    listener(detail ?? getMiaPreferences());
  };
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

/** React binding used by Settings and by the speech layer. */
export function useMiaPreferences() {
  const [prefs, setPrefs] = useState<MiaPreferences>(() => getMiaPreferences());
  useEffect(() => {
    setPrefs(getMiaPreferences());
    return subscribeMiaPreferences(setPrefs);
  }, []);
  return {
    ...prefs,
    setVoiceResponses: (voiceResponses: boolean) => setPrefs(setMiaPreferences({ voiceResponses })),
    setSpeechRate: (speechRate: number) => setPrefs(setMiaPreferences({ speechRate })),
  };
}
