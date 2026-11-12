import { t as createMiddleware } from "./createMiddleware-B_4t7rW1.mjs";
import { n as requireFirebaseAuth } from "./firebase-auth-middleware-BHi6T4ib.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/premium-middleware-C-XKyPH0.js
var billing = () => import("./revenuecat-C1ChHDlc.mjs");
var requirePremium = createMiddleware({ type: "function" }).middleware([requireFirebaseAuth]).server(async ({ context, next }) => {
	await (await billing()).requireActivePremium(context.userId);
	return next();
});
//#endregion
export { requirePremium as t };
