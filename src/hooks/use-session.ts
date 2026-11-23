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
const SESSION_HINT_KEY = "mealmate.session-hint.v1";
const SESSION_HINT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
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
  whopUserId?: string | null;
}

type WhopSessionUserPayload = {
  id: string;
  whopUserId: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  provider: "whop";
};

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
  session: FirebaseUser | WhopSessionUserPayload | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  user: SessionUser | null;
};

type CachedSessionHint = SessionUser & { cachedAt: number };

function readSessionHint(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_HINT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedSessionHint;
    if (!parsed?.id || !parsed.emailVerified) return null;
    if (Date.now() - Number(parsed.cachedAt || 0) > SESSION_HINT_TTL_MS) {
      window.localStorage.removeItem(SESSION_HINT_KEY);
      return null;
    }
    const { cachedAt: _, ...user } = parsed;
    return user;
  } catch {
    return null;
  }
}

function writeSessionHint(user: SessionUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (!user || !user.emailVerified) {
      window.localStorage.removeItem(SESSION_HINT_KEY);
      return;
    }
    const payload: CachedSessionHint = {
      id: user.id,
      email: user.email,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      emailVerified: Boolean(user.emailVerified),
      email_confirmed_at: user.email_confirmed_at ?? null,
      confirmed_at: user.confirmed_at ?? null,
      provider: user.provider,
      whopUserId: user.whopUserId ?? null,
      cachedAt: Date.now(),
    };
    window.localStorage.setItem(SESSION_HINT_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota errors
  }
}

function clearSessionRelatedCaches(userId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_HINT_KEY);
    if (userId) {
      window.localStorage.removeItem(`mealmate.entitlement-lease.v1:${userId}`);
      window.localStorage.removeItem(`mealmate.flow-progress.v1:${userId}`);
      window.localStorage.removeItem(`mealmate.admin-hint.v1:${userId}`);
    }
  } catch {
    // Ignore storage errors
  }
}

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

function toWhopSessionUser(
  whopUser: WhopSessionUserPayload | null,
  override?: ProfileOverride | null,
): SessionUser | null {
  if (!whopUser) return null;
  const cachedOverride = override ?? readProfileOverride(whopUser.id);
  const verifiedAt = whopUser.emailVerified ? new Date().toISOString() : null;
  const resolvedDisplayName =
    cachedOverride && "displayName" in cachedOverride
      ? cachedOverride.displayName
      : whopUser.displayName;
  const resolvedPhotoURL =
    cachedOverride && "photoURL" in cachedOverride
      ? cachedOverride.photoURL || null
      : whopUser.photoURL;
  return {
    id: whopUser.id,
    whopUserId: whopUser.whopUserId,
    email: whopUser.email,
    displayName: resolvedDisplayName,
    photoURL: resolvedPhotoURL,
    emailVerified: Boolean(whopUser.emailVerified ?? true),
    email_confirmed_at: verifiedAt,
    confirmed_at: verifiedAt,
    provider: "whop",
  };
}

let initialized = false;
let currentUserId: string | null = null;
let lastWritten = 0;
let currentWhopUser: WhopSessionUserPayload | null = null;
let whopSessionChecked = false;
let firebaseAuthResolved = Boolean(auth.currentUser);
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

function publishCombinedSnapshot() {
  const fbUser = auth.currentUser;
  if (fbUser) {
    const user = toSessionUser(fbUser);
    writeSessionHint(user);
    snapshot = {
      session: fbUser,
      firebaseUser: fbUser,
      loading: false,
      user,
    };
    emit();
    return;
  }

  if (currentWhopUser) {
    currentUserId = currentWhopUser.id;
    writeActivity(currentWhopUser.id);
    lastWritten = Date.now();
    const user = toWhopSessionUser(currentWhopUser);
    writeSessionHint(user);
    snapshot = {
      session: currentWhopUser,
      firebaseUser: null,
      loading: false,
      user,
    };
    emit();
    return;
  }

  if (firebaseAuthResolved && whopSessionChecked) {
    writeSessionHint(null);
    snapshot = {
      session: null,
      firebaseUser: null,
      loading: false,
      user: null,
    };
    emit();
    return;
  }

  const hint = readSessionHint();
  if (hint) {
    snapshot = {
      session: null,
      firebaseUser: null,
      loading: false,
      user: hint,
    };
    emit();
    return;
  }

  snapshot = {
    session: null,
    firebaseUser: null,
    loading: !whopSessionChecked || !firebaseAuthResolved,
    user: null,
  };
  emit();
}

