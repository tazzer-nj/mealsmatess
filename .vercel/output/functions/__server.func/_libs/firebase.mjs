import { r as __exportAll } from "../_runtime.mjs";
import { c as registerVersion } from "./@firebase/app+[...].mjs";
import "./firebase__auth.mjs";
import "./@firebase/firestore+[...].mjs";
import "./firebase__storage.mjs";
import { i as onMessage, n as getMessagingInWindow, r as isWindowSupported, t as deleteToken } from "./firebase__messaging.mjs";
//#region node_modules/firebase/app/dist/index.mjs
/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
registerVersion("firebase", "13.3.0", "app");
//#endregion
//#region node_modules/firebase/messaging/dist/index.mjs
var dist_exports = /* @__PURE__ */ __exportAll({
	deleteToken: () => deleteToken,
	getMessaging: () => getMessagingInWindow,
	isSupported: () => isWindowSupported,
	onMessage: () => onMessage
});
//#endregion
export { dist_exports as t };
