import { a as TSS_SERVER_FUNCTION } from "./createServerFn-CGza3fA8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/createServerRpc-CQjkxm3C.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
export { createServerRpc as t };
