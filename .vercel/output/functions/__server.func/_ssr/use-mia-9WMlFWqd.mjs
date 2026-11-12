import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-mia-9WMlFWqd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var MiaContext = (0, import_react.createContext)(null);
function useMia() {
	const value = (0, import_react.useContext)(MiaContext);
	if (!value) throw new Error("useMia requires MiaProvider");
	return value;
}
function useOptionalMia() {
	return (0, import_react.useContext)(MiaContext);
}
//#endregion
export { useMia as n, useOptionalMia as r, MiaContext as t };
