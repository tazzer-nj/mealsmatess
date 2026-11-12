import { t as firebaseAdmin } from "./firebase-admin-ChN7VIWw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/security.server-D83_qD0_.js
/**
* Enforce a per-minute rate limit for a (bucket, identifier) pair.
* Throws Response(429) when the caller is over budget.
* Fails open (allows the request) if the RPC itself errors so a DB blip
* cannot lock users out.
*/
async function enforceRateLimit(bucket, identifier, maxPerMinute) {
	if (!identifier) return;
	const { data, error } = await firebaseAdmin.rpc("check_rate_limit", {
		_bucket: bucket,
		_identifier: identifier,
		_max_per_minute: maxPerMinute
	});
	if (error) {
		console.warn("rate_limit_error", bucket, error.message);
		return;
	}
	if (data === false) throw new Response("Too many requests. Please slow down.", { status: 429 });
}
async function auditLog(entry) {
	const { error } = await firebaseAdmin.from("audit_logs").insert({
		actor_id: entry.actor_id,
		action: entry.action,
		target_table: entry.target_table ?? null,
		target_id: entry.target_id ?? null,
		metadata: entry.metadata ?? {},
		ip_address: entry.ip_address ?? null,
		user_agent: entry.user_agent ?? null
	});
	if (error) console.warn("audit_log_error", entry.action, error.message);
}
/**
* Fire-and-forget telemetry write. Never throws; errors are logged.
* Use `trackEvent` inline, or `withTelemetry` to auto-time a handler.
*/
async function trackEvent(evt) {
	try {
		const { error } = await firebaseAdmin.from("telemetry_events").insert({
			user_id: evt.user_id,
			kind: evt.kind,
			name: evt.name,
			latency_ms: evt.latency_ms ?? null,
			success: evt.success ?? true,
			error: evt.error ?? null,
			metadata: evt.metadata ?? {}
		});
		if (error) console.warn("telemetry_error", evt.name, error.message);
	} catch (e) {
		console.warn("telemetry_exception", evt.name, e);
	}
}
//#endregion
export { enforceRateLimit as n, trackEvent as r, auditLog as t };
