import { t as firebaseAdmin } from "./firebase-admin-ChN7VIWw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/marketplace.server-D_s5ZHPi.js
/**
* Server-only marketplace logic shared by the MealMate customer app and the
* MealMate Partner Platform. Never import this from client code.
*
* Money, availability and promotion rules are resolved here against the
* database — the frontend never decides what an order costs.
*/
async function isAdmin(userId) {
	const { data } = await firebaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
	return !!data;
}
//#endregion
export { isAdmin };
