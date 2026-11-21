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
  try {
    const raw = fs.readFileSync(path.resolve(process.cwd(), "firebase-applet-config.json"), "utf8");
    const parsed = JSON.parse(raw) as { authDomain?: string };
    if (parsed.authDomain?.trim()) return parsed.authDomain.trim();
  } catch {
    // Fall back to default domain if config file is unavailable.
  }
  return "mealmate-d2e53.firebaseapp.com";
}

export default defineConfig(({ command }) => ({
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
      "lucide-react",
      "sonner",
      "zod",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
      "date-fns",
      "i18next",
      "react-i18next",
    ],
    exclude: [
      "firebase-admin",
      "@google-cloud/firestore",
      "@vercel/blob",
      "@upstash/redis",
      "@upstash/ratelimit",
      "ai",
      "@google/genai",
    ],
  },
  environments: {
    client: {
      build: {
        rollupOptions: {
          output: {
            manualChunks(id: string) {
              if (!id.includes("node_modules")) return undefined;
              if (id.includes("/node_modules/firebase/")) return "vendor-firebase";
              if (id.includes("/node_modules/@revenuecat/")) return "vendor-revenuecat";
              if (id.includes("/node_modules/recharts/") || id.includes("/node_modules/d3-")) {
                return "vendor-charts";
              }
              if (id.includes("/node_modules/vosk-browser/")) return "vendor-voice";
              if (
                id.includes("/node_modules/react-markdown/") ||
                id.includes("/node_modules/remark-") ||
                id.includes("/node_modules/rehype-") ||
                id.includes("/node_modules/unified/")
              ) {
                return "vendor-markdown";
              }
              if (id.includes("/node_modules/@radix-ui/")) return "vendor-radix";
              return undefined;
            },
          },
        },
      },
    },
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
      workbox: {
        navigateFallback: null,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
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
