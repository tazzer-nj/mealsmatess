export type AuthErrorContext = "google" | "signin" | "signup" | "reset";

export function getFirebaseErrorCode(error: unknown): string | undefined {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  const msg = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const match = /\((auth\/[a-z0-9-]+)\)/i.exec(msg) ?? /(auth\/[a-z0-9-]+)/i.exec(msg);
  return match?.[1]?.toLowerCase();
}

export function extractAuthErrorMessage(err: unknown, fallback: string): string {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object" && typeof (err as { message?: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return fallback;
}

export function getAuthErrorMessage(error: unknown, context: AuthErrorContext): string {
  const code = getFirebaseErrorCode(error);

  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return "";
  }

  if (code === "auth/popup-blocked") {
    return "Your browser blocked the Google sign-in pop-up. Allow pop-ups for this site and try again.";
  }

  if (code === "auth/operation-not-allowed" || code === "auth/admin-restricted-operation") {
    if (context === "google") {
      return "Google sign-in is not enabled in Firebase Authentication yet. Enable Google under Firebase Console → Authentication → Sign-in method.";
    }
    return "Email/password sign-in is not enabled for this Firebase project yet. Use Continue with Google, or enable Email/Password in Firebase Console → Authentication → Sign-in method.";
  }

  if (code === "auth/unauthorized-domain") {
    return "This domain isn't authorized for Firebase Authentication yet. Add it in Firebase Console → Authentication → Settings → Authorized domains.";
  }

  if (code === "auth/api-key-not-valid" || code === "auth/invalid-api-key") {
    return "Firebase authentication is misconfigured (invalid API key). Please check your Firebase configuration.";
  }

  if (code === "auth/user-disabled") {
    return "This account has been disabled.";
  }

  if (code === "auth/invalid-email") {
    return "Enter a valid email address.";
  }

  if (code === "auth/weak-password") {
    return "That password is too weak. Choose a stronger password (at least 6 characters).";
  }

  if (code === "auth/email-already-in-use") {
    return "An account with this email already exists. Sign in instead.";
  }

  if (
    code === "auth/user-not-found" ||
    code === "auth/wrong-password" ||
    code === "auth/invalid-credential" ||
    code === "auth/invalid-login-credentials"
  ) {
    return context === "reset"
      ? "No account found with that email address."
      : "Invalid email or password.";
  }

  if (code === "auth/too-many-requests") {
    return "Too many attempts. Please wait a minute and try again.";
  }

  if (code === "auth/network-request-failed") {
    return "Network error while contacting authentication. Check your connection and try again.";
  }

  if (code === "auth/internal-error") {
    return context === "google"
      ? "Google sign-in is currently unavailable in this browser session. Please try again or continue with your email."
      : "Authentication service error. Please try again.";
  }

  const message = extractAuthErrorMessage(error, "").toLowerCase();
  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid email or password")
  ) {
    return "Invalid email or password.";
  }
  if (message.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }
  if (message.includes("already registered") || message.includes("already exists")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (message.includes("pwned") || message.includes("weak")) {
    return "That password is too weak. Choose a stronger password.";
  }
  if (message.includes("rate limit") || message.includes("too-many-requests")) {
    return "Too many attempts. Please wait a minute and try again.";
  }

  if (context === "google") {
    return "Google sign-in could not be completed right now. Please try again.";
  }
  if (context === "reset") {
    return "Could not send the reset email. Please verify your email address and try again.";
  }
  return "Unable to sign in right now. Please check your details and try again.";
}
