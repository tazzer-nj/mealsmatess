import { a as getApp, o as getApps, s as initializeApp } from "../_libs/@firebase/app+[...].mjs";
import "../_libs/firebase.mjs";
import { d as signInWithPopup, f as signInWithRedirect, i as getAuth, l as sendPasswordResetEmail, m as updateProfile, o as onAuthStateChanged, p as signOut, r as createUserWithEmailAndPassword, t as GoogleAuthProvider, u as signInWithEmailAndPassword } from "../_libs/firebase__auth.mjs";
import { p as getFirestore } from "../_libs/@firebase/firestore+[...].mjs";
import { t as getStorage } from "../_libs/firebase__storage.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hub-surface-DqCmg7ui.js
var requiredFirebaseEnv = {
	apiKey: void 0,
	authDomain: void 0,
	projectId: void 0,
	storageBucket: void 0,
	messagingSenderId: void 0,
	appId: void 0
};
var missingFirebaseEnv = Object.entries(requiredFirebaseEnv).filter(([, value]) => !value).map(([key]) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`);
if (missingFirebaseEnv.length > 0) throw new Error(`Missing Firebase web configuration: ${missingFirebaseEnv.join(", ")}`);
if (requiredFirebaseEnv.projectId !== "mealmate-d2e53") throw new Error(`Firebase project mismatch: expected mealmate-d2e53, received ${requiredFirebaseEnv.projectId}`);
var firebaseConfig = { ...requiredFirebaseEnv };
var app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
Promise.resolve(null);
var db = getFirestore(app, "default");
getStorage(app);
var auth = getAuth(app);
var googleProvider = new GoogleAuthProvider();
var authStateReady = null;
async function waitForFirebaseAuth() {
	if (!authStateReady) authStateReady = new Promise((resolve) => {
		const unsubscribe = onAuthStateChanged(auth, () => {
			unsubscribe();
			resolve();
		});
	});
	await authStateReady;
	return auth.currentUser;
}
var OperationType = /* @__PURE__ */ function(OperationType) {
	OperationType["CREATE"] = "create";
	OperationType["UPDATE"] = "update";
	OperationType["DELETE"] = "delete";
	OperationType["LIST"] = "list";
	OperationType["GET"] = "get";
	OperationType["WRITE"] = "write";
	return OperationType;
}({});
function handleFirestoreError(error, operationType, path) {
	const errInfo = {
		error: error instanceof Error ? error.message : String(error),
		authInfo: {
			userId: auth.currentUser?.uid ?? null,
			email: auth.currentUser?.email ?? null,
			emailVerified: auth.currentUser?.emailVerified ?? null,
			isAnonymous: auth.currentUser?.isAnonymous ?? null,
			tenantId: auth.currentUser?.tenantId ?? null,
			providerInfo: auth.currentUser?.providerData?.map((provider) => ({
				providerId: provider.providerId,
				email: provider.email
			})) || []
		},
		operationType,
		path
	};
	console.error("Firestore Error: ", JSON.stringify(errInfo));
	throw new Error(JSON.stringify(errInfo));
}
async function signInWithGoogle() {
	try {
		return await signInWithPopup(auth, googleProvider);
	} catch (error) {
		if (error.code === "auth/popup-blocked") {
			await signInWithRedirect(auth, googleProvider);
			return null;
		}
		throw error;
	}
}
async function signInWithEmail(email, pass) {
	return signInWithEmailAndPassword(auth, email, pass);
}
async function signUpWithEmail(email, pass, displayName) {
	const cred = await createUserWithEmailAndPassword(auth, email, pass);
	if (displayName && cred.user) await updateProfile(cred.user, { displayName });
	return cred;
}
async function sendPasswordReset(email, continueUrl) {
	return sendPasswordResetEmail(auth, email, continueUrl ? {
		url: continueUrl,
		handleCodeInApp: false
	} : void 0);
}
async function signOutUser() {
	return signOut(auth);
}
/** Host selection changes presentation only; server functions still enforce membership. */
var HUB_HOSTS = ["partner.mealsmates.site", "hub.mealsmates.site"];
var CONSUMER_URL = "https://mealsmates.site";
function isHubHostname(hostname) {
	return HUB_HOSTS.some((host) => host === hostname.toLowerCase().replace(/\.$/, ""));
}
function isHubSurface(hostname, pathname) {
	return isHubHostname(hostname) || pathname === "/hub" || pathname === "/partner" || pathname.startsWith("/partner/");
}
//#endregion
export { db as a, sendPasswordReset as c, signOutUser as d, signUpWithEmail as f, auth as i, signInWithEmail as l, OperationType as n, handleFirestoreError as o, waitForFirebaseAuth as p, app as r, isHubSurface as s, CONSUMER_URL as t, signInWithGoogle as u };
