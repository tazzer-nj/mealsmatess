import { i as __require, t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/@google-cloud/storage/node_modules/@google-cloud/projectify/build/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MissingProjectIdError = void 0;
	exports.replaceProjectIdToken = replaceProjectIdToken;
	var stream_1 = __require("stream");
	/**
	* Populate the `{{projectId}}` placeholder.
	*
	* @throws {Error} If a projectId is required, but one is not provided.
	*
	* @param {*} - Any input value that may contain a placeholder. Arrays and objects will be looped.
	* @param {string} projectId - A projectId. If not provided
	* @return {*} - The original argument with all placeholders populated.
	*/
	function replaceProjectIdToken(value, projectId) {
		if (Array.isArray(value)) value = value.map((v) => replaceProjectIdToken(v, projectId));
		if (value !== null && typeof value === "object" && !(value instanceof Buffer) && !(value instanceof stream_1.Stream) && typeof value.hasOwnProperty === "function") {
			for (const opt in value) if (value.hasOwnProperty(opt)) value[opt] = replaceProjectIdToken(value[opt], projectId);
		}
		if (typeof value === "string" && value.indexOf("{{projectId}}") > -1) {
			if (!projectId || projectId === "{{projectId}}") throw new MissingProjectIdError();
			value = value.replace(/{{projectId}}/g, projectId);
		}
		return value;
	}
	/**
	* Custom error type for missing project ID errors.
	*/
	var MissingProjectIdError = class extends Error {
		message = `Sorry, we cannot connect to Cloud Services without a project
    ID. You may specify one with an environment variable named
    "GOOGLE_CLOUD_PROJECT".`.replace(/ +/g, " ");
	};
	exports.MissingProjectIdError = MissingProjectIdError;
}));
//#endregion
export { require_src as t };
