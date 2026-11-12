import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bsc_ZfN-.mjs";
import { a as objectType, i as numberType, n as booleanType, s as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/feature-flags.functions-BguzsvVA.js
var listFeatureFlags = createServerFn({ method: "GET" }).handler(createSsrRpc("5342c3c78dccf5ce47dc7527dc55b7aee8eb27daed4301636ac1f90bc6348239"));
var adminUpsertFeatureFlag = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({
	key: stringType().min(1).max(80),
	enabled: booleanType(),
	description: stringType().max(500).optional(),
	rollout_percent: numberType().int().min(0).max(100).default(100)
}).parse(v)).handler(createSsrRpc("ea2016834288da52c25cc78e2d8677084da956f54ffacf9788b7e23c82f6412c"));
var adminDeleteFeatureFlag = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => objectType({ key: stringType().min(1) }).parse(v)).handler(createSsrRpc("7e0adb4fefb6de59af0208c1a14a828ff34792e60fc6e277b1d4e8c212560fca"));
//#endregion
export { adminUpsertFeatureFlag as n, listFeatureFlags as r, adminDeleteFeatureFlag as t };
