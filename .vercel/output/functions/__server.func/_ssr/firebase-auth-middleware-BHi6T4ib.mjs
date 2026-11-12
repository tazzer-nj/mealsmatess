import { f as getRequest } from "./createServerFn-CGza3fA8.mjs";
import { t as createMiddleware } from "./createMiddleware-B_4t7rW1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/firebase-auth-middleware-BHi6T4ib.js
var loadFirebaseAdmin = () => import("./firebase-admin-ChN7VIWw.mjs").then((n) => n.n).then((n) => n.n);
var requireFirebaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const authorization = getRequest()?.headers.get("authorization") ?? "";
	const match = /^Bearer\s+(.+)$/i.exec(authorization);
	if (!match?.[1]) throw new Response("Unauthorized", { status: 401 });
	const backend = await loadFirebaseAdmin();
	let verified;
	try {
		verified = await backend.verifyFirebaseIdToken(match[1]);
	} catch {
		throw new Response("Unauthorized", { status: 401 });
	}
	if (!verified.uid) throw new Response("Unauthorized", { status: 401 });
	return next({ context: {
		firebase: backend.firebaseUserDb(verified.uid),
		userId: verified.uid,
		claims: verified
	} });
});
//#endregion
export { requireFirebaseAuth as n, loadFirebaseAdmin as t };
