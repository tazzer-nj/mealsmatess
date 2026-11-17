import { useSyncExternalStore } from "react";
import { auth, onAuthStateChanged, signOutUser, type User as FirebaseUser } from "@/lib/firebase";

const INACTIVITY_LIMIT_MS = 40 * 24 * 60 * 60 * 1000;
const ACTIVITY_KEY_PREFIX = "mealmate:last-activity:";

export interface SessionUser {
  id: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  emailVerified?: boolean;
  provider: "firebase";
}

function activityKey(userId: string) {
  return `${ACTIVITY_KEY_PREFIX}${userId}`;
}

function readLastActivity(userId: string): number | null {
  try {
    const value = window.localStorage.getItem(activityKey(userId));
    const timestamp = value ? Number(value) : NaN;
    return Number.isFinite(timestamp) ? timestamp : null;
  } catch {
    return null;
  }
}

function writeActivity(userId: string) {
  try {
    window.localStorage.setItem(activityKey(userId), String(Date.now()));
  } catch {
    // Session persistence still works when storage is unavailable.
  }
}

type SessionSnapshot = {
  session: FirebaseUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  user: SessionUser | null;
};

function toSessionUser(fbUser: FirebaseUser | null): SessionUser | null {
  if (!fbUser) return null;
  const verifiedAt = fbUser.emailVerified ? new Date().toISOString() : null;
  return {
    id: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
    photoURL: fbUser.photoURL,
    emailVerified: fbUser.emailVerified,
    email_confirmed_at: verifiedAt,
    confirmed_at: verifiedAt,
    provider: "firebase",
  };
}

let initialized = false;
let currentUserId: string | null = null;
let lastWritten = 0;
const listeners = new Set<() => void>();

let snapshot: SessionSnapshot = {
  session: auth.currentUser,
  firebaseUser: auth.currentUser,
  loading: !auth.currentUser,
  user: toSessionUser(auth.currentUser),
};

const SERVER_SNAPSHOT: SessionSnapshot = {
  session: null,
  firebaseUser: null,
  loading: true,
  user: null,
};

function emit() {
  for (const listener of listeners) listener();
}

function recordActivity() {
  if (!currentUserId || Date.now() - lastWritten < 60_000) return;
  lastWritten = Date.now();
  writeActivity(currentUserId);
}

function ensureAuthStoreInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      const lastActivity = readLastActivity(fbUser.uid);
      if (lastActivity && Date.now() - lastActivity > INACTIVITY_LIMIT_MS) {
        void signOutUser();
        currentUserId = null;
        snapshot = { session: null, firebaseUser: null, loading: false, user: null };
        emit();
        return;
      }
      currentUserId = fbUser.uid;
      writeActivity(fbUser.uid);
      lastWritten = Date.now();
    } else {
      currentUserId = null;
    }

    snapshot = {
      session: fbUser,
      firebaseUser: fbUser,
      loading: false,
      user: toSessionUser(fbUser),
    };
    emit();
  });

  window.addEventListener("pointerdown", recordActivity, { passive: true });
  window.addEventListener("keydown", recordActivity, { passive: true });
  window.addEventListener("visibilitychange", recordActivity);
}

function subscribe(listener: () => void) {
  ensureAuthStoreInitialized();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  ensureAuthStoreInitialized();
  return snapshot;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function useSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export async function signOutUnified() {
  await signOutUser();
}
