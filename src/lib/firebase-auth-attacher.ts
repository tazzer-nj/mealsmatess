import { createMiddleware } from "@tanstack/react-start";
import { auth, waitForFirebaseAuth } from "@/lib/firebase";

export const attachFirebaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const user = auth.currentUser ?? (await waitForFirebaseAuth());
    let token: string | undefined;
    try {
      token = await user?.getIdToken();
    } catch {
      token = undefined;
    }
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  },
);
