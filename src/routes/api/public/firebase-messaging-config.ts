import { createFileRoute } from "@tanstack/react-router";
import firebaseAppletConfig from "../../../../firebase-applet-config.json";

export const Route = createFileRoute("/api/public/firebase-messaging-config")({
  server: {
    handlers: {
      GET: async () => {
        const config = {
          apiKey: process.env["VITE_FIREBASE_API_KEY"]?.trim() || firebaseAppletConfig.apiKey,
          authDomain:
            process.env["VITE_FIREBASE_AUTH_DOMAIN"]?.trim() || firebaseAppletConfig.authDomain,
          projectId:
            process.env["VITE_FIREBASE_PROJECT_ID"]?.trim() || firebaseAppletConfig.projectId,
          storageBucket:
            process.env["VITE_FIREBASE_STORAGE_BUCKET"]?.trim() ||
            firebaseAppletConfig.storageBucket,
          messagingSenderId:
            process.env["VITE_FIREBASE_MESSAGING_SENDER_ID"]?.trim() ||
            firebaseAppletConfig.messagingSenderId,
          appId: process.env["VITE_FIREBASE_APP_ID"]?.trim() || firebaseAppletConfig.appId,
        };
        if (Object.values(config).some((value) => !value)) {
          return new Response("Firebase messaging configuration is unavailable.", { status: 503 });
        }
        return new Response(`firebase.initializeApp(${JSON.stringify(config)});`, {
          headers: {
            "Content-Type": "application/javascript; charset=utf-8",
            "Cache-Control": "public, max-age=300",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
