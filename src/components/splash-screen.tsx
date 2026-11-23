import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";

const KEY = "mealmate.splash.shown";

/** Instant non-blocking native launch transition; web skips artificial splash delays completely. */
export function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "leave">("hidden");

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      if (sessionStorage.getItem(KEY)) return;
      sessionStorage.setItem(KEY, "1");
    } catch {
      return;
    }
    setPhase("leave");
    const timer = window.setTimeout(() => setPhase("hidden"), 140);
    return () => window.clearTimeout(timer);
  }, []);

  if (phase === "hidden") return null;
  return (
    <div className="splash-screen pointer-events-none" data-leaving="true" aria-hidden>
      <img
        src="/mascots/mascot-classic.png"
        alt=""
        width={96}
        height={96}
        className="splash-logo"
      />
    </div>
  );
}
