const KEY = "mealmate.mia.muted";

/** The mute switch lives only in Settings; every Mia voice entry point honours it. */
export function isMiaMuted(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setMiaMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(KEY, muted ? "1" : "0");
  } catch {
    /* optional */
  }
  window.dispatchEvent(new CustomEvent("mealmate:mia-mute", { detail: muted }));
}
