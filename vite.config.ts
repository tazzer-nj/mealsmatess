import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { VitePWA } from "vite-plugin-pwa";

function resolveFirebaseAuthDomain() {
  const fromEnv = process.env["VITE_FIREBASE_AUTH_DOMAIN"]?.trim();
  if (fromEnv) return fromEnv;
  if (process.env["VERCEL_ENV"] !== "production") {
    try {
      const raw = fs.readFileSync(
        path.resolve(process.cwd(), "firebase-applet-config.json"),
        "utf8",
      );
      const parsed = JSON.parse(raw) as { authDomain?: string };
      if (parsed.authDomain?.trim()) return parsed.authDomain.trim();
    } catch {
      // Fall back to default domain if config file is unavailable.
    }
  }
  return "mealmate-d2e53.firebaseapp.com";
}

export default defineConfig(({ command }) => ({
  define: {
    "import.meta.env.VITE_VERCEL_ENV": JSON.stringify(
      process.env["VERCEL_ENV"]?.trim() || (process.env["VERCEL"] === "1" ? "vercel" : ""),
    ),
  },
  // Expose only explicitly allowlisted public Firebase Web App settings.
  envPrefix: [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_APP_ID",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_FIRESTORE_DATABASE_ID",
    "VITE_FIREBASE_VAPID_KEY",
    "FIREBASE_MEASUREMENT_ID",
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
    warmup: {
      clientFiles: ["./src/client.tsx", "./src/router.tsx", "./src/routes/__root.tsx"],
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/react-router",
      "firebase/app",
      "firebase/auth",
      "firebase/firestore",
      "firebase/storage",
      "firebase/analytics",
      "firebase/messaging",
      "@whop/elements",
      "@whop/elements-react",
      "@revenuecat/purchases-js",
      "@revenuecat/purchases-capacitor",
      "@capacitor/core",
      "@capacitor/app",
      "@capacitor-community/text-to-speech",
      "lucide-react",
      "sonner",
      "recharts",
      "react-markdown",
      "vosk-browser",
      "zod",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
      "date-fns",
      "i18next",
      "react-i18next",
      "vaul",
      "cmdk",
      "input-otp",
      "react-day-picker",
      "embla-carousel-react",
      "react-hook-form",
      "react-resizable-panels",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-tooltip",
    ],
    exclude: [
      "@whop/sdk",
      "firebase-admin",
      "@google-cloud/firestore",
      "@vercel/blob",
      "@upstash/redis",
      "@upstash/ratelimit",
      "ai",
    ],
  },
  css: { transformer: "lightningcss" },
  resolve: {
    tsconfigPaths: true,
    alias: { "@": `${process.cwd()}/src` },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  ssr: {
    // Firestore relies on module-relative __dirname, so keep it out of the ESM server bundle.
    external: ["firebase-admin", "@google-cloud/firestore"],
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      client: { entry: "client" },
      // src/server.ts wraps the TanStack Start server entry with SSR error handling.
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png", "icon.svg"],
      manifest: {
        id: "/",
        name: "MealMate: Discover. Plan. Eat. Enjoy.",
        short_name: "MealMate",
        description:
          "Your personal food companion for recipes, meal planning, pantry management, and AI cooking.",
        theme_color: "#080808",
        background_color: "#080808",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      outDir: process.env["NITRO_PRESET"] === "vercel" ? ".vercel/output/static" : ".output/public",
      workbox: {
        navigateFallback: null,
        globDirectory:
          process.env["NITRO_PRESET"] === "vercel" ? ".vercel/output/static" : ".output/public",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        globIgnores: [
          "**/node_modules/**/*",
          "sw.js",
          "workbox-*.js",
          "mia/**",
          "assets/aistudio/**",
          "assets/vosk-*.js",
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/(api|_serverFn|__\/auth)\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
    ...(command === "build"
      ? [
          nitro({
            preset: process.env["NITRO_PRESET"] || "node-server",
            // Serve Firebase's helpers on the app origin before enabling a
            // custom authDomain; redirects cannot replace this transparent proxy.
            routeRules: {
              "/__/auth/**": {
                proxy: `https://${resolveFirebaseAuthDomain()}/__/auth/**`,
                headers: { "cache-control": "no-store" },
              },
            },
            vercel: {
              functions: { maxDuration: 60 },
              functionRules: {
                "/api/**": { maxDuration: 60 },
                "/_serverFn/**": { maxDuration: 60 },
              },
            },
            // Keep Firestore's CommonJS runtime and module-relative assets intact.
            // Bundle Firebase Auth so jwks-rsa's ESM dependency works on Vercel.
            traceDeps: ["@google-cloud/firestore*"],
          }),
        ]
      : []),
    viteReact(),
  ],
}));
