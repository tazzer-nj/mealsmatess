import { l as createServerFn } from "./createServerFn-CGza3fA8.mjs";
import { n as requireFirebaseAuth } from "./firebase-auth-middleware-BHi6T4ib.mjs";
import { t as createSsrRpc } from "./createSsrRpc-Bsc_ZfN-.mjs";
import { a as objectType, i as numberType, n as booleanType, s as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/visual.functions-CeXzTgl_.js
var VisualInput = objectType({
	prompt: stringType().min(3).max(600),
	scenes: numberType().int().min(3).max(6).default(4),
	narration: booleanType().default(true)
});
/**
* Premium AI Visual Mode — turns any prompt into an animated, narrated
* visual explanation (scene script + AI illustrations + voice narration).
*/
var generateVisualExplanation = createServerFn({ method: "POST" }).middleware([requireFirebaseAuth]).validator((v) => VisualInput.parse(v)).handler(createSsrRpc("10efa679dca1e1bca48216ea3d9924dafb2f865f3fa643397fcfa7394c96acb5"));
//#endregion
export { generateVisualExplanation };
