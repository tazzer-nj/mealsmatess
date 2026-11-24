import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseAppletConfig from "../../firebase-applet-config.json";

const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim();
const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
const envStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim();
const envMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim();
const envAppId = import.meta.env.VITE_FIREBASE_APP_ID?.trim();
const envMeasurementId = import.meta.env.FIREBASE_MEASUREMENT_ID?.trim();
const envDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID?.trim();

const deployEnv = (
  (import.meta.env as Record<string, string | undefined>)["VITE_VERCEL_ENV"] ?? ""
).trim();
const hostname = typeof window !== "undefined" ? window.location.hostname : "";
const isHostedVercel =
  deployEnv === "production" ||
  deployEnv === "preview" ||
  deployEnv === "vercel" ||
  /(^|\.)mealsmates\.site$|vercel\.app$/i.test(hostname);
const isProductionDeploy = deployEnv === "production" || /(^|\.)mealsmates\.site$/i.test(hostname);
const previewProjectId = firebaseAppletConfig.projectId?.trim() || "";
const previewDatabaseId = firebaseAppletConfig.firestoreDatabaseId?.trim() || "";
const targetingDifferentProject = Boolean(
  envProjectId && previewProjectId && envProjectId !== previewProjectId,
);
const allowPreviewFallback = !isHostedVercel && !targetingDifferentProject;

const missingClientVars: string[] = [];
if (!allowPreviewFallback) {
  if (!envApiKey) missingClientVars.push("VITE_FIREBASE_API_KEY");
  if (!envAuthDomain) missingClientVars.push("VITE_FIREBASE_AUTH_DOMAIN");
  if (!envProjectId) missingClientVars.push("VITE_FIREBASE_PROJECT_ID");
  if (!envAppId) missingClientVars.push("VITE_FIREBASE_APP_ID");
  if (!envDatabaseId) missingClientVars.push("VITE_FIREBASE_FIRESTORE_DATABASE_ID");
}

let resolvedConfigError: string | null = null;
if (missingClientVars.length > 0) {
  resolvedConfigError = `Missing Firebase client configuration (${missingClientVars.join(", ")}). Refusing to fall back to the AI Studio preview database.`;
} else if (isProductionDeploy && previewDatabaseId && envDatabaseId === previewDatabaseId) {
  resolvedConfigError =
    'Production Firestore cannot use the AI Studio preview database. Update VITE_FIREBASE_FIRESTORE_DATABASE_ID to your production database ID (for example "(default)").';
}

export const firebaseConfigError: string | null = resolvedConfigError;
if (firebaseConfigError && !import.meta.env.VITEST) {
  console.error("[MealMate Firebase Config]", firebaseConfigError);
}

const firebaseConfig = {
  apiKey: envApiKey || (allowPreviewFallback ? firebaseAppletConfig.apiKey : "missing-api-key"),
  authDomain:
    envAuthDomain ||
    (allowPreviewFallback
      ? firebaseAppletConfig.authDomain
      : "missing-auth-domain.firebaseapp.com"),
  projectId:
    envProjectId || (allowPreviewFallback ? firebaseAppletConfig.projectId : "missing-project-id"),
  storageBucket:
    envStorageBucket ||
    (allowPreviewFallback
      ? firebaseAppletConfig.storageBucket
      : envProjectId
        ? `${envProjectId}.appspot.com`
        : "missing-storage-bucket"),
  messagingSenderId:
    envMessagingSenderId ||
    (allowPreviewFallback ? firebaseAppletConfig.messagingSenderId : "000000000000"),
  appId:
    envAppId || (allowPreviewFallback ? firebaseAppletConfig.appId : "1:000000000000:web:missing"),
  ...(envMeasurementId || (allowPreviewFallback ? firebaseAppletConfig.measurementId : "")
    ? {
        measurementId:
          envMeasurementId || (allowPreviewFallback ? firebaseAppletConfig.measurementId : ""),
      }
    : {}),
} as {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

const configuredDatabaseId = firebaseConfigError
  ? "(default)"
  : envDatabaseId || (allowPreviewFallback ? previewDatabaseId : "") || "(default)";

export function getFirebaseClientConfigStatus() {
  return {
    configured: !firebaseConfigError,
    projectId: firebaseConfig.projectId,
    databaseId: configuredDatabaseId,
    usingPreviewFallback:
      allowPreviewFallback && (!envDatabaseId || configuredDatabaseId === previewDatabaseId),
    error: firebaseConfigError,
  };
}

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const analytics =
  import.meta.env.SSR || !firebaseConfig.measurementId
    ? Promise.resolve(null)
    : import("firebase/analytics").then(async ({ getAnalytics, isSupported }) =>
        (await isSupported()) ? getAnalytics(app) : null,
      );
export const db =
  configuredDatabaseId && configuredDatabaseId !== "(default)"
    ? getFirestore(app, configuredDatabaseId)
    : getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

let authStateReady: Promise<void> | null = null;

export async function waitForFirebaseAuth() {
  if (!authStateReady) {
    authStateReady = new Promise<void>((resolve) => {
      const timer = globalThis.setTimeout(() => {
        unsubscribe();
        resolve();
      }, 3000);
      const unsubscribe = onAuthStateChanged(auth, () => {
        globalThis.clearTimeout(timer);
        unsubscribe();
        resolve();
      });
    });
  }
  await authStateReady;
  return auth.currentUser;
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection() {
  if (firebaseConfigError) {
    console.error("[MealMate Firebase Config]", firebaseConfigError);
    return;
  }
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

if (typeof window !== "undefined" && !import.meta.env.SSR && !import.meta.env.VITEST) {
  void testFirestoreConnection();
}

function assertFirebaseConfigured() {
  if (firebaseConfigError) {
    throw new Error(firebaseConfigError);
  }
}

export async function signInWithGoogle() {
  assertFirebaseConfigured();
  return signInWithPopup(auth, googleProvider);
}

export async function signInWithEmail(email: string, pass: string) {
  assertFirebaseConfigured();
  return signInWithEmailAndPassword(auth, email, pass);
}

export async function signUpWithEmail(email: string, pass: string, displayName?: string) {
  assertFirebaseConfigured();
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && cred.user) {
    await updateProfile(cred.user, { displayName });
  }
  return cred;
}

export async function sendPasswordReset(email: string, continueUrl?: string) {
  assertFirebaseConfigured();
  return sendPasswordResetEmail(
    auth,
    email,
    continueUrl ? { url: continueUrl, handleCodeInApp: false } : undefined,
  );
}

export async function signOutUser() {
  return firebaseSignOut(auth);
}

export { getRedirectResult, onAuthStateChanged, type User };
