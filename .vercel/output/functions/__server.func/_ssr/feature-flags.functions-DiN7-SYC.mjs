import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth, t as loadFirebaseAdmin } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { a as objectType, i as numberType, n as booleanType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-CQjkxm3C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/feature-flags.functions-DiN7-SYC.js
async function assertAdmin(userId) {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data } = await firebaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
	if (!data) throw new Error("Forbidden");
}
var listFeatureFlags_createServerFn_handler = createServerRpc({
	id: "5342c3c78dccf5ce47dc7527dc55b7aee8eb27daed4301636ac1f90bc6348239",
	name: "listFeatureFlags",
	filename: "src/lib/feature-flags.functions.ts"
}, (opts) => listFeatureFlags.__executeServer(opts));
var listFeatureFlags = createServerFn({ method: "GET" }).handler(listFeatureFlags_createServerFn_handler, async () => {
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { data, error } = await firebaseAdmin.from("feature_flags").select("key, enabled, description, rollout_percent").order("key");
	if (error) throw new Error(error.message);
	return data ?? [];
});
var adminUpsertFeatureFlag_createServerFn_handler = createServerRpc({
	id: "ea2016834288da52c25cc78e2d8677084da956f54ffacf9788b7e23c82f6412c",
	name: "adminUpsertFeatureFlag",
	filename: "src/lib/feature-flags.functions.ts"
}, (opts) => adminUpsertFeatureFlag.__executeServer(opts));
var adminUpsertFeatureFlag = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({
	key: stringType().min(1).max(80),
	enabled: booleanType(),
	description: stringType().max(500).optional(),
	rollout_percent: numberType().int().min(0).max(100).default(100)
}).parse(v)).handler(adminUpsertFeatureFlag_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.userId);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { error } = await firebaseAdmin.from("feature_flags").upsert({
		key: data.key,
		enabled: data.enabled,
		description: data.description ?? null,
		rollout_percent: data.rollout_percent,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "key" });
	if (error) throw new Error(error.message);
	return { ok: true };
});
var adminDeleteFeatureFlag_createServerFn_handler = createServerRpc({
	id: "7e0adb4fefb6de59af0208c1a14a828ff34792e60fc6e277b1d4e8c212560fca",
	name: "adminDeleteFeatureFlag",
	filename: "src/lib/feature-flags.functions.ts"
}, (opts) => adminDeleteFeatureFlag.__executeServer(opts));
var adminDeleteFeatureFlag = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ key: stringType().min(1) }).parse(v)).handler(adminDeleteFeatureFlag_createServerFn_handler, async ({ data, context }) => {
	await assertAdmin(context.userId);
	const { firebaseAdmin } = await loadFirebaseAdmin();
	const { error } = await firebaseAdmin.from("feature_flags").delete().eq("key", data.key);
	if (error) throw new Error(error.message);
	return { ok: true };
});
//#endregion
export { adminDeleteFeatureFlag_createServerFn_handler, adminUpsertFeatureFlag_createServerFn_handler, listFeatureFlags_createServerFn_handler };
