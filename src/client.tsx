import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", () => {
    try {
      const key = "mealmate-preload-reload";
      if (!window.sessionStorage.getItem(key)) {
        window.sessionStorage.setItem(key, "1");
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  });
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
});
