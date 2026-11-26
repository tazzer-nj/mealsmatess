import { useSyncExternalStore } from "react";
import { auth, onAuthStateChanged, signOutUser, type User as FirebaseUser } from "@/lib/firebase";
import {
  PROFILE_UPDATED_EVENT,
  fetchFirestoreProfileOverride,
  readProfileOverride,
  type ProfileOverride,
} from "@/lib/profile-avatar";

const INACTIVITY_LIMIT_MS = 40 * 24 * 60 * 60 * 1000;
const ACTIVITY_KEY_PREFIX = "mealmate:last-activity:";
export const SESSION_REFRESHED_EVENT = "mealmate:session-refreshed";

export interface SessionUser {
  id: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  emailVerified?: boolean;
  provider: "firebase" | "whop";
  whopUserId?: string;
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
  session: FirebaseUser | SessionUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  user: SessionUser | null;
};

function toSessionUser(
  fbUser: FirebaseUser | null,
  override?: ProfileOverride | null,
): SessionUser | null {
  if (!fbUser) return null;
  const cachedOverride = override ?? readProfileOverride(fbUser.uid);
  const verifiedAt = fbUser.emailVerified ? new Date().toISOString() : null;
  const resolvedDisplayName =
    cachedOverride && "displayName" in cachedOverride
      ? cachedOverride.displayName
      : fbUser.displayName;
  const resolvedPhotoURL =
    cachedOverride && "photoURL" in cachedOverride
      ? cachedOverride.photoURL || null
      : fbUser.photoURL;
  return {
    id: fbUser.uid,
    email: fbUser.email,
    displayName: resolvedDisplayName,
    photoURL: resolvedPhotoURL,
    emailVerified: fbUser.emailVerified,
    email_confirmed_at: verifiedAt,
    confirmed_at: verifiedAt,
    provider: "firebase",
  };
}

let initialized = false;
let currentUserId: string | null = null;
let lastWritten = 0;
let firebaseResolved = false;
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

function isTestRuntime(): boolean {
  return (
    (typeof process !== "undefined" && Boolean(process.env["VITEST"])) ||
    (import.meta as { env?: { MODE?: string } }).env?.MODE === "test"
  );
}

function updateSnapshot(override?: ProfileOverride | null) {
  const fbUser = auth.currentUser;
  const activeUser = toSessionUser(fbUser, override);
  if (activeUser) {
    currentUserId = activeUser.id;
    writeActivity(activeUser.id);
    lastWritten = Date.now();
  } else {
    currentUserId = null;
  }

  const stillLoading = !activeUser && !firebaseResolved;
  snapshot = {
    session: fbUser,
    firebaseUser: fbUser,
    loading: stillLoading,
    user: activeUser,
  };
  emit();
}

function recordActivity() {
  if (!currentUserId || Date.now() - lastWritten < 60_000) return;
  lastWritten = Date.now();
  writeActivity(currentUserId);
}

function ensureAuthStoreInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const fallbackTimer = window.setTimeout(() => {
    firebaseResolved = true;
    updateSnapshot();
  }, 3500);

  onAuthStateChanged(auth, (fbUser) => {
    firebaseResolved = true;
    window.clearTimeout(fallbackTimer);
    if (fbUser) {
      const lastActivity = readLastActivity(fbUser.uid);
      if (lastActivity && Date.now() - lastActivity > INACTIVITY_LIMIT_MS) {
        void signOutUser();
        currentUserId = null;
        snapshot = { session: null, firebaseUser: null, loading: false, user: null };
        emit();
        return;
      }
    }

    updateSnapshot();

    if (fbUser) {
      void fetchFirestoreProfileOverride(fbUser.uid).then((remoteOverride) => {
        if (!remoteOverride || auth.currentUser?.uid !== fbUser.uid) return;
        updateSnapshot(remoteOverride);
      });
    }
  });

  window.addEventListener(PROFILE_UPDATED_EVENT, (event) => {
    const detail = (event as CustomEvent<{ userId?: string; override?: ProfileOverride }>).detail;
    const fbUser = auth.currentUser;
    if (fbUser && (!detail?.userId || detail.userId === fbUser.uid)) {
      updateSnapshot(detail?.override ?? null);
    }
  });

  window.addEventListener(SESSION_REFRESHED_EVENT, () => {
    updateSnapshot();
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

export async function refreshSessionUser() {
  const fbUser = auth.currentUser;
  if (!fbUser) return null;
  await fbUser.reload();
  const refreshed = auth.currentUser ?? fbUser;
  updateSnapshot();
  return refreshed;
}

export async function signOutUnified() {
  await Promise.allSettled([
    signOutUser(),
    typeof window !== "undefined" && !isTestRuntime()
      ? fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        })
      : Promise.resolve(),
  ]);
  updateSnapshot();
}
