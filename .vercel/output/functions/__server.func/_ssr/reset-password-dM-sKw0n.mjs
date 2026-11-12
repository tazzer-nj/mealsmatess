import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { at as KeyRound, nt as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import "../_libs/firebase.mjs";
import { h as verifyPasswordResetCode, n as confirmPasswordReset } from "../_libs/firebase__auth.mjs";
import { i as auth } from "./hub-surface-DqCmg7ui.mjs";
import { t as Input } from "./input-BP4vcGW2.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-dM-sKw0n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPasswordPage() {
	const navigate = useNavigate();
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [oobCode, setOobCode] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const code = new URLSearchParams(window.location.search).get("oobCode");
		if (!code) return;
		verifyPasswordResetCode(auth, code).then(() => {
			setOobCode(code);
			setReady(true);
		}).catch(() => toast.error("This password reset link is invalid or has expired."));
	}, []);
	async function handleSubmit(e) {
		e.preventDefault();
		if (busy) return;
		if (password.length < 8) {
			toast.error("Password must be at least 8 characters.");
			return;
		}
		if (password !== confirm) {
			toast.error("Passwords don't match.");
			return;
		}
		setBusy(true);
		try {
			await confirmPasswordReset(auth, oobCode, password);
			toast.success("Password updated. Sign in with your new password.");
			navigate({
				to: "/auth",
				replace: true
			});
		} catch {
			toast.error("Could not update your password. Please request a new reset link and try again.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex flex-1 items-center justify-center px-4 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 font-display text-3xl",
						children: "Set a new password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: ready ? "Choose a strong password of at least 8 characters." : "Waiting for your reset link… open this page from the email link."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "mt-6 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "password",
							children: "New password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "password",
							type: "password",
							required: true,
							minLength: 8,
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: "••••••••",
							disabled: !ready
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "confirm",
							children: "Confirm password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "confirm",
							type: "password",
							required: true,
							minLength: 8,
							value: confirm,
							onChange: (e) => setConfirm(e.target.value),
							placeholder: "••••••••",
							disabled: !ready
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: busy || !ready,
						children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : "Update password"
					})
				]
			})]
		})
	});
}
//#endregion
export { ResetPasswordPage as component };