async function fetchWhopSession(): Promise<WhopSessionUserPayload | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as { user?: WhopSessionUserPayload | null };
    currentWhopUser = data.user ?? null;
    return currentWhopUser;
  } catch {
    return null;
  } finally {
    whopSessionChecked = true;
  }
}

function ensureAuthStoreInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const hint = readSessionHint();
  if (hint && !auth.currentUser) {
    snapshot = {
      session: null,
      firebaseUser: null,
      loading: false,
      user: hint,
    };
  }

  const fallbackTimer = window.setTimeout(() => {
    whopSessionChecked = true;
    firebaseAuthResolved = true;
    if (!snapshot.loading) return;
    publishCombinedSnapshot();
  }, 1200);

  void fetchWhopSession().then((whopUser) => {
    if (whopUser && !auth.currentUser) {
      window.clearTimeout(fallbackTimer);
      publishCombinedSnapshot();
      void fetchFirestoreProfileOverride(whopUser.id).then((remoteOverride) => {
        if (!remoteOverride || currentWhopUser?.id !== whopUser.id || auth.currentUser) return;
        const user = toWhopSessionUser(whopUser, remoteOverride);
        writeSessionHint(user);
        snapshot = {
          session: whopUser,
          firebaseUser: null,
          loading: false,
          user,
        };
        emit();
      });
    } else if (!snapshot.loading || auth.currentUser === null) {
      publishCombinedSnapshot();
    }
  });

  onAuthStateChanged(auth, (fbUser) => {
    firebaseAuthResolved = true;
    window.clearTimeout(fallbackTimer);
    if (fbUser) {
      const lastActivity = readLastActivity(fbUser.uid);
      if (lastActivity && Date.now() - lastActivity > INACTIVITY_LIMIT_MS) {
        void signOutUser();
        clearSessionRelatedCaches(fbUser.uid);
        currentUserId = null;
        snapshot = { session: null, firebaseUser: null, loading: false, user: null };
        emit();
        return;
      }
      currentUserId = fbUser.uid;
      writeActivity(fbUser.uid);
      lastWritten = Date.now();
    } else if (!currentWhopUser) {
      currentUserId = null;
    }

    publishCombinedSnapshot();

    if (fbUser) {
      void fetchFirestoreProfileOverride(fbUser.uid).then((remoteOverride) => {
        if (!remoteOverride || auth.currentUser?.uid !== fbUser.uid) return;
        const user = toSessionUser(fbUser, remoteOverride);
        writeSessionHint(user);
        snapshot = {
          session: fbUser,
          firebaseUser: fbUser,
          loading: false,
          user,
        };
        emit();
      });
    }
  });

  window.addEventListener(PROFILE_UPDATED_EVENT, (event) => {
    const detail = (event as CustomEvent<{ userId?: string; override?: ProfileOverride }>).detail;
    const fbUser = auth.currentUser;
    if (fbUser) {
      if (detail?.userId && detail.userId !== fbUser.uid) return;
      snapshot = {
        session: fbUser,
        firebaseUser: fbUser,
        loading: false,
        user: toSessionUser(fbUser, detail?.override ?? null),
      };
      emit();
      return;
    }
    if (currentWhopUser) {
      if (detail?.userId && detail.userId !== currentWhopUser.id) return;
      snapshot = {
        session: currentWhopUser,
        firebaseUser: null,
        loading: false,
        user: toWhopSessionUser(currentWhopUser, detail?.override ?? null),
      };
      emit();
    }
  });

  window.addEventListener(SESSION_REFRESHED_EVENT, () => {
    void fetchWhopSession().then(() => {
      publishCombinedSnapshot();
    });
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
  if (fbUser) {
    await fbUser.reload();
    const refreshed = auth.currentUser ?? fbUser;
    snapshot = {
      session: refreshed,
      firebaseUser: refreshed,
      loading: false,
      user: toSessionUser(refreshed),
    };
    emit();
    return refreshed;
  }
  const whopUser = await fetchWhopSession();
  publishCombinedSnapshot();
  return whopUser;
}

export async function signOutUnified() {
  const previousUserId = currentUserId ?? snapshot.user?.id ?? null;
  currentWhopUser = null;
  currentUserId = null;
  clearSessionRelatedCaches(previousUserId);
  await Promise.allSettled([
    signOutUser(),
    typeof window !== "undefined"
      ? fetch("/api/auth/logout", { method: "POST", credentials: "include" })
      : Promise.resolve(),
  ]);
  whopSessionChecked = true;
  firebaseAuthResolved = true;
  snapshot = {
    session: null,
    firebaseUser: null,
    loading: false,
    user: null,
  };
  emit();
}
