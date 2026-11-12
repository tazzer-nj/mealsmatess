import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as onAuthStateChanged } from "../_libs/firebase__auth.mjs";
import { d as signOutUser, i as auth } from "./hub-surface-DqCmg7ui.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-session-DD4jPZEV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var INACTIVITY_LIMIT_MS = 3456e6;
var ACTIVITY_KEY_PREFIX = "mealmate:last-activity:";
function activityKey(userId) {
	return `${ACTIVITY_KEY_PREFIX}${userId}`;
}
function readLastActivity(userId) {
	try {
		const value = window.localStorage.getItem(activityKey(userId));
		const timestamp = value ? Number(value) : NaN;
		return Number.isFinite(timestamp) ? timestamp : null;
	} catch {
		return null;
	}
}
function writeActivity(userId) {
	try {
		window.localStorage.setItem(activityKey(userId), String(Date.now()));
	} catch {}
}
function useSession() {
	const [firebaseUser, setFirebaseUser] = (0, import_react.useState)(auth.currentUser);
	const [fbLoading, setFbLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let active = true;
		let currentUserId = null;
		let lastWritten = 0;
		const recordActivity = () => {
			if (!currentUserId || Date.now() - lastWritten < 6e4) return;
			lastWritten = Date.now();
			writeActivity(currentUserId);
		};
		const unsubscribeFb = onAuthStateChanged(auth, (fbUser) => {
			if (!active) return;
			setFirebaseUser(fbUser);
			setFbLoading(false);
			if (fbUser) {
				currentUserId = fbUser.uid;
				writeActivity(fbUser.uid);
				lastWritten = Date.now();
			}
		});
		const checkInactivity = async (fbUser) => {
			const lastActivity = readLastActivity(fbUser.uid);
			if (lastActivity && Date.now() - lastActivity > INACTIVITY_LIMIT_MS) {
				await signOutUser();
				return false;
			}
			currentUserId = fbUser.uid;
			writeActivity(fbUser.uid);
			lastWritten = Date.now();
			return true;
		};
		const unsubscribeActivity = onAuthStateChanged(auth, (fbUser) => {
			if (!fbUser) return;
			checkInactivity(fbUser);
		});
		window.addEventListener("pointerdown", recordActivity, { passive: true });
		window.addEventListener("keydown", recordActivity, { passive: true });
		window.addEventListener("visibilitychange", recordActivity);
		return () => {
			active = false;
			unsubscribeFb();
			unsubscribeActivity();
			window.removeEventListener("pointerdown", recordActivity);
			window.removeEventListener("keydown", recordActivity);
			window.removeEventListener("visibilitychange", recordActivity);
		};
	}, []);
	const loading = fbLoading;
	let user = null;
	if (firebaseUser) user = {
		id: firebaseUser.uid,
		email: firebaseUser.email,
		displayName: firebaseUser.displayName,
		photoURL: firebaseUser.photoURL,
		emailVerified: firebaseUser.emailVerified,
		email_confirmed_at: firebaseUser.emailVerified ? (/* @__PURE__ */ new Date()).toISOString() : null,
		confirmed_at: firebaseUser.emailVerified ? (/* @__PURE__ */ new Date()).toISOString() : null,
		provider: "firebase"
	};
	return {
		session: firebaseUser,
		firebaseUser,
		loading,
		user
	};
}
async function signOutUnified() {
	await signOutUser();
}
//#endregion
export { useSession as n, signOutUnified as t };
