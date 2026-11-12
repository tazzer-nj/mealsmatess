import { $ as safeParseJSON, $n as $ZodString, $t as _toLowerCase, A as asSchema, An as $ZodIPv6, At as _isoDuration, B as getToolCaller, Bn as $ZodNanoID, Bt as _multipleOf, C as string$1, Cn as $ZodDiscriminatedUnion, Cr as APICallError, Ct as _guid, Dn as $ZodEnum, Dr as getErrorMessage, Dt as _ipv6, E as unknown$1, En as $ZodEmoji, Er as TypeValidationError, Et as _ipv4, F as detectMediaType, Fn as $ZodIntersection, Ft as _lowercase, G as isProviderReference, Gn as $ZodNumber, Gt as _null$1, H as isBuffer, Hn as $ZodNonOptional, Ht as _never, I as executeTool, In as $ZodJWT, It as _lt, J as lazySchema, Jn as $ZodOptional, Jt as _positive, K as isUint8Array, Kn as $ZodNumberFormat, Kt as _number, L as fetchUntrustedUrl, Ln as $ZodKSUID, Lt as _lte, M as convertBase64ToUint8Array, Mn as $ZodISODateTime, Mt as _jwt, N as convertUint8ArrayToBase64, Nn as $ZodISODuration, Nt as _ksuid, O as DownloadError, On as $ZodGUID, Or as isJSONObject, Ot as _isoDate, P as createIdGenerator, Pn as $ZodISOTime, Pt as _length, Q as retryWithExponentialBackoff, Qn as $ZodRecord, Qt as _string, R as filterNullable, Rn as $ZodLazy, Rt as _maxLength, S as refine$1, Sn as $ZodDefault, Sr as AISDKError, St as _gte, T as union$1, Tn as $ZodEmail, Tr as InvalidResponseDataError, Tt as _int, U as isExecutableTool, Un as $ZodNull, Ut as _nonnegative, V as isArrayBuffer, Vn as $ZodNever, Vt as _nanoid, W as isFullMediaType, Wn as $ZodNullable, Wt as _normalize, X as redactTelemetryValue, Xn as $ZodPrefault, Xt as _regex, Y as readResponseWithSizeLimit, Yn as $ZodPipe, Yt as _refine, Z as resolve, Zn as $ZodReadonly, Zt as _startsWith, _ as number$1, _n as $ZodCIDRv6, _r as omit, _t as _e164, an as _url, ar as $ZodUUID, at as parseAsync, b as pipe$1, bn as $ZodCatch, br as required, bt as _endsWith, c as array$1, cn as _uuidv6, cr as $ZodXID, ct as _array, d as discriminatedUnion$1, dn as globalRegistry, dr as clone, dt as _boolean, en as _toUpperCase, er as $ZodStringFormat, et as safeValidateTypes, f as extend$1, fn as $ZodArray, fr as defineLazy, ft as _cidrv4, g as never$1, gn as $ZodCIDRv4, gr as normalizeParams, gt as _custom, h as looseObject, hn as $ZodBoolean, hr as merge, ht as _cuid2, i as gateway, in as _uppercase, ir as $ZodURL, it as parse, j as cancelResponseBody, jn as $ZodISODate, jt as _isoTime, k as asArray, kn as $ZodIPv4, kt as _isoDateTime, l as boolean$1, ln as _uuidv7, lr as $ZodCheck, lt as _base64, m as literal$1, mn as $ZodBase64URL, mr as issue, mt as _cuid, n as GatewayError, nn as _ulid, nr as $ZodType, nt as withUserAgentSuffix, on as _uuid, or as $ZodUnion, ot as safeParse, p as int$1, pn as $ZodBase64, pr as extend, pt as _cidrv6, q as isUrlSupported, qn as $ZodObject, qt as _overwrite, rn as _unknown, rr as $ZodULID, rt as zodSchema, s as _enum$1, sn as _uuidv4, sr as $ZodUnknown, st as safeParseAsync, t as GatewayAuthenticationError, tn as _trim, tr as $ZodTransform, tt as validateTypes, u as custom$1, un as _xid, ur as assignProp, ut as _base64url, v as object$1, vn as $ZodCUID, vr as partial, vt as _email, w as transform$1, wn as $ZodE164, wr as InvalidPromptError, wt as _includes, x as record$1, xn as $ZodCustom, xr as $constructor, xt as _gt, y as optional$1, yn as $ZodCUID2, yr as pick, yt as _emoji, z as getRuntimeEnvironmentUserAgent, zn as $ZodLiteral, zt as _minLength } from "./@ai-sdk/gateway+[...].mjs";
//#region node_modules/ai/dist/rolldown-runtime-D7D4PA-g.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/zod/v4/classic/iso.js
var ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
	$ZodISODateTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function datetime(params) {
	return _isoDateTime(ZodISODateTime, params);
}
var ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
	$ZodISODate.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function date(params) {
	return _isoDate(ZodISODate, params);
}
var ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
	$ZodISOTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function time(params) {
	return _isoTime(ZodISOTime, params);
}
var ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
	$ZodISODuration.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function duration(params) {
	return _isoDuration(ZodISODuration, params);
}
//#endregion
//#region node_modules/zod/v4/classic/schemas.js
var ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
	$ZodType.init(inst, def);
	inst.def = def;
	Object.defineProperty(inst, "_def", { value: def });
	inst.check = (...checks) => {
		return inst.clone({
			...def,
			checks: [...def.checks ?? [], ...checks.map((ch) => typeof ch === "function" ? { _zod: {
				check: ch,
				def: { check: "custom" },
				onattach: []
			} } : ch)]
		});
	};
	inst.clone = (def, params) => clone(inst, def, params);
	inst.brand = () => inst;
	inst.register = ((reg, meta) => {
		reg.add(inst, meta);
		return inst;
	});
	inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
	inst.safeParse = (data, params) => safeParse(inst, data, params);
	inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
	inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
	inst.spa = inst.safeParseAsync;
	inst.refine = (check, params) => inst.check(refine(check, params));
	inst.superRefine = (refinement) => inst.check(superRefine(refinement));
	inst.overwrite = (fn) => inst.check(_overwrite(fn));
	inst.optional = () => optional(inst);
	inst.nullable = () => nullable(inst);
	inst.nullish = () => optional(nullable(inst));
	inst.nonoptional = (params) => nonoptional(inst, params);
	inst.array = () => array(inst);
	inst.or = (arg) => union([inst, arg]);
	inst.and = (arg) => intersection(inst, arg);
	inst.transform = (tx) => pipe(inst, transform(tx));
	inst.default = (def) => _default(inst, def);
	inst.prefault = (def) => prefault(inst, def);
	inst.catch = (params) => _catch(inst, params);
	inst.pipe = (target) => pipe(inst, target);
	inst.readonly = () => readonly(inst);
	inst.describe = (description) => {
		const cl = inst.clone();
		globalRegistry.add(cl, { description });
		return cl;
	};
	Object.defineProperty(inst, "description", {
		get() {
			return globalRegistry.get(inst)?.description;
		},
		configurable: true
	});
	inst.meta = (...args) => {
		if (args.length === 0) return globalRegistry.get(inst);
		const cl = inst.clone();
		globalRegistry.add(cl, args[0]);
		return cl;
	};
	inst.isOptional = () => inst.safeParse(void 0).success;
	inst.isNullable = () => inst.safeParse(null).success;
	return inst;
});
/** @internal */
var _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	ZodType.init(inst, def);
	const bag = inst._zod.bag;
	inst.format = bag.format ?? null;
	inst.minLength = bag.minimum ?? null;
	inst.maxLength = bag.maximum ?? null;
	inst.regex = (...args) => inst.check(_regex(...args));
	inst.includes = (...args) => inst.check(_includes(...args));
	inst.startsWith = (...args) => inst.check(_startsWith(...args));
	inst.endsWith = (...args) => inst.check(_endsWith(...args));
	inst.min = (...args) => inst.check(_minLength(...args));
	inst.max = (...args) => inst.check(_maxLength(...args));
	inst.length = (...args) => inst.check(_length(...args));
	inst.nonempty = (...args) => inst.check(_minLength(1, ...args));
	inst.lowercase = (params) => inst.check(_lowercase(params));
	inst.uppercase = (params) => inst.check(_uppercase(params));
	inst.trim = () => inst.check(_trim());
	inst.normalize = (...args) => inst.check(_normalize(...args));
	inst.toLowerCase = () => inst.check(_toLowerCase());
	inst.toUpperCase = () => inst.check(_toUpperCase());
});
var ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	_ZodString.init(inst, def);
	inst.email = (params) => inst.check(_email(ZodEmail, params));
	inst.url = (params) => inst.check(_url(ZodURL, params));
	inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
	inst.emoji = (params) => inst.check(_emoji(ZodEmoji, params));
	inst.guid = (params) => inst.check(_guid(ZodGUID, params));
	inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
	inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
	inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
	inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
	inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
	inst.guid = (params) => inst.check(_guid(ZodGUID, params));
	inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
	inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
	inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
	inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
	inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
	inst.xid = (params) => inst.check(_xid(ZodXID, params));
	inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
	inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
	inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
	inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
	inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
	inst.e164 = (params) => inst.check(_e164(ZodE164, params));
	inst.datetime = (params) => inst.check(datetime(params));
	inst.date = (params) => inst.check(date(params));
	inst.time = (params) => inst.check(time(params));
	inst.duration = (params) => inst.check(duration(params));
});
function string(params) {
	return _string(ZodString, params);
}
var ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	_ZodString.init(inst, def);
});
var ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
	$ZodEmail.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
	$ZodGUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
	$ZodUUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
	$ZodURL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
	$ZodEmoji.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
	$ZodNanoID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
	$ZodCUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
	$ZodCUID2.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
	$ZodULID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
	$ZodXID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
	$ZodKSUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
	$ZodIPv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
	$ZodIPv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
	$ZodCIDRv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
	$ZodCIDRv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
	$ZodBase64.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
	$ZodBase64URL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
	$ZodE164.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
	$ZodJWT.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
	$ZodNumber.init(inst, def);
	ZodType.init(inst, def);
	inst.gt = (value, params) => inst.check(_gt(value, params));
	inst.gte = (value, params) => inst.check(_gte(value, params));
	inst.min = (value, params) => inst.check(_gte(value, params));
	inst.lt = (value, params) => inst.check(_lt(value, params));
	inst.lte = (value, params) => inst.check(_lte(value, params));
	inst.max = (value, params) => inst.check(_lte(value, params));
	inst.int = (params) => inst.check(int(params));
	inst.safe = (params) => inst.check(int(params));
	inst.positive = (params) => inst.check(_gt(0, params));
	inst.nonnegative = (params) => inst.check(_gte(0, params));
	inst.negative = (params) => inst.check(_lt(0, params));
	inst.nonpositive = (params) => inst.check(_lte(0, params));
	inst.multipleOf = (value, params) => inst.check(_multipleOf(value, params));
	inst.step = (value, params) => inst.check(_multipleOf(value, params));
	inst.finite = () => inst;
	const bag = inst._zod.bag;
	inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
	inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
	inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
	inst.isFinite = true;
	inst.format = bag.format ?? null;
});
function number(params) {
	return _number(ZodNumber, params);
}
var ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
	$ZodNumberFormat.init(inst, def);
	ZodNumber.init(inst, def);
});
function int(params) {
	return _int(ZodNumberFormat, params);
}
var ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
	$ZodBoolean.init(inst, def);
	ZodType.init(inst, def);
});
function boolean(params) {
	return _boolean(ZodBoolean, params);
}
var ZodNull = /*@__PURE__*/ $constructor("ZodNull", (inst, def) => {
	$ZodNull.init(inst, def);
	ZodType.init(inst, def);
});
function _null(params) {
	return _null$1(ZodNull, params);
}
var ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
	$ZodUnknown.init(inst, def);
	ZodType.init(inst, def);
});
function unknown() {
	return _unknown(ZodUnknown);
}
var ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
	$ZodNever.init(inst, def);
	ZodType.init(inst, def);
});
function never(params) {
	return _never(ZodNever, params);
}
var ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
	$ZodArray.init(inst, def);
	ZodType.init(inst, def);
	inst.element = def.element;
	inst.min = (minLength, params) => inst.check(_minLength(minLength, params));
	inst.nonempty = (params) => inst.check(_minLength(1, params));
	inst.max = (maxLength, params) => inst.check(_maxLength(maxLength, params));
	inst.length = (len, params) => inst.check(_length(len, params));
	inst.unwrap = () => inst.element;
});
function array(element, params) {
	return _array(ZodArray, element, params);
}
var ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
	$ZodObject.init(inst, def);
	ZodType.init(inst, def);
	defineLazy(inst, "shape", () => def.shape);
	inst.keyof = () => _enum(Object.keys(inst._zod.def.shape));
	inst.catchall = (catchall) => inst.clone({
		...inst._zod.def,
		catchall
	});
	inst.passthrough = () => inst.clone({
		...inst._zod.def,
		catchall: unknown()
	});
	inst.loose = () => inst.clone({
		...inst._zod.def,
		catchall: unknown()
	});
	inst.strict = () => inst.clone({
		...inst._zod.def,
		catchall: never()
	});
	inst.strip = () => inst.clone({
		...inst._zod.def,
		catchall: void 0
	});
	inst.extend = (incoming) => {
		return extend(inst, incoming);
	};
	inst.merge = (other) => merge(inst, other);
	inst.pick = (mask) => pick(inst, mask);
	inst.omit = (mask) => omit(inst, mask);
	inst.partial = (...args) => partial(ZodOptional, inst, args[0]);
	inst.required = (...args) => required(ZodNonOptional, inst, args[0]);
});
function object(shape, params) {
	return new ZodObject({
		type: "object",
		get shape() {
			assignProp(this, "shape", { ...shape });
			return this.shape;
		},
		...normalizeParams(params)
	});
}
var ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
	$ZodUnion.init(inst, def);
	ZodType.init(inst, def);
	inst.options = def.options;
});
function union(options, params) {
	return new ZodUnion({
		type: "union",
		options,
		...normalizeParams(params)
	});
}
var ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("ZodDiscriminatedUnion", (inst, def) => {
	ZodUnion.init(inst, def);
	$ZodDiscriminatedUnion.init(inst, def);
});
function discriminatedUnion(discriminator, options, params) {
	return new ZodDiscriminatedUnion({
		type: "union",
		options,
		discriminator,
		...normalizeParams(params)
	});
}
var ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
	$ZodIntersection.init(inst, def);
	ZodType.init(inst, def);
});
function intersection(left, right) {
	return new ZodIntersection({
		type: "intersection",
		left,
		right
	});
}
var ZodRecord = /*@__PURE__*/ $constructor("ZodRecord", (inst, def) => {
	$ZodRecord.init(inst, def);
	ZodType.init(inst, def);
	inst.keyType = def.keyType;
	inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
	return new ZodRecord({
		type: "record",
		keyType,
		valueType,
		...normalizeParams(params)
	});
}
var ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
	$ZodEnum.init(inst, def);
	ZodType.init(inst, def);
	inst.enum = def.entries;
	inst.options = Object.values(def.entries);
	const keys = new Set(Object.keys(def.entries));
	inst.extract = (values, params) => {
		const newEntries = {};
		for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
	inst.exclude = (values, params) => {
		const newEntries = { ...def.entries };
		for (const value of values) if (keys.has(value)) delete newEntries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
});
function _enum(values, params) {
	return new ZodEnum({
		type: "enum",
		entries: Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values,
		...normalizeParams(params)
	});
}
var ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
	$ZodLiteral.init(inst, def);
	ZodType.init(inst, def);
	inst.values = new Set(def.values);
	Object.defineProperty(inst, "value", { get() {
		if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return def.values[0];
	} });
});
function literal(value, params) {
	return new ZodLiteral({
		type: "literal",
		values: Array.isArray(value) ? value : [value],
		...normalizeParams(params)
	});
}
var ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
	$ZodTransform.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.parse = (payload, _ctx) => {
		payload.addIssue = (issue$2) => {
			if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, def));
			else {
				const _issue = issue$2;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				_issue.input ?? (_issue.input = payload.value);
				_issue.inst ?? (_issue.inst = inst);
				_issue.continue ?? (_issue.continue = true);
				payload.issues.push(issue(_issue));
			}
		};
		const output = def.transform(payload.value, payload);
		if (output instanceof Promise) return output.then((output) => {
			payload.value = output;
			return payload;
		});
		payload.value = output;
		return payload;
	};
});
function transform(fn) {
	return new ZodTransform({
		type: "transform",
		transform: fn
	});
}
var ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
	return new ZodOptional({
		type: "optional",
		innerType
	});
}
var ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
	$ZodNullable.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
	return new ZodNullable({
		type: "nullable",
		innerType
	});
}
var ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
	$ZodDefault.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
	return new ZodDefault({
		type: "default",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : defaultValue;
		}
	});
}
var ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
	$ZodPrefault.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
	return new ZodPrefault({
		type: "prefault",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : defaultValue;
		}
	});
}
var ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
	$ZodNonOptional.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
	return new ZodNonOptional({
		type: "nonoptional",
		innerType,
		...normalizeParams(params)
	});
}
var ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
	$ZodCatch.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
	return new ZodCatch({
		type: "catch",
		innerType,
		catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
	});
}
var ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
	$ZodPipe.init(inst, def);
	ZodType.init(inst, def);
	inst.in = def.in;
	inst.out = def.out;
});
function pipe(in_, out) {
	return new ZodPipe({
		type: "pipe",
		in: in_,
		out
	});
}
var ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
	$ZodReadonly.init(inst, def);
	ZodType.init(inst, def);
});
function readonly(innerType) {
	return new ZodReadonly({
		type: "readonly",
		innerType
	});
}
var ZodLazy = /*@__PURE__*/ $constructor("ZodLazy", (inst, def) => {
	$ZodLazy.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.getter();
});
function lazy(getter) {
	return new ZodLazy({
		type: "lazy",
		getter
	});
}
var ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
	$ZodCustom.init(inst, def);
	ZodType.init(inst, def);
});
function check(fn) {
	const ch = new $ZodCheck({ check: "custom" });
	ch._zod.check = fn;
	return ch;
}
function custom(fn, _params) {
	return _custom(ZodCustom, fn ?? (() => true), _params);
}
function refine(fn, _params = {}) {
	return _refine(ZodCustom, fn, _params);
}
function superRefine(fn) {
	const ch = check((payload) => {
		payload.addIssue = (issue$1) => {
			if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, ch._zod.def));
			else {
				const _issue = issue$1;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				_issue.input ?? (_issue.input = payload.value);
				_issue.inst ?? (_issue.inst = ch);
				_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
				payload.issues.push(issue(_issue));
			}
		};
		return fn(payload.value, payload);
	});
	return ch;
}
function _instanceof(cls, params = { error: `Input not instance of ${cls.name}` }) {
	const inst = new ZodCustom({
		type: "custom",
		check: "custom",
		fn: (data) => data instanceof cls,
		abort: true,
		...normalizeParams(params)
	});
	inst._zod.bag.Class = cls;
	return inst;
}
//#endregion
//#region node_modules/ai/dist/index.js
/** Remove credentials, paths, queries, and fragments before emitting telemetry. */
function getRequestOrigin(url) {
	if (url == null) return void 0;
	try {
		const endpoint = new URL(url);
		return endpoint.protocol === "http:" || endpoint.protocol === "https:" ? endpoint.origin : void 0;
	} catch {
		return;
	}
}
/** Preserve request metadata while keeping unknown or sensitive URL fields out of results. */
function sanitizeRequestMetadata(request) {
	if (request == null || !("url" in request)) return request;
	const { url, ...rest } = request;
	const origin = getRequestOrigin(url);
	return {
		...rest,
		...origin != null ? { url: origin } : {}
	};
}
var name$23 = "AI_InvalidArgumentError";
var marker$23 = `vercel.ai.error.${name$23}`;
var symbol$23 = Symbol.for(marker$23);
var InvalidArgumentError = class extends AISDKError {
	constructor({ parameter, value, message }) {
		super({
			name: name$23,
			message: `Invalid argument for parameter ${parameter}: ${message}`
		});
		this[symbol$23] = true;
		this.parameter = parameter;
		this.value = value;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$23);
	}
};
var name$21 = "AI_InvalidToolApprovalError";
var marker$21 = `vercel.ai.error.${name$21}`;
var symbol$21 = Symbol.for(marker$21);
var InvalidToolApprovalError = class extends AISDKError {
	constructor({ approvalId }) {
		super({
			name: name$21,
			message: `Tool approval response references unknown approvalId: "${approvalId}". No matching tool-approval-request found in message history.`
		});
		this[symbol$21] = true;
		this.approvalId = approvalId;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$21);
	}
};
var name$20 = "AI_InvalidToolApprovalSignatureError";
var marker$20 = `vercel.ai.error.${name$20}`;
var symbol$20 = Symbol.for(marker$20);
var InvalidToolApprovalSignatureError = class extends AISDKError {
	constructor({ approvalId, toolCallId, reason }) {
		super({
			name: name$20,
			message: `Tool approval signature verification failed for approval "${approvalId}" (tool call "${toolCallId}"): ${reason}`
		});
		this[symbol$20] = true;
		this.approvalId = approvalId;
		this.toolCallId = toolCallId;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$20);
	}
};
var name$19 = "AI_InvalidToolInputError";
var marker$19 = `vercel.ai.error.${name$19}`;
var symbol$19 = Symbol.for(marker$19);
var InvalidToolInputError = class extends AISDKError {
	constructor({ toolInput, toolName, cause, message = `Invalid input for tool ${toolName}: ${getErrorMessage(cause)}` }) {
		super({
			name: name$19,
			message,
			cause
		});
		this[symbol$19] = true;
		this.toolInput = toolInput;
		this.toolName = toolName;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$19);
	}
};
var name$18 = "AI_ToolCallNotFoundForApprovalError";
var marker$18 = `vercel.ai.error.${name$18}`;
var symbol$18 = Symbol.for(marker$18);
var ToolCallNotFoundForApprovalError = class extends AISDKError {
	constructor({ toolCallId, approvalId }) {
		super({
			name: name$18,
			message: `Tool call "${toolCallId}" not found for approval request "${approvalId}".`
		});
		this[symbol$18] = true;
		this.toolCallId = toolCallId;
		this.approvalId = approvalId;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$18);
	}
};
var name$17 = "AI_MissingToolResultsError";
var marker$17 = `vercel.ai.error.${name$17}`;
var symbol$17 = Symbol.for(marker$17);
var MissingToolResultsError = class extends AISDKError {
	constructor({ toolCallIds }) {
		super({
			name: name$17,
			message: `Tool result${toolCallIds.length > 1 ? "s are" : " is"} missing for tool call${toolCallIds.length > 1 ? "s" : ""} ${toolCallIds.join(", ")}.`
		});
		this[symbol$17] = true;
		this.toolCallIds = toolCallIds;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$17);
	}
};
var name$16 = "AI_NoImageGeneratedError";
var marker$16 = `vercel.ai.error.${name$16}`;
var symbol$16 = Symbol.for(marker$16);
/**
* Thrown when no image could be generated. This can have multiple causes:
*
* - The model failed to generate a response.
* - The model generated a response that could not be parsed.
*/
var NoImageGeneratedError = class extends AISDKError {
	constructor({ message = "No image generated.", cause, calls, responses }) {
		super({
			name: name$16,
			message,
			cause
		});
		this[symbol$16] = true;
		this.calls = calls;
		this.responses = responses;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$16);
	}
};
var name$15 = "AI_NoObjectGeneratedError";
var marker$15 = `vercel.ai.error.${name$15}`;
var symbol$15 = Symbol.for(marker$15);
/**
* Thrown when no object could be generated. This can have several causes:
*
* - The model failed to generate a response.
* - The model generated a response that could not be parsed.
* - The model generated a response that could not be validated against the schema.
*
* The error contains the following properties:
*
* - `text`: The text that was generated by the model. This can be the raw text or the tool call text, depending on the model.
*/
var NoObjectGeneratedError = class extends AISDKError {
	constructor({ message = "No object generated.", cause, text, response, usage, finishReason }) {
		super({
			name: name$15,
			message,
			cause
		});
		this[symbol$15] = true;
		this.text = text;
		this.response = response;
		this.usage = usage;
		this.finishReason = finishReason;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$15);
	}
};
var name$14 = "AI_NoOutputGeneratedError";
var marker$14 = `vercel.ai.error.${name$14}`;
var symbol$14 = Symbol.for(marker$14);
/**
* Thrown when no LLM output was generated, e.g. because of errors.
*/
var NoOutputGeneratedError = class extends AISDKError {
	constructor({ message = "No output generated.", cause } = {}) {
		super({
			name: name$14,
			message,
			cause
		});
		this[symbol$14] = true;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$14);
	}
};
var name$13 = "AI_NoSpeechGeneratedError";
var marker$13 = `vercel.ai.error.${name$13}`;
var symbol$13 = Symbol.for(marker$13);
/**
* Error that is thrown when no speech audio was generated.
*/
var NoSpeechGeneratedError = class extends AISDKError {
	constructor(options) {
		super({
			name: name$13,
			message: "No speech audio generated.",
			...options.cause !== void 0 && { cause: options.cause }
		});
		this[symbol$13] = true;
		this.responses = options.responses;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$13);
	}
};
var name$9 = "AI_NoSuchToolError";
var marker$9 = `vercel.ai.error.${name$9}`;
var symbol$9 = Symbol.for(marker$9);
var NoSuchToolError = class extends AISDKError {
	constructor({ toolName, availableTools = void 0, message = `Model tried to call unavailable tool '${toolName}'. ${availableTools === void 0 ? "No tools are available." : `Available tools: ${availableTools.join(", ")}.`}` }) {
		super({
			name: name$9,
			message
		});
		this[symbol$9] = true;
		this.toolName = toolName;
		this.availableTools = availableTools;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$9);
	}
};
var name$7 = "AI_ToolCallRepairError";
var marker$7 = `vercel.ai.error.${name$7}`;
var symbol$7 = Symbol.for(marker$7);
var ToolCallRepairError = class extends AISDKError {
	constructor({ cause, originalError, message = `Error repairing tool call: ${getErrorMessage(cause)}` }) {
		super({
			name: name$7,
			message,
			cause
		});
		this[symbol$7] = true;
		this.originalError = originalError;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$7);
	}
};
var name$6 = "AI_ToolChoiceViolationError";
var marker$6 = `vercel.ai.error.${name$6}`;
var symbol$6 = Symbol.for(marker$6);
/**
* Thrown when a model response does not satisfy an enforced tool choice.
*/
var ToolChoiceViolationError = class extends AISDKError {
	constructor({ toolChoice, finishReason, provider, modelId, content, message = toolChoice.type === "none" ? "Model response contained a tool call even though tool choice was none." : toolChoice.type === "required" ? "Model response did not contain a tool call even though tool choice was required." : `Model response did not contain a call to the required tool '${toolChoice.toolName}'.` }) {
		super({
			name: name$6,
			message
		});
		this[symbol$6] = true;
		this.toolChoice = toolChoice;
		this.finishReason = finishReason;
		this.provider = provider;
		this.modelId = modelId;
		this.content = content;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$6);
	}
};
/**
* Error that is thrown when a model with an unsupported version is used.
*/
var UnsupportedModelVersionError = class extends AISDKError {
	constructor(options) {
		super({
			name: "AI_UnsupportedModelVersionError",
			message: `Unsupported model version ${options.version} for provider "${options.provider}" and model "${options.modelId}". AI SDK 5 only supports models that implement specification version "v2".`
		});
		this.version = options.version;
		this.provider = options.provider;
		this.modelId = options.modelId;
	}
};
var name$4 = "AI_InvalidDataContentError";
var marker$4 = `vercel.ai.error.${name$4}`;
var symbol$4 = Symbol.for(marker$4);
var InvalidDataContentError = class extends AISDKError {
	constructor({ content, cause, message = `Invalid data content. Expected a base64 string, Uint8Array, ArrayBuffer, or Buffer, but got ${typeof content}.` }) {
		super({
			name: name$4,
			message,
			cause
		});
		this[symbol$4] = true;
		this.content = content;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$4);
	}
};
var name$3 = "AI_InvalidMessageRoleError";
var marker$3 = `vercel.ai.error.${name$3}`;
var symbol$3 = Symbol.for(marker$3);
var InvalidMessageRoleError = class extends AISDKError {
	constructor({ role, message = `Invalid message role: '${role}'. Must be one of: "system", "user", "assistant", "tool".` }) {
		super({
			name: name$3,
			message
		});
		this[symbol$3] = true;
		this.role = role;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$3);
	}
};
var name$1 = "AI_RetryError";
var marker$1 = `vercel.ai.error.${name$1}`;
var symbol$1 = Symbol.for(marker$1);
var RetryError = class extends AISDKError {
	constructor({ message, reason, errors }) {
		super({
			name: name$1,
			message
		});
		this[symbol$1] = true;
		this.reason = reason;
		this.errors = errors;
		this.lastError = errors[errors.length - 1];
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$1);
	}
};
var deprecationCodes = /* @__PURE__ */ new Map([
	["generateObject", "AISDK_DEP_GENERATE_OBJECT"],
	["streamObject", "AISDK_DEP_STREAM_OBJECT"],
	["experimental_generateSpeech", "AISDK_DEP_EXPERIMENTAL_GENERATE_SPEECH"],
	["experimental_transcribe", "AISDK_DEP_EXPERIMENTAL_TRANSCRIBE"],
	["\"image\" content part", "AISDK_DEP_IMAGE_CONTENT_PART"],
	["\"tool-result\" content of type \"file-data\"", "AISDK_DEP_TOOL_RESULT_FILE_DATA"],
	["\"tool-result\" content of type \"file-url\"", "AISDK_DEP_TOOL_RESULT_FILE_URL"],
	["\"tool-result\" content of type \"file-id\"", "AISDK_DEP_TOOL_RESULT_FILE_ID"],
	["\"tool-result\" content of type \"file-reference\"", "AISDK_DEP_TOOL_RESULT_FILE_REFERENCE"],
	["\"tool-result\" content of type \"image-data\"", "AISDK_DEP_TOOL_RESULT_IMAGE_DATA"],
	["\"tool-result\" content of type \"image-url\"", "AISDK_DEP_TOOL_RESULT_IMAGE_URL"],
	["\"tool-result\" content of type \"image-file-id\"", "AISDK_DEP_TOOL_RESULT_IMAGE_FILE_ID"],
	["\"tool-result\" content of type \"image-file-reference\"", "AISDK_DEP_TOOL_RESULT_IMAGE_FILE_REFERENCE"],
	["rawInput in output-error UI message parts", "AISDK_DEP_UI_MESSAGE_RAW_INPUT"]
]);
/**
* Escape punctuation and UTF-16 code units without losing case or collapsing
* distinct settings. Underscores are escaped too, so `__` separates code parts.
*/
function encodeCodePart(value) {
	return value.replace(/[^a-zA-Z0-9]/g, (character) => `_${character.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`);
}
function getDeprecationCode({ setting, provider }) {
	if (provider == null) return deprecationCodes.get(setting) ?? `AISDK_DEP_SETTING_${encodeCodePart(setting)}`;
	return `AISDK_DEP_PROVIDER_${encodeCodePart(provider)}__${encodeCodePart(setting)}`;
}
/**
* Formats a warning object into a human-readable string with clear AI SDK branding.
*
* @param options - The options for formatting the warning.
* @param options.warning - The warning to format.
* @param options.provider - The provider id used for the call, if scoped to a specific provider.
* @param options.model - The model id used for the call, if scoped to a specific provider.
* @returns A formatted warning message string.
*/
function formatWarning({ warning, provider, model }) {
	const prefix = `AI SDK Warning${provider != null && model != null ? ` (${provider} / ${model})` : ""}:`;
	switch (warning.type) {
		case "unsupported": {
			let message = `${prefix} The feature "${warning.feature}" is not supported.`;
			if (warning.details) message += ` ${warning.details}`;
			return message;
		}
		case "compatibility": {
			let message = `${prefix} The feature "${warning.feature}" is used in a compatibility mode.`;
			if (warning.details) message += ` ${warning.details}`;
			return message;
		}
		case "deprecated": return `${prefix} Deprecated: "${warning.setting}". ${warning.message}`;
		case "other": return `${prefix} ${warning.message}`;
		default: return `${prefix} ${JSON.stringify(warning, null, 2)}`;
	}
}
var FIRST_WARNING_INFO_MESSAGE = "AI SDK Warning System: To turn off warning logging, set the AI_SDK_LOG_WARNINGS global to false.";
var hasLoggedBefore = false;
var emittedDeprecationCodes = /* @__PURE__ */ new Set();
function emitWarning({ message, type, code }) {
	if (typeof process !== "undefined" && typeof process.emitWarning === "function") process.emitWarning(message, code == null ? { type } : {
		type,
		code
	});
	else console.warn(code == null ? message : `[${code}] ${message}`);
}
/**
* Logs warnings to the console or uses a custom logger if configured.
*
* The behavior can be customized via the `AI_SDK_LOG_WARNINGS` global variable:
* - If set to `false`, warnings are suppressed.
* - If set to a function, that function is called with the warnings.
* - Otherwise, warnings use `process.emitWarning` when available, falling back
*   to `console.warn`. Deprecations have stable codes and are emitted once per
*   code by the default logger. Custom loggers receive every warning.
*
* @param options - The options containing warnings and context.
* @param options.warnings - The warnings to log.
* @param options.provider - The provider id used for the call, if scoped to a specific provider.
* @param options.model - The model id used for the call, if scoped to a specific provider.
*/
var logWarnings = (options) => {
	if (options.warnings.length === 0) return;
	const logger = globalThis.AI_SDK_LOG_WARNINGS;
	if (logger === false) return;
	if (typeof logger === "function") {
		logger(options);
		return;
	}
	if (!hasLoggedBefore) {
		hasLoggedBefore = true;
		emitWarning({
			message: FIRST_WARNING_INFO_MESSAGE,
			type: "Warning"
		});
	}
	for (const warning of options.warnings) {
		const code = warning.type === "deprecated" ? getDeprecationCode({
			setting: warning.setting,
			provider: options.provider
		}) : void 0;
		if (code != null) {
			if (emittedDeprecationCodes.has(code)) continue;
			emittedDeprecationCodes.add(code);
		}
		emitWarning({
			message: formatWarning({
				warning,
				provider: options.provider,
				model: options.model
			}),
			type: warning.type === "deprecated" ? "DeprecationWarning" : "Warning",
			code
		});
	}
};
function logV2CompatibilityWarning({ provider, modelId }) {
	logWarnings({
		warnings: [{
			type: "compatibility",
			feature: "specificationVersion",
			details: `Using v2 specification compatibility mode. Some features may not be available.`
		}],
		provider,
		model: modelId
	});
}
function asEmbeddingModelV3(model) {
	if (model.specificationVersion === "v3") return model;
	logV2CompatibilityWarning({
		provider: model.provider,
		modelId: model.modelId
	});
	return new Proxy(model, { get(target, prop) {
		if (prop === "specificationVersion") return "v3";
		return target[prop];
	} });
}
function asEmbeddingModelV4(model) {
	if (model.specificationVersion === "v4") return model;
	const v3Model = model.specificationVersion === "v2" ? asEmbeddingModelV3(model) : model;
	return new Proxy(v3Model, { get(target, prop) {
		if (prop === "specificationVersion") return "v4";
		return target[prop];
	} });
}
function asImageModelV3(model) {
	if (model.specificationVersion === "v3") return model;
	logV2CompatibilityWarning({
		provider: model.provider,
		modelId: model.modelId
	});
	return new Proxy(model, { get(target, prop) {
		if (prop === "specificationVersion") return "v3";
		return target[prop];
	} });
}
function asImageModelV4(model) {
	if (model.specificationVersion === "v4") return model;
	const v3Model = model.specificationVersion === "v2" ? asImageModelV3(model) : model;
	return new Proxy(v3Model, { get(target, prop) {
		if (prop === "specificationVersion") return "v4";
		return target[prop];
	} });
}
function asLanguageModelV3(model) {
	if (model.specificationVersion === "v3") return model;
	logV2CompatibilityWarning({
		provider: model.provider,
		modelId: model.modelId
	});
	return new Proxy(model, { get(target, prop) {
		switch (prop) {
			case "specificationVersion": return "v3";
			case "doGenerate": return async (...args) => {
				const result = await target.doGenerate(...args);
				return {
					...result,
					finishReason: convertV2FinishReasonToV3(result.finishReason),
					usage: convertV2UsageToV3(result.usage)
				};
			};
			case "doStream": return async (...args) => {
				const result = await target.doStream(...args);
				return {
					...result,
					stream: convertV2StreamToV3(result.stream)
				};
			};
			default: return target[prop];
		}
	} });
}
function convertV2StreamToV3(stream) {
	return stream.pipeThrough(new TransformStream({ transform(chunk, controller) {
		switch (chunk.type) {
			case "finish":
				controller.enqueue({
					...chunk,
					finishReason: convertV2FinishReasonToV3(chunk.finishReason),
					usage: convertV2UsageToV3(chunk.usage)
				});
				break;
			default: controller.enqueue(chunk);
		}
	} }));
}
function convertV2FinishReasonToV3(finishReason) {
	return {
		unified: finishReason === "unknown" ? "other" : finishReason,
		raw: void 0
	};
}
function convertV2UsageToV3(usage) {
	return {
		inputTokens: {
			total: usage.inputTokens,
			noCache: void 0,
			cacheRead: usage.cachedInputTokens,
			cacheWrite: void 0
		},
		outputTokens: {
			total: usage.outputTokens,
			text: void 0,
			reasoning: usage.reasoningTokens
		},
		raw: usage.totalTokens == null ? void 0 : { totalTokens: usage.totalTokens }
	};
}
function asLanguageModelV4(model) {
	if (model.specificationVersion === "v4") return model;
	const v3Model = model.specificationVersion === "v2" ? asLanguageModelV3(model) : model;
	return new Proxy(v3Model, { get(target, prop) {
		switch (prop) {
			case "specificationVersion": return "v4";
			case "doGenerate": return async (options) => {
				const result = await target.doGenerate({
					...options,
					prompt: convertV4PromptToV3(options.prompt)
				});
				return {
					...result,
					content: result.content.map(convertV3ContentToV4)
				};
			};
			case "doStream": return async (options) => {
				const result = await target.doStream({
					...options,
					prompt: convertV4PromptToV3(options.prompt)
				});
				return {
					...result,
					stream: convertV3StreamToV4(result.stream)
				};
			};
			default: return target[prop];
		}
	} });
}
function convertV4PromptToV3(prompt) {
	return prompt.map((message) => {
		if (message.role === "system") return message;
		return {
			...message,
			content: message.content.map((part) => {
				switch (part.type) {
					case "file": return {
						...part,
						data: convertV4FileDataToV3(part.data)
					};
					case "tool-result": return {
						...part,
						output: convertV4ToolResultOutputToV3(part.output)
					};
					default: return part;
				}
			})
		};
	});
}
function convertV4FileDataToV3(data) {
	switch (data.type) {
		case "data": return data.data;
		case "url": return data.url;
		case "reference":
		case "text": return data;
	}
}
function convertV4ToolResultOutputToV3(output) {
	if (output.type !== "content") return output;
	return {
		...output,
		value: output.value.map((part) => {
			if (part.type !== "file") return part;
			switch (part.data.type) {
				case "data": return {
					type: "file-data",
					data: typeof part.data.data === "string" ? part.data.data : convertUint8ArrayToBase64(part.data.data),
					mediaType: part.mediaType,
					filename: part.filename,
					providerOptions: part.providerOptions
				};
				case "url": return {
					type: "file-url",
					url: part.data.url.toString(),
					providerOptions: part.providerOptions
				};
				case "reference": return {
					type: "file-id",
					fileId: part.data.reference,
					providerOptions: part.providerOptions
				};
				case "text": return part;
			}
		})
	};
}
function convertV3ContentToV4(content) {
	return content.type === "file" ? {
		...content,
		data: {
			type: "data",
			data: content.data
		}
	} : content;
}
function convertV3StreamToV4(stream) {
	return stream.pipeThrough(new TransformStream({ transform(chunk, controller) {
		controller.enqueue(chunk.type === "file" ? {
			...chunk,
			data: {
				type: "data",
				data: chunk.data
			}
		} : chunk);
	} }));
}
function asRerankingModelV4(model) {
	if (model.specificationVersion === "v4") return model;
	return new Proxy(model, { get(target, prop) {
		if (prop === "specificationVersion") return "v4";
		return target[prop];
	} });
}
function asSpeechModelV3(model) {
	if (model.specificationVersion === "v3") return model;
	logV2CompatibilityWarning({
		provider: model.provider,
		modelId: model.modelId
	});
	return new Proxy(model, { get(target, prop) {
		if (prop === "specificationVersion") return "v3";
		return target[prop];
	} });
}
function asSpeechModelV4(model) {
	if (model.specificationVersion === "v4") return model;
	const v3Model = model.specificationVersion === "v2" ? asSpeechModelV3(model) : model;
	return new Proxy(v3Model, { get(target, prop) {
		if (prop === "specificationVersion") return "v4";
		return target[prop];
	} });
}
function asTranscriptionModelV3(model) {
	if (model.specificationVersion === "v3") return model;
	logV2CompatibilityWarning({
		provider: model.provider,
		modelId: model.modelId
	});
	return new Proxy(model, { get(target, prop) {
		if (prop === "specificationVersion") return "v3";
		return target[prop];
	} });
}
function asTranscriptionModelV4(model) {
	if (model.specificationVersion === "v4") return model;
	const v3Model = model.specificationVersion === "v2" ? asTranscriptionModelV3(model) : model;
	return new Proxy(v3Model, { get(target, prop) {
		if (prop === "specificationVersion") return "v4";
		if (prop === "doGenerate") return async ({ timestampGranularities, ...options }) => {
			const result = await target.doGenerate.call(model, options);
			if (!timestampGranularities?.length) return result;
			return {
				...result,
				warnings: [...result.warnings, {
					type: "unsupported",
					feature: "timestampGranularities",
					details: `Shared timestamp granularities are not supported by ${model.specificationVersion} transcription models.`
				}]
			};
		};
		return target[prop];
	} });
}
function asProviderV3(provider) {
	if ("specificationVersion" in provider && provider.specificationVersion === "v3") return provider;
	const v2Provider = provider;
	return {
		specificationVersion: "v3",
		languageModel: (modelId) => asLanguageModelV3(v2Provider.languageModel(modelId)),
		embeddingModel: (modelId) => asEmbeddingModelV3(v2Provider.textEmbeddingModel(modelId)),
		imageModel: (modelId) => asImageModelV3(v2Provider.imageModel(modelId)),
		transcriptionModel: v2Provider.transcriptionModel ? (modelId) => asTranscriptionModelV3(v2Provider.transcriptionModel(modelId)) : void 0,
		speechModel: v2Provider.speechModel ? (modelId) => asSpeechModelV3(v2Provider.speechModel(modelId)) : void 0,
		rerankingModel: void 0
	};
}
function asProviderV4(provider) {
	if ("specificationVersion" in provider && provider.specificationVersion === "v4") return provider;
	const v3Provider = !("specificationVersion" in provider) || provider.specificationVersion !== "v3" ? asProviderV3(provider) : provider;
	return {
		specificationVersion: "v4",
		languageModel: (modelId) => asLanguageModelV4(v3Provider.languageModel(modelId)),
		embeddingModel: (modelId) => asEmbeddingModelV4(v3Provider.embeddingModel(modelId)),
		imageModel: (modelId) => asImageModelV4(v3Provider.imageModel(modelId)),
		transcriptionModel: v3Provider.transcriptionModel ? (modelId) => asTranscriptionModelV4(v3Provider.transcriptionModel(modelId)) : void 0,
		speechModel: v3Provider.speechModel ? (modelId) => asSpeechModelV4(v3Provider.speechModel(modelId)) : void 0,
		rerankingModel: v3Provider.rerankingModel ? (modelId) => asRerankingModelV4(v3Provider.rerankingModel(modelId)) : void 0
	};
}
function resolveLanguageModel(model) {
	if (typeof model === "string") return getGlobalProvider().languageModel(model);
	if (![
		"v4",
		"v3",
		"v2"
	].includes(model.specificationVersion)) {
		const unsupportedModel = model;
		throw new UnsupportedModelVersionError({
			version: unsupportedModel.specificationVersion,
			provider: unsupportedModel.provider,
			modelId: unsupportedModel.modelId
		});
	}
	return asLanguageModelV4(model);
}
function resolveSpeechModel(model) {
	if (typeof model === "string") return getGlobalProvider().speechModel?.(model);
	if (![
		"v4",
		"v3",
		"v2"
	].includes(model.specificationVersion)) {
		const unsupportedModel = model;
		throw new UnsupportedModelVersionError({
			version: unsupportedModel.specificationVersion,
			provider: unsupportedModel.provider,
			modelId: unsupportedModel.modelId
		});
	}
	return asSpeechModelV4(model);
}
function resolveImageModel(model) {
	if (typeof model === "string") return getGlobalProvider().imageModel(model);
	if (![
		"v4",
		"v3",
		"v2"
	].includes(model.specificationVersion)) {
		const unsupportedModel = model;
		throw new UnsupportedModelVersionError({
			version: unsupportedModel.specificationVersion,
			provider: unsupportedModel.provider,
			modelId: unsupportedModel.modelId
		});
	}
	return asImageModelV4(model);
}
function getGlobalProvider() {
	return asProviderV4(globalThis.AI_SDK_DEFAULT_PROVIDER ?? gateway);
}
/**
* Clone model messages while preserving URL instances. Node's structuredClone
* currently rejects URL objects, which are valid file/image prompt payloads.
*/
function cloneModelMessages(messages) {
	return cloneValue(messages, /* @__PURE__ */ new Map());
}
function cloneValue(value, seen) {
	if (value == null || typeof value !== "object") return value;
	if (seen.has(value)) return seen.get(value);
	if (value instanceof URL) {
		const copy = new URL(value.href);
		seen.set(value, copy);
		return copy;
	}
	if (Array.isArray(value)) {
		const copy = new Array(value.length);
		seen.set(value, copy);
		value.forEach((item, index) => {
			copy[index] = cloneValue(item, seen);
		});
		return copy;
	}
	if (isUint8Array(value)) {
		const copy = new Uint8Array(value);
		seen.set(value, copy);
		return copy;
	}
	if (isArrayBuffer(value)) {
		const copy = new Uint8Array(value).slice().buffer;
		seen.set(value, copy);
		return copy;
	}
	if (value instanceof Date || Object.prototype.toString.call(value) === "[object Date]") try {
		const copy = new Date(Date.prototype.getTime.call(value));
		seen.set(value, copy);
		return copy;
	} catch {}
	const copy = {};
	seen.set(value, copy);
	for (const [key, val] of Object.entries(value)) Object.defineProperty(copy, key, {
		value: cloneValue(val, seen),
		writable: true,
		enumerable: true,
		configurable: true
	});
	return copy;
}
var VERSION = "7.0.170";
/**
* Download a file from a URL.
*
* @param url - The URL to download from.
* @param maxBytes - Maximum allowed download size in bytes. Defaults to 100 MiB.
* @param abortSignal - An optional abort signal to cancel the download.
* @returns The downloaded data and media type.
*
* @throws DownloadError if the download fails or exceeds maxBytes.
*/
var download = async ({ url, maxBytes, abortSignal }) => {
	const urlText = url.toString();
	try {
		const headers = withUserAgentSuffix({}, `ai-sdk/${VERSION}`, getRuntimeEnvironmentUserAgent());
		const response = await fetchUntrustedUrl({
			url: urlText,
			headers,
			abortSignal
		});
		if (!response.ok) {
			await cancelResponseBody(response);
			throw new DownloadError({
				url: urlText,
				statusCode: response.status,
				statusText: response.statusText
			});
		}
		return {
			data: await readResponseWithSizeLimit({
				response,
				url: urlText,
				maxBytes: maxBytes ?? 2147483648
			}),
			mediaType: response.headers.get("content-type") ?? void 0
		};
	} catch (error) {
		if (DownloadError.isInstance(error)) throw error;
		throw new DownloadError({
			url: urlText,
			cause: error
		});
	}
};
/**
* Default download function.
* Downloads the file if it is not supported by the model.
*/
var createDefaultDownloadFunction = (download$1 = download, abortSignal) => (requestedDownloads) => Promise.all(requestedDownloads.map(async (requestedDownload) => requestedDownload.isUrlSupportedByModel ? null : await download$1({
	...requestedDownload,
	abortSignal
})));
/**
* Deeply merges two objects together.
* - Properties from the `overrides` object override those in the `base` object with the same key.
* - For nested objects, the merge is performed recursively (deep merge).
* - Arrays are replaced, not merged.
* - Primitive values are replaced.
* - If both `base` and `overrides` are undefined, returns undefined.
* - If one of `base` or `overrides` is undefined, returns the other.
*
* @param base The target object to merge into
* @param overrides The source object to merge from
* @returns A new object with the merged properties, or undefined if both inputs are undefined
*/
function mergeObjects(base, overrides) {
	if (base === void 0 && overrides === void 0) return;
	if (base === void 0) return overrides;
	if (overrides === void 0) return base;
	const result = { ...base };
	for (const key in overrides) {
		if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
		if (Object.prototype.hasOwnProperty.call(overrides, key)) {
			const overridesValue = overrides[key];
			if (overridesValue === void 0) continue;
			const baseValue = key in base ? base[key] : void 0;
			const isSourceObject = overridesValue !== null && typeof overridesValue === "object" && !Array.isArray(overridesValue) && !(overridesValue instanceof Date) && !(overridesValue instanceof RegExp);
			const isTargetObject = baseValue !== null && baseValue !== void 0 && typeof baseValue === "object" && !Array.isArray(baseValue) && !(baseValue instanceof Date) && !(baseValue instanceof RegExp);
			if (isSourceObject && isTargetObject) result[key] = mergeObjects(baseValue, overridesValue);
			else result[key] = overridesValue;
		}
	}
	return result;
}
/**
* Converts data content to a Uint8Array.
*
* @param content - Data content to convert.
* @returns Uint8Array.
*/
function convertDataContentToUint8Array(content) {
	if (isUint8Array(content)) {
		if (content instanceof Uint8Array) return content;
		const { buffer, byteOffset, byteLength } = content;
		return new Uint8Array(buffer, byteOffset, byteLength);
	}
	if (typeof content === "string") try {
		return convertBase64ToUint8Array(content);
	} catch (error) {
		throw new InvalidDataContentError({
			message: "Invalid data content. Content string is not a base64-encoded media.",
			content,
			cause: error
		});
	}
	if (isArrayBuffer(content)) return new Uint8Array(content);
	throw new InvalidDataContentError({ content });
}
function splitDataUrl(dataUrl) {
	try {
		const [header, base64Content] = dataUrl.split(",");
		return {
			mediaType: header.split(";")[0].split(":")[1],
			base64Content
		};
	} catch {
		return {
			mediaType: void 0,
			base64Content: void 0
		};
	}
}
function isTaggedFileData(value) {
	if (typeof value !== "object" || value === null) return false;
	const type = value.type;
	return type === "data" || type === "url" || type === "reference" || type === "text";
}
function convertUrlToFilePartData(url, originalUrl) {
	if (url.protocol === "data:") {
		const { mediaType, base64Content } = splitDataUrl(url.toString());
		if (mediaType == null || base64Content == null) throw new InvalidDataContentError({
			content: url,
			message: `Invalid data URL format in content ${url.toString()}`
		});
		return {
			data: {
				type: "data",
				data: base64Content
			},
			mediaType
		};
	}
	return {
		data: {
			type: "url",
			url,
			...originalUrl != null ? { originalUrl } : {}
		},
		mediaType: void 0
	};
}
function convertUrlStringToFilePartData(content) {
	const result = convertUrlToFilePartData(new URL(content));
	if (result.data.type === "url" && result.data.url.toString() !== content) result.data.originalUrl = content;
	return result;
}
function convertInlineDataToFilePartData(content) {
	if (isUint8Array(content) || isArrayBuffer(content)) return {
		data: {
			type: "data",
			data: convertDataContentToUint8Array(content)
		},
		mediaType: void 0
	};
	if (isBuffer(content)) return {
		data: {
			type: "data",
			data: new Uint8Array(content)
		},
		mediaType: void 0
	};
	return {
		data: {
			type: "data",
			data: content
		},
		mediaType: void 0
	};
}
/**
* Converts any legacy-or-tagged top-level `FilePart.data` /
* `ReasoningFilePart.data` value into the tagged v4 provider prompt shape.
*
* Returns the tagged `data` together with the resolved mediaType (extracted
* from a `data:` URL when applicable).
*/
function convertToLanguageModelV4FilePart(content) {
	if (isTaggedFileData(content)) switch (content.type) {
		case "data":
			if (typeof content.data === "string" && content.data.startsWith("data:")) throw new InvalidDataContentError({
				content: content.data,
				message: "Data URLs are not valid inline data. Pass them as { type: \"url\", url } instead."
			});
			return convertInlineDataToFilePartData(content.data);
		case "url": return convertUrlToFilePartData(content.url, content.originalUrl);
		case "reference": return {
			data: {
				type: "reference",
				reference: content.reference
			},
			mediaType: void 0
		};
		case "text": return {
			data: {
				type: "text",
				text: content.text
			},
			mediaType: void 0
		};
	}
	if (content instanceof URL) return convertUrlToFilePartData(content);
	if (typeof content === "string") try {
		return convertUrlStringToFilePartData(content);
	} catch {
		return convertInlineDataToFilePartData(content);
	}
	if (isUint8Array(content) || isArrayBuffer(content)) return convertInlineDataToFilePartData(content);
	if (isProviderReference(content)) return {
		data: {
			type: "reference",
			reference: content
		},
		mediaType: void 0
	};
	return convertInlineDataToFilePartData(content);
}
async function convertToLanguageModelPrompt({ prompt, supportedUrls, download, abortSignal, provider }) {
	const downloadedAssets = await downloadAssets(prompt.messages, download ?? createDefaultDownloadFunction(void 0, abortSignal), supportedUrls);
	const messages = [...prompt.instructions != null ? typeof prompt.instructions === "string" ? [{
		role: "system",
		content: prompt.instructions
	}] : asArray(prompt.instructions).map((message) => ({
		role: "system",
		content: message.content,
		providerOptions: message.providerOptions
	})) : [], ...prompt.messages.map((message) => convertToLanguageModelMessage({
		message,
		downloadedAssets,
		provider
	}))];
	const combinedMessages = [];
	for (const message of messages) {
		if (message.role !== "tool") {
			combinedMessages.push(message);
			continue;
		}
		const lastCombinedMessage = combinedMessages.at(-1);
		if (lastCombinedMessage?.role === "tool") {
			const lastContentPart = lastCombinedMessage.content.at(-1);
			if (lastContentPart != null && lastCombinedMessage.providerOptions != null) lastContentPart.providerOptions = mergeObjects(lastCombinedMessage.providerOptions, lastContentPart.providerOptions);
			lastCombinedMessage.content.push(...message.content);
			lastCombinedMessage.providerOptions = lastContentPart == null ? mergeObjects(lastCombinedMessage.providerOptions, message.providerOptions) : message.providerOptions;
		} else combinedMessages.push(message);
	}
	const toolCallIds = /* @__PURE__ */ new Set();
	for (const message of combinedMessages) switch (message.role) {
		case "assistant":
			for (const content of message.content) if (content.type === "tool-call" && !content.providerExecuted) toolCallIds.add(content.toolCallId);
			break;
		case "tool":
			for (const content of message.content) if (content.type === "tool-result") toolCallIds.delete(content.toolCallId);
			break;
		case "user":
		case "system": if (toolCallIds.size > 0) throw new MissingToolResultsError({ toolCallIds: Array.from(toolCallIds) });
	}
	if (toolCallIds.size > 0) throw new MissingToolResultsError({ toolCallIds: Array.from(toolCallIds) });
	return combinedMessages.filter((message) => message.role !== "tool" || message.content.length > 0);
}
/**
* Convert a ModelMessage to a LanguageModelV4Message.
*
* @param message - The ModelMessage to convert.
* @param downloadedAssets - A map of URLs to their downloaded data. Only
* available if the model does not support URLs, null otherwise.
*/
function convertToLanguageModelMessage({ message, downloadedAssets, provider }) {
	const warnings = [];
	const role = message.role;
	switch (role) {
		case "system": return {
			role: "system",
			content: message.content,
			providerOptions: message.providerOptions
		};
		case "user": {
			if (typeof message.content === "string") return {
				role: "user",
				content: [{
					type: "text",
					text: message.content
				}],
				providerOptions: message.providerOptions
			};
			const converted = {
				role: "user",
				content: message.content.map((part) => {
					if (part.type === "image") warnings.push({
						type: "deprecated",
						setting: "\"image\" content part",
						message: `The "image" content part type is deprecated. Use a "file" part with mediaType: 'image' (or a more specific image/* subtype) instead.`
					});
					return convertImagePartToFilePart(part);
				}).map((part) => convertPartToLanguageModelPart(part, downloadedAssets)).filter((part) => part.type !== "text" || part.text !== ""),
				providerOptions: message.providerOptions
			};
			if (warnings.length > 0) logWarnings({ warnings });
			return converted;
		}
		case "assistant": {
			if (typeof message.content === "string") return {
				role: "assistant",
				content: [{
					type: "text",
					text: message.content
				}],
				providerOptions: message.providerOptions
			};
			const converted = {
				role: "assistant",
				content: message.content.filter((part) => part.type !== "text" || part.text !== "" || part.providerOptions != null).filter((part) => part.type !== "tool-approval-request").map((part) => {
					const providerOptions = part.providerOptions;
					switch (part.type) {
						case "custom": return {
							type: "custom",
							kind: part.kind,
							providerOptions
						};
						case "file": {
							const { data, mediaType } = convertToLanguageModelV4FilePart(part.data);
							return {
								type: "file",
								data,
								filename: part.filename,
								mediaType: mediaType ?? part.mediaType,
								providerOptions
							};
						}
						case "reasoning": return {
							type: "reasoning",
							text: part.text,
							providerOptions
						};
						case "reasoning-file": {
							const { data, mediaType } = convertToLanguageModelV4FilePart(part.data);
							if (data.type !== "data" && data.type !== "url") throw new Error(`Unsupported reasoning-file data type: ${data.type}`);
							return {
								type: "reasoning-file",
								data,
								mediaType: mediaType ?? part.mediaType,
								providerOptions
							};
						}
						case "text": return {
							type: "text",
							text: part.text,
							providerOptions
						};
						case "tool-call": return {
							type: "tool-call",
							toolCallId: part.toolCallId,
							toolName: part.toolName,
							input: part.input,
							providerExecuted: part.providerExecuted,
							providerOptions
						};
						case "tool-result": return {
							type: "tool-result",
							toolCallId: part.toolCallId,
							toolName: part.toolName,
							output: mapToolResultOutput({
								output: part.output,
								provider,
								warnings,
								downloadedAssets
							}),
							providerOptions
						};
					}
				}),
				providerOptions: message.providerOptions
			};
			if (warnings.length > 0) logWarnings({ warnings });
			return converted;
		}
		case "tool": {
			const converted = {
				role: "tool",
				content: message.content.filter((part) => part.type !== "tool-approval-response" || part.providerExecuted).map((part) => {
					switch (part.type) {
						case "tool-result": return {
							type: "tool-result",
							toolCallId: part.toolCallId,
							toolName: part.toolName,
							output: mapToolResultOutput({
								output: part.output,
								provider,
								warnings,
								downloadedAssets
							}),
							providerOptions: part.providerOptions
						};
						case "tool-approval-response": return {
							type: "tool-approval-response",
							approvalId: part.approvalId,
							approved: part.approved,
							reason: part.reason
						};
					}
				}),
				providerOptions: message.providerOptions
			};
			if (warnings.length > 0) logWarnings({ warnings });
			return converted;
		}
		default: throw new InvalidMessageRoleError({ role });
	}
}
function convertImagePartToFilePart(part) {
	if (part.type !== "image") return part;
	return {
		type: "file",
		data: part.image,
		mediaType: part.mediaType ?? "image",
		providerOptions: part.providerOptions
	};
}
/**
* Downloads files from URLs in the user messages.
*/
async function downloadAssets(messages, download, supportedUrls) {
	const downloadableFiles = [];
	for (const message of messages) {
		if (message.role === "user" && Array.isArray(message.content)) for (const part of message.content) {
			const filePart = convertImagePartToFilePart(part);
			if (filePart.type === "file") downloadableFiles.push(filePart);
		}
		if (message.role === "tool") for (const part of message.content) {
			if (part.type !== "tool-result") continue;
			if (part.output.type !== "content") continue;
			for (const contentPart of part.output.value) {
				const filePart = getDownloadableFilePart(contentPart);
				if (filePart != null) downloadableFiles.push(filePart);
			}
		}
		if (message.role === "assistant" && Array.isArray(message.content)) for (const part of message.content) {
			if (part.type !== "tool-result") continue;
			if (part.output.type !== "content") continue;
			for (const contentPart of part.output.value) {
				const filePart = getDownloadableFilePart(contentPart);
				if (filePart != null) downloadableFiles.push(filePart);
			}
		}
	}
	const plannedDownloads = downloadableFiles.map((part) => {
		const mediaType = part.mediaType;
		const { data } = convertToLanguageModelV4FilePart(part.data);
		return {
			mediaType,
			data
		};
	}).filter((part) => part.data.type === "url").map((part) => ({
		url: part.data.url,
		isUrlSupportedByModel: part.mediaType != null && isUrlSupported({
			url: part.data.url.toString(),
			mediaType: part.mediaType,
			supportedUrls
		})
	}));
	const downloadedFiles = await download(plannedDownloads);
	return Object.fromEntries(downloadedFiles.map((file, index) => file == null ? null : [plannedDownloads[index].url.toString(), {
		data: file.data,
		mediaType: file.mediaType
	}]).filter((file) => file != null));
}
/**
* Resolves the tool result content parts that point at a remote file to the
* tagged file shape, including the deprecated `file-url` and `image-url`
* types, so that they are downloaded and inlined exactly like their `file`
* replacement. Returns `undefined` for content that is already inline or
* provider-referenced.
*/
function getDownloadableFilePart(contentPart) {
	switch (contentPart.type) {
		case "file": return contentPart;
		case "file-url": return {
			type: "file",
			data: {
				type: "url",
				url: new URL(contentPart.url)
			},
			mediaType: contentPart.mediaType ?? getMediaTypeFromUrl(contentPart.url),
			providerOptions: contentPart.providerOptions
		};
		case "image-url": return {
			type: "file",
			data: {
				type: "url",
				url: new URL(contentPart.url)
			},
			mediaType: "image",
			providerOptions: contentPart.providerOptions
		};
		default: return;
	}
}
/**
* Resolves file data and media type for a remote tool result content part: the downloaded
* bytes when the asset was fetched, otherwise the URL reference. `originalUrl`
* is preserved when the URL string does not round-trip through `URL`.
*/
function resolveDownloadedFile({ url, originalUrl, downloadedAssets, mediaType }) {
	const convertedPart = convertPartToLanguageModelPart({
		type: "file",
		data: {
			type: "url",
			url,
			...url.toString() !== originalUrl ? { originalUrl } : {}
		},
		mediaType
	}, downloadedAssets);
	return {
		data: convertedPart.data,
		mediaType: convertedPart.mediaType
	};
}
/**
* Convert part of a user message to a LanguageModelV4Part.
*
* @param part - The part to convert.
* @param downloadedAssets - A map of URLs to their downloaded data. Only
* available if the model does not support URLs, null otherwise.
* @returns The converted part.
*/
function convertPartToLanguageModelPart(part, downloadedAssets) {
	if (part.type === "text") return {
		type: "text",
		text: part.text,
		providerOptions: part.providerOptions
	};
	const { data: normalizedData, mediaType: dataUrlMediaType } = convertToLanguageModelV4FilePart(part.data);
	let mediaType = dataUrlMediaType ?? part.mediaType;
	let data = normalizedData;
	if (data.type === "url") {
		const downloadedFile = downloadedAssets[data.url.toString()];
		if (downloadedFile) {
			data = {
				type: "data",
				data: downloadedFile.data
			};
			if (downloadedFile.mediaType != null && (mediaType == null || !isFullMediaType(mediaType))) mediaType = downloadedFile.mediaType;
		}
	}
	if (data.type === "data" && (data.data instanceof Uint8Array || typeof data.data === "string")) {
		const imageMediaType = detectMediaType({
			data: data.data,
			topLevelType: "image"
		});
		if (imageMediaType != null) mediaType = imageMediaType;
	}
	if (mediaType == null) throw new Error(`Media type is missing for file part`);
	return {
		type: "file",
		mediaType,
		filename: part.filename,
		data,
		providerOptions: part.providerOptions
	};
}
function mapToolResultOutput({ output, provider, warnings = [], downloadedAssets }) {
	if (output.type !== "content") return output;
	return {
		type: "content",
		value: output.value.map((item) => {
			switch (item.type) {
				case "file": {
					const convertedPart = convertPartToLanguageModelPart(item, downloadedAssets);
					if (convertedPart.type !== "file") throw new Error("Expected tool result file content to convert to file.");
					return convertedPart;
				}
				case "file-data":
					warnings.push({
						type: "deprecated",
						setting: "\"tool-result\" content of type \"file-data\"",
						message: `The "file-data" type for tool result content is deprecated. Use the "file" type with mediaType and { type: 'data', data } instead.`
					});
					return {
						type: "file",
						data: {
							type: "data",
							data: item.data
						},
						filename: item.filename,
						mediaType: item.mediaType,
						providerOptions: item.providerOptions
					};
				case "file-url": {
					const mediaType = item.mediaType ?? getMediaTypeFromUrl(item.url);
					const url = new URL(item.url);
					let message = `The "file-url" type for tool result content is deprecated. Use the "file" type with mediaType and { type: 'url', url } instead.`;
					if (!item.mediaType) {
						const inferenceSuffix = mediaType === "application/octet-stream" ? `Unable to infer media type from URL. Defaulting to 'application/octet-stream'.` : `Inferred media type '${mediaType}' from URL.`;
						message = `The "file-url" tool result content part with URL "${item.url}" is missing a "mediaType". ${inferenceSuffix} ${message}`;
					}
					warnings.push({
						type: "deprecated",
						setting: "\"tool-result\" content of type \"file-url\"",
						message
					});
					return {
						type: "file",
						...resolveDownloadedFile({
							url,
							originalUrl: item.url,
							downloadedAssets,
							mediaType
						}),
						providerOptions: item.providerOptions
					};
				}
				case "file-id":
					warnings.push({
						type: "deprecated",
						setting: "\"tool-result\" content of type \"file-id\"",
						message: `The "file-id" type for tool result content is deprecated. Use the "file" type with mediaType and { type: 'reference', reference } instead.`
					});
					return {
						type: "file",
						data: {
							type: "reference",
							reference: convertFileIdToProviderReference({
								fileId: item.fileId,
								provider
							})
						},
						mediaType: "application",
						providerOptions: item.providerOptions
					};
				case "file-reference":
					warnings.push({
						type: "deprecated",
						setting: "\"tool-result\" content of type \"file-reference\"",
						message: `The "file-reference" type for tool result content is deprecated. Use the "file" type with mediaType and { type: 'reference', reference } instead.`
					});
					return {
						type: "file",
						data: {
							type: "reference",
							reference: item.providerReference
						},
						mediaType: "application",
						providerOptions: item.providerOptions
					};
				case "image-data":
					warnings.push({
						type: "deprecated",
						setting: "\"tool-result\" content of type \"image-data\"",
						message: `The "image-data" type for tool result content is deprecated. Use the "file" type with mediaType and { type: 'data', data } instead.`
					});
					return {
						type: "file",
						data: {
							type: "data",
							data: item.data
						},
						mediaType: item.mediaType,
						providerOptions: item.providerOptions
					};
				case "image-url": {
					const url = new URL(item.url);
					warnings.push({
						type: "deprecated",
						setting: "\"tool-result\" content of type \"image-url\"",
						message: `The "image-url" type for tool result content is deprecated. Use the "file" type with mediaType 'image' (or a specific image/* subtype) and { type: 'url', url } instead.`
					});
					return {
						type: "file",
						...resolveDownloadedFile({
							url,
							originalUrl: item.url,
							downloadedAssets,
							mediaType: "image"
						}),
						providerOptions: item.providerOptions
					};
				}
				case "image-file-id":
					warnings.push({
						type: "deprecated",
						setting: "\"tool-result\" content of type \"image-file-id\"",
						message: `The "image-file-id" type for tool result content is deprecated. Use the "file" type with mediaType and { type: 'reference', reference } instead.`
					});
					return {
						type: "file",
						data: {
							type: "reference",
							reference: convertFileIdToProviderReference({
								fileId: item.fileId,
								provider
							})
						},
						mediaType: "image",
						providerOptions: item.providerOptions
					};
				case "image-file-reference":
					warnings.push({
						type: "deprecated",
						setting: "\"tool-result\" content of type \"image-file-reference\"",
						message: `The "image-file-reference" type for tool result content is deprecated. Use the "file" type with mediaType and { type: 'reference', reference } instead.`
					});
					return {
						type: "file",
						data: {
							type: "reference",
							reference: item.providerReference
						},
						mediaType: "image",
						providerOptions: item.providerOptions
					};
				default: return item;
			}
		})
	};
}
function convertFileIdToProviderReference({ fileId, provider }) {
	if (typeof fileId === "object") return fileId;
	if (provider == null) throw new Error("Cannot convert string fileId to provider reference without a provider ID. Use a Record<string, string> fileId or switch to the file-reference type.");
	return { [provider]: fileId };
}
var URL_EXTENSION_TO_MEDIA_TYPE = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	gif: "image/gif",
	webp: "image/webp",
	svg: "image/svg+xml",
	avif: "image/avif",
	heic: "image/heic",
	bmp: "image/bmp",
	tiff: "image/tiff",
	tif: "image/tiff",
	pdf: "application/pdf",
	mp4: "video/mp4",
	webm: "video/webm",
	mp3: "audio/mpeg",
	wav: "audio/wav",
	ogg: "audio/ogg"
};
function getMediaTypeFromUrl(url, fallbackMediaType = "application/octet-stream") {
	try {
		const fileExtension = new URL(url).pathname.split(".").pop()?.toLowerCase();
		if (fileExtension && Object.hasOwn(URL_EXTENSION_TO_MEDIA_TYPE, fileExtension)) return URL_EXTENSION_TO_MEDIA_TYPE[fileExtension];
	} catch {}
	return fallbackMediaType;
}
async function createToolModelOutput({ toolCallId, input, output, tool, errorMode }) {
	if (errorMode === "text") return {
		type: "error-text",
		value: getErrorMessage(output)
	};
	else if (errorMode === "json") return {
		type: "error-json",
		value: toJSONValue(output)
	};
	if (tool?.toModelOutput) return await tool.toModelOutput({
		toolCallId,
		input,
		output
	});
	return typeof output === "string" ? {
		type: "text",
		value: output
	} : {
		type: "json",
		value: toJSONValue(output)
	};
}
/**
* Normalizes an in-process tool output to a plain JSON value
* (applies `toJSON`, converts `Date`, drops `undefined`, etc.)
* by round-tripping it through `JSON.stringify`.
*
* The parsed text is produced by `JSON.stringify` from a value that is
* already materialized in this process, so it is not untrusted input.
* `JSON.parse` is used deliberately instead of the secure parser from
* `@ai-sdk/provider-utils`: the secure parser rejects own `__proto__` and
* `constructor.prototype` keys, which are valid data in tool outputs
* (e.g. rows from an external API). `JSON.parse` defines `__proto__` as an
* own data property and never modifies the prototype chain, so preserving
* these keys here is safe. Do not reuse this pattern for text that comes
* from outside the process; use `parseJSON` / `safeParseJSON` instead.
*/
function toJSONValue(value) {
	if (value === void 0) return null;
	const serialized = JSON.stringify(value);
	return serialized === void 0 ? null : JSON.parse(serialized);
}
/**
* Validates model call options and returns a new object with normalized values.
*/
function prepareLanguageModelCallOptions({ maxOutputTokens, temperature, topP, topK, presencePenalty, frequencyPenalty, seed, stopSequences, reasoning }) {
	if (maxOutputTokens != null) {
		if (!Number.isInteger(maxOutputTokens)) throw new InvalidArgumentError({
			parameter: "maxOutputTokens",
			value: maxOutputTokens,
			message: "maxOutputTokens must be an integer"
		});
		if (maxOutputTokens < 1) throw new InvalidArgumentError({
			parameter: "maxOutputTokens",
			value: maxOutputTokens,
			message: "maxOutputTokens must be >= 1"
		});
	}
	if (seed != null) {
		if (!Number.isInteger(seed)) throw new InvalidArgumentError({
			parameter: "seed",
			value: seed,
			message: "seed must be an integer"
		});
	}
	return {
		maxOutputTokens,
		temperature,
		topP,
		topK,
		presencePenalty,
		frequencyPenalty,
		stopSequences,
		seed,
		reasoning
	};
}
function prepareToolChoice({ toolChoice }) {
	return toolChoice == null ? { type: "auto" } : typeof toolChoice === "string" ? { type: toolChoice } : {
		type: "tool",
		toolName: toolChoice.toolName
	};
}
function isNonEmptyObject(object) {
	return object != null && Object.keys(object).length > 0;
}
async function prepareTools({ tools, toolOrder, toolsContext = {}, experimental_sandbox: sandbox }) {
	if (!isNonEmptyObject(tools)) return;
	const languageModelTools = [];
	for (const [name, tool] of orderToolEntries({
		tools,
		toolOrder
	})) {
		const toolType = tool.type;
		switch (toolType) {
			case void 0:
			case "dynamic":
			case "function": {
				const description = resolveToolDescription({
					tool,
					toolName: name,
					toolsContext,
					experimental_sandbox: sandbox
				});
				const providerOptions = tool.providerOptions;
				const inputExamples = tool.inputExamples;
				const strict = tool.strict;
				languageModelTools.push({
					type: "function",
					name,
					inputSchema: await asSchema(tool.inputSchema).jsonSchema,
					...description != null ? { description } : {},
					...inputExamples != null ? { inputExamples } : {},
					...providerOptions != null ? { providerOptions } : {},
					...strict != null ? { strict } : {}
				});
				break;
			}
			case "provider":
				languageModelTools.push({
					type: "provider",
					name,
					id: tool.id,
					args: tool.args
				});
				break;
			default: throw new Error(`Unsupported tool type: ${toolType}`);
		}
	}
	return languageModelTools;
}
function orderToolEntries({ tools, toolOrder }) {
	if (toolOrder == null) return Object.entries(tools);
	const toolEntries = Object.entries(tools);
	const orderedTools = toolEntries.filter(([name]) => toolOrder.includes(name)).sort(([nameA], [nameB]) => toolOrder.indexOf(nameA) - toolOrder.indexOf(nameB));
	const unorderedTools = toolEntries.filter(([name]) => !toolOrder.includes(name)).sort(([nameA], [nameB]) => nameA < nameB ? -1 : nameA > nameB ? 1 : 0);
	return [...orderedTools, ...unorderedTools];
}
function resolveToolDescription({ tool, toolName, toolsContext, experimental_sandbox: sandbox }) {
	return tool.description === void 0 ? void 0 : typeof tool.description === "string" ? tool.description : tool.description({
		context: toolsContext[toolName],
		experimental_sandbox: sandbox
	});
}
/**
* Extracts the total timeout value in milliseconds from a TimeoutConfiguration.
*
* @param timeout - The timeout configuration.
* @returns The total timeout in milliseconds, or undefined if no timeout is configured.
*/
function getTotalTimeoutMs(timeout) {
	if (timeout == null) return;
	if (typeof timeout === "number") return timeout;
	return timeout.totalMs;
}
/**
* Extracts the step timeout value in milliseconds from a TimeoutConfiguration.
*
* @param timeout - The timeout configuration.
* @returns The step timeout in milliseconds, or undefined if no step timeout is configured.
*/
function getStepTimeoutMs(timeout) {
	if (timeout == null || typeof timeout === "number") return;
	return timeout.stepMs;
}
/**
* Extracts the first chunk timeout value in milliseconds from a TimeoutConfiguration.
* This timeout is for streaming only - it aborts if no content chunk is received within the specified duration.
*
* @param timeout - The timeout configuration.
* @returns The first chunk timeout in milliseconds, or undefined if no first chunk timeout is configured.
*/
function getFirstChunkTimeoutMs(timeout) {
	if (timeout == null || typeof timeout === "number") return;
	return timeout.firstChunkMs;
}
/**
* Extracts the chunk timeout value in milliseconds from a TimeoutConfiguration.
* This timeout is for streaming only - it aborts if no new content chunk is received within the specified duration.
*
* @param timeout - The timeout configuration.
* @returns The chunk timeout in milliseconds, or undefined if no chunk timeout is configured.
*/
function getChunkTimeoutMs(timeout) {
	if (timeout == null || typeof timeout === "number") return;
	return timeout.chunkMs;
}
function getToolTimeoutMs(timeout, toolName) {
	if (timeout == null || typeof timeout === "number") return;
	return timeout.tools?.[`${toolName}Ms`] ?? timeout.toolMs;
}
/**
* Converts a prompt input into a standardized prompt with model messages.
*
* @param prompt - The prompt definition to standardize.
* Set `allowSystemInMessages` to true to allow system messages in the
* `prompt` or `messages` fields. System messages in the `instructions`
* option are always allowed.
* @returns The standardized prompt.
* @throws {InvalidPromptError} When the prompt is invalid.
*/
async function standardizePrompt({ allowSystemInMessages = false, system, instructions = system, prompt, messages }) {
	messages = prompt == null ? messages : typeof prompt === "string" ? [{
		role: "user",
		content: prompt
	}] : prompt;
	if (messages.length === 0) throw new InvalidPromptError({
		prompt,
		message: "messages must not be empty"
	});
	if (!allowSystemInMessages && messages.some((message) => message.role === "system")) throw new InvalidPromptError({
		prompt,
		message: "System messages are not allowed in the prompt or messages fields. Use the instructions option instead."
	});
	return {
		messages,
		instructions
	};
}
function wrapGatewayError(error) {
	if (!GatewayAuthenticationError.isInstance(error)) return error;
	return new AISDKError({
		name: "GatewayError",
		message: `Unauthenticated. Configure AI_GATEWAY_API_KEY or use a provider module. Learn more: https://ai-sdk.dev/unauthenticated-ai-gateway`
	});
}
function asLanguageModelUsage(usage) {
	return {
		inputTokens: usage.inputTokens.total,
		inputTokenDetails: {
			noCacheTokens: usage.inputTokens.noCache,
			cacheReadTokens: usage.inputTokens.cacheRead,
			cacheWriteTokens: usage.inputTokens.cacheWrite
		},
		outputTokens: usage.outputTokens.total,
		outputTokenDetails: {
			textTokens: usage.outputTokens.text,
			reasoningTokens: usage.outputTokens.reasoning
		},
		totalTokens: addTokenCounts(usage.inputTokens.total, usage.outputTokens.total),
		raw: usage.raw
	};
}
function addLanguageModelUsage(usage1, usage2) {
	const raw = isNullLanguageModelUsage(usage1) ? usage2.raw : isNullLanguageModelUsage(usage2) ? usage1.raw : void 0;
	return {
		inputTokens: addTokenCounts(usage1.inputTokens, usage2.inputTokens),
		inputTokenDetails: {
			noCacheTokens: addTokenCounts(usage1.inputTokenDetails?.noCacheTokens, usage2.inputTokenDetails?.noCacheTokens),
			cacheReadTokens: addTokenCounts(usage1.inputTokenDetails?.cacheReadTokens, usage2.inputTokenDetails?.cacheReadTokens),
			cacheWriteTokens: addTokenCounts(usage1.inputTokenDetails?.cacheWriteTokens, usage2.inputTokenDetails?.cacheWriteTokens)
		},
		outputTokens: addTokenCounts(usage1.outputTokens, usage2.outputTokens),
		outputTokenDetails: {
			textTokens: addTokenCounts(usage1.outputTokenDetails?.textTokens, usage2.outputTokenDetails?.textTokens),
			reasoningTokens: addTokenCounts(usage1.outputTokenDetails?.reasoningTokens, usage2.outputTokenDetails?.reasoningTokens)
		},
		totalTokens: addTokenCounts(usage1.totalTokens, usage2.totalTokens),
		...raw == null ? {} : { raw }
	};
}
function isNullLanguageModelUsage(usage) {
	return usage.inputTokens == null && usage.inputTokenDetails?.noCacheTokens == null && usage.inputTokenDetails?.cacheReadTokens == null && usage.inputTokenDetails?.cacheWriteTokens == null && usage.outputTokens == null && usage.outputTokenDetails?.textTokens == null && usage.outputTokenDetails?.reasoningTokens == null && usage.totalTokens == null && usage.raw == null;
}
function addTokenCounts(tokenCount1, tokenCount2) {
	return tokenCount1 == null && tokenCount2 == null ? void 0 : (tokenCount1 ?? 0) + (tokenCount2 ?? 0);
}
function addImageModelUsage(usage1, usage2) {
	return {
		inputTokens: addTokenCounts(usage1.inputTokens, usage2.inputTokens),
		outputTokens: addTokenCounts(usage1.outputTokens, usage2.outputTokens),
		totalTokens: addTokenCounts(usage1.totalTokens, usage2.totalTokens)
	};
}
/**
* Reads a property by an untrusted key, ignoring inherited prototype members.
*
* Tool sets, tool contexts, and similar lookup objects are indexed by names
* that can come from model output or client-supplied message history. Plain
* bracket access (`obj[name]`) resolves names such as `constructor`,
* `toString`, or `__proto__` to values on `Object.prototype`, which would slip
* past the `== null` / `!value` guards that treat an unknown name as "not
* present". This helper returns `undefined` unless `key` is an own property.
*/
function getOwn(obj, key) {
	return obj != null && Object.hasOwn(obj, key) ? obj[key] : void 0;
}
/**
* Merges multiple abort sources into a single `AbortSignal`.
* The returned signal will abort when any input signal aborts or when any
* numeric timeout elapses, using the reason from the first source to abort.
*
* @param signals - Abort signals or timeout durations in milliseconds.
* `null` and `undefined` values are ignored.
* @returns An `AbortSignal` that aborts when any valid source aborts,
* or `undefined` if no valid sources are provided.
*/
function mergeAbortSignals(...signals) {
	const validSignals = filterNullable(...signals).map((signal) => typeof signal === "number" ? AbortSignal.timeout(signal) : signal);
	return validSignals.length === 0 ? void 0 : validSignals.length === 1 ? validSignals[0] : AbortSignal.any(validSignals);
}
function now() {
	return globalThis?.performance?.now() ?? Date.now();
}
/**
* Notifies all provided callbacks with the given event in parallel.
* Errors in callbacks do not break the generation flow.
*/
async function notify(options) {
	await Promise.all(asArray(options.callbacks).map(async (callback) => {
		try {
			await callback?.(options.event);
		} catch {}
	}));
}
function getRetryDelayInMs({ error, exponentialBackoffDelay }) {
	const headers = APICallError.isInstance(error) ? error.responseHeaders : APICallError.isInstance(error.cause) ? error.cause.responseHeaders : void 0;
	if (!headers) return exponentialBackoffDelay;
	let ms;
	const retryAfterMs = headers["retry-after-ms"];
	if (retryAfterMs) {
		const timeoutMs = parseFloat(retryAfterMs);
		if (!Number.isNaN(timeoutMs)) ms = timeoutMs;
	}
	const retryAfter = headers["retry-after"];
	if (retryAfter && ms === void 0) {
		const timeoutSeconds = parseFloat(retryAfter);
		if (!Number.isNaN(timeoutSeconds)) ms = timeoutSeconds * 1e3;
		else ms = Date.parse(retryAfter) - Date.now();
	}
	if (ms != null && !Number.isNaN(ms) && 0 <= ms && (ms < 6e4 || ms < exponentialBackoffDelay)) return ms;
	return exponentialBackoffDelay;
}
/**
* The `retryWithExponentialBackoffRespectingRetryHeaders` strategy retries a failed API call with an exponential backoff,
* while respecting rate limit headers (retry-after-ms and retry-after) if they are provided and reasonable (0-60 seconds).
* You can configure the maximum number of retries, the initial delay, and the backoff factor.
*/
var retryWithExponentialBackoffRespectingRetryHeaders = ({ maxRetries = 2, initialDelayInMs = 2e3, backoffFactor = 2, abortSignal, additionalRetryableError } = {}) => retryWithExponentialBackoff({
	maxRetries,
	initialDelayInMs,
	backoffFactor,
	abortSignal,
	shouldRetry: async (error) => error instanceof Error && (APICallError.isInstance(error) && error.isRetryable === true || GatewayError.isInstance(error) && error.isRetryable === true) || additionalRetryableError != null && await additionalRetryableError(error),
	getDelayInMs: ({ error, exponentialBackoffDelay }) => getRetryDelayInMs({
		error,
		exponentialBackoffDelay
	}),
	createRetryError: ({ message, reason, errors }) => new RetryError({
		message,
		reason,
		errors
	})
});
/**
* Validate and prepare retries.
*/
function prepareRetries({ maxRetries, abortSignal, additionalRetryableError, parameter = "maxRetries", defaultMaxRetries = 2 }) {
	if (maxRetries != null) {
		if (!Number.isInteger(maxRetries)) throw new InvalidArgumentError({
			parameter,
			value: maxRetries,
			message: `${parameter} must be an integer`
		});
		if (maxRetries < 0) throw new InvalidArgumentError({
			parameter,
			value: maxRetries,
			message: `${parameter} must be >= 0`
		});
	}
	const maxRetriesResult = maxRetries ?? defaultMaxRetries;
	return {
		maxRetries: maxRetriesResult,
		retry: retryWithExponentialBackoffRespectingRetryHeaders({
			maxRetries: maxRetriesResult,
			abortSignal,
			additionalRetryableError
		})
	};
}
/**
* Schedules a timeout that aborts the given controller with a `TimeoutError`
* `DOMException`, matching the reason produced by `AbortSignal.timeout(ms)`.
*
* @param abortController - The controller to abort when the timeout elapses.
* If undefined, no timeout is scheduled.
* @param label - Human-readable label included in the error message
* (e.g. "Step", "Chunk").
* @param timeoutMs - Duration in milliseconds before the controller is aborted.
* If undefined, no timeout is scheduled.
* @returns The timeout id (suitable for passing to `clearTimeout`), or
* `undefined` if no timeout was scheduled.
*/
function setAbortTimeout({ abortController, label, timeoutMs }) {
	if (abortController == null || timeoutMs == null) return;
	return setTimeout(() => abortController.abort(new DOMException(`${label} timeout of ${timeoutMs}ms exceeded`, "TimeoutError")), timeoutMs);
}
/**
* Calculates a token rate in tokens per second.
*
* Returns 0 when the token count is unknown, the duration is unknown or 0, or
* the computed rate cannot be represented as a finite JSON-safe number.
*/
function calculateTokensPerSecond({ tokens, durationMs }) {
	const tokenRate = 1e3 * (tokens ?? 0) / (durationMs ?? 0);
	return Number.isFinite(tokenRate) ? tokenRate : 0;
}
/**
* If the last message is a tool message, this function collects all tool approvals
* from that message.
*/
function collectToolApprovals({ messages }) {
	const lastMessage = messages.at(-1);
	if (lastMessage?.role != "tool") return {
		approvedToolApprovals: [],
		deniedToolApprovals: []
	};
	const toolCallsByToolCallId = Object.create(null);
	const toolCallOrder = Object.create(null);
	let nextToolCallIndex = 0;
	for (const message of messages) if (message.role === "assistant" && typeof message.content !== "string") {
		const content = message.content;
		for (const part of content) if (part.type === "tool-call") {
			toolCallsByToolCallId[part.toolCallId] = part;
			toolCallOrder[part.toolCallId] = nextToolCallIndex++;
		}
	}
	const toolApprovalRequestsByApprovalId = Object.create(null);
	for (const message of messages) if (message.role === "assistant" && typeof message.content !== "string") {
		const content = message.content;
		for (const part of content) if (part.type === "tool-approval-request") toolApprovalRequestsByApprovalId[part.approvalId] = part;
	}
	const toolResults = Object.create(null);
	for (const part of lastMessage.content) if (part.type === "tool-result") toolResults[part.toolCallId] = part;
	const approvedToolApprovals = [];
	const deniedToolApprovals = [];
	const collectedToolCallIds = /* @__PURE__ */ new Set();
	const approvalResponses = lastMessage.content.filter((part) => part.type === "tool-approval-response");
	for (const approvalResponse of approvalResponses) {
		const approvalRequest = toolApprovalRequestsByApprovalId[approvalResponse.approvalId];
		if (approvalRequest == null) throw new InvalidToolApprovalError({ approvalId: approvalResponse.approvalId });
		const existingToolResult = toolResults[approvalRequest.toolCallId];
		if (existingToolResult != null && (approvalResponse.approved || existingToolResult.output.type !== "execution-denied")) continue;
		const toolCall = toolCallsByToolCallId[approvalRequest.toolCallId];
		if (toolCall == null) throw new ToolCallNotFoundForApprovalError({
			toolCallId: approvalRequest.toolCallId,
			approvalId: approvalRequest.approvalId
		});
		if (collectedToolCallIds.has(toolCall.toolCallId)) continue;
		collectedToolCallIds.add(toolCall.toolCallId);
		const approval = {
			approvalRequest,
			approvalResponse,
			toolCall,
			...existingToolResult != null ? { existingToolResult } : {}
		};
		if (approvalResponse.approved) approvedToolApprovals.push(approval);
		else deniedToolApprovals.push(approval);
	}
	approvedToolApprovals.sort((a, b) => toolCallOrder[a.toolCall.toolCallId] - toolCallOrder[b.toolCall.toolCallId]);
	return {
		approvedToolApprovals,
		deniedToolApprovals
	};
}
var DefaultGeneratedFile = class {
	constructor({ data, mediaType, providerMetadata }) {
		this.base64Data = typeof data === "string" ? data : void 0;
		this.uint8ArrayData = typeof data === "string" ? void 0 : convertDataContentToUint8Array(data);
		this.mediaType = mediaType;
		this.providerMetadata = providerMetadata;
	}
	get base64() {
		if (this.base64Data == null) this.base64Data = convertUint8ArrayToBase64(this.uint8ArrayData);
		return this.base64Data;
	}
	get uint8Array() {
		if (this.uint8ArrayData == null) this.uint8ArrayData = convertBase64ToUint8Array(this.base64Data);
		return this.uint8ArrayData;
	}
};
async function resolveGeneratedFileData({ data, abortSignal, cache }) {
	if (data.type === "data") return data.data;
	const cachedData = cache?.get(data);
	if (cachedData != null) return cachedData;
	const downloadedData = (await download({
		url: data.url,
		abortSignal
	})).data;
	cache?.set(data, downloadedData);
	return downloadedData;
}
async function convertLanguageModelContent({ content, toolCalls, toolOutputs, toolApprovalRequests, toolApprovalResponses, tools, abortSignal, generatedFileDataCache }) {
	const contentParts = [];
	const toolOutputsWithApprovalResponses = [];
	const toolOutputsWithoutApprovalResponses = [];
	const toolCallIdsWithApprovalResponses = new Set(toolApprovalResponses.map((toolApprovalResponse) => toolApprovalResponse.toolCall.toolCallId));
	for (const part of content) switch (part.type) {
		case "text":
		case "reasoning":
		case "custom":
		case "source":
			contentParts.push(part);
			break;
		case "file":
		case "reasoning-file":
			contentParts.push({
				type: part.type,
				file: new DefaultGeneratedFile({
					data: await resolveGeneratedFileData({
						data: part.data,
						abortSignal,
						cache: generatedFileDataCache
					}),
					mediaType: part.mediaType
				}),
				...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {}
			});
			break;
		case "tool-call": {
			const toolCall = toolCalls.find((toolCall) => toolCall.toolCallId === part.toolCallId);
			if (toolCall == null) throw new Error(`Tool call ${part.toolCallId} not found.`);
			contentParts.push(toolCall);
			break;
		}
		case "tool-result": {
			const toolCall = toolCalls.find((toolCall) => toolCall.toolCallId === part.toolCallId);
			if (toolCall == null) {
				const tool = getOwn(tools, part.toolName);
				if (!(tool?.type === "provider" && tool.supportsDeferredResults)) throw new Error(`Tool call ${part.toolCallId} not found.`);
				if (part.isError) contentParts.push({
					type: "tool-error",
					toolCallId: part.toolCallId,
					toolName: part.toolName,
					input: void 0,
					error: part.result,
					providerExecuted: true,
					dynamic: part.dynamic,
					...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {},
					...tool?.metadata != null ? { toolMetadata: tool.metadata } : {}
				});
				else contentParts.push({
					type: "tool-result",
					toolCallId: part.toolCallId,
					toolName: part.toolName,
					input: void 0,
					output: part.result,
					providerExecuted: true,
					dynamic: part.dynamic,
					...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {},
					...tool?.metadata != null ? { toolMetadata: tool.metadata } : {}
				});
				break;
			}
			if (part.isError) contentParts.push({
				type: "tool-error",
				toolCallId: part.toolCallId,
				toolName: part.toolName,
				input: toolCall.input,
				error: part.result,
				providerExecuted: true,
				dynamic: toolCall.dynamic,
				...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {},
				...toolCall.toolMetadata != null ? { toolMetadata: toolCall.toolMetadata } : {}
			});
			else contentParts.push({
				type: "tool-result",
				toolCallId: part.toolCallId,
				toolName: part.toolName,
				input: toolCall.input,
				output: part.result,
				providerExecuted: true,
				dynamic: toolCall.dynamic,
				...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {},
				...toolCall.toolMetadata != null ? { toolMetadata: toolCall.toolMetadata } : {}
			});
			break;
		}
		case "tool-approval-request": {
			const toolCall = toolCalls.find((toolCall) => toolCall.toolCallId === part.toolCallId);
			if (toolCall == null) throw new ToolCallNotFoundForApprovalError({
				toolCallId: part.toolCallId,
				approvalId: part.approvalId
			});
			contentParts.push({
				type: "tool-approval-request",
				approvalId: part.approvalId,
				toolCall
			});
			break;
		}
	}
	for (const toolOutput of toolOutputs) if (toolCallIdsWithApprovalResponses.has(toolOutput.toolCallId)) toolOutputsWithApprovalResponses.push(toolOutput);
	else toolOutputsWithoutApprovalResponses.push(toolOutput);
	return [
		...contentParts,
		...toolOutputsWithoutApprovalResponses,
		...toolApprovalRequests,
		...toolApprovalResponses,
		...toolOutputsWithApprovalResponses
	];
}
function resolveToolCallerConfiguration({ tools, toolCallers }) {
	if (tools == null || toolCallers == null) return;
	const resolved = {};
	for (const [toolName, callers] of Object.entries(toolCallers)) {
		if (!Object.prototype.hasOwnProperty.call(tools, toolName)) throw new InvalidArgumentError({
			parameter: "experimental_toolCallers",
			value: toolCallers,
			message: `unknown tool "${toolName}".`
		});
		if (callers != null) resolved[toolName] = callers;
	}
	return resolved;
}
function prepareToolsForToolCallers({ tools, toolCallers }) {
	if (tools == null || toolCallers == null) return {
		executionTools: tools,
		modelTools: tools,
		toolCallerMessages: []
	};
	const executionTools = { ...tools };
	const modelTools = { ...tools };
	const localToolsByCaller = /* @__PURE__ */ new Map();
	const toolCallerMessages = [];
	for (const [toolName, callerNames] of Object.entries(toolCallers)) {
		const tool = executionTools[toolName];
		if (tool == null) continue;
		let availableDirectly = false;
		let availableToProvider = false;
		let preparedTool = tool;
		for (const callerName of callerNames) {
			if (callerName === "AI_SDK_DIRECT_TOOL_CALL") {
				availableDirectly = true;
				continue;
			}
			const caller = getToolCaller(executionTools[callerName]);
			if (caller == null) continue;
			if (caller.type === "provider") {
				availableToProvider = true;
				preparedTool = {
					...preparedTool,
					providerOptions: caller.prepareProviderOptions(preparedTool.providerOptions)
				};
			} else {
				const localTools = localToolsByCaller.get(callerName) ?? {};
				localTools[toolName] = preparedTool;
				localToolsByCaller.set(callerName, localTools);
			}
		}
		executionTools[toolName] = preparedTool;
		if (availableDirectly || availableToProvider) modelTools[toolName] = preparedTool;
		else delete modelTools[toolName];
	}
	for (const [callerName, callerTool] of Object.entries(executionTools)) {
		const caller = getToolCaller(callerTool);
		if (caller?.type !== "local") continue;
		const callerTools = localToolsByCaller.get(callerName) ?? {};
		const boundCaller = caller.bind(callerTools);
		executionTools[callerName] = boundCaller;
		if (Object.prototype.hasOwnProperty.call(modelTools, callerName)) if (caller.prepareModelMessage == null) modelTools[callerName] = boundCaller;
		else {
			const content = caller.prepareModelMessage(callerTools);
			if (content != null) toolCallerMessages.push({
				role: "user",
				content
			});
		}
	}
	return {
		executionTools,
		modelTools,
		toolCallerMessages
	};
}
function appendToolCallerMessages({ messages, toolCallerMessages }) {
	if (toolCallerMessages.length === 0) return messages;
	const latestUserText = messages.findLast((message) => message.role === "user" && typeof message.content === "string")?.content;
	const existingUserText = new Set(latestUserText == null ? [] : [latestUserText]);
	const additions = toolCallerMessages.filter((message) => {
		if (typeof message.content !== "string" || existingUserText.has(message.content)) return false;
		existingUserText.add(message.content);
		return true;
	});
	return additions.length === 0 ? messages : [...messages, ...additions];
}
var toolSearchSymbol = Symbol.for("vercel.ai.toolSearch");
var toolSearchFunctionSymbol = Symbol.for("vercel.ai.toolSearch.search");
var toolSearchMaxResultsSymbol = Symbol.for("vercel.ai.toolSearch.maxResults");
function getToolSearchMaxResults(tool) {
	return tool[toolSearchMaxResultsSymbol] ?? 5;
}
function getToolSearchFunction(tool) {
	return tool[toolSearchFunctionSymbol];
}
function isToolSearch(tool) {
	return tool[toolSearchSymbol] === true;
}
/** Create discovery state for one generation, never for a shared tool instance. */
function createToolSearchState({ tools, toolCallers }) {
	const searchTools = Object.entries(tools ?? {}).filter(([, tool]) => tool.deferLoading || isToolSearch(tool));
	if (searchTools.length === 0) return (activeTools) => activeTools;
	const discovered = /* @__PURE__ */ new Set();
	const getCallers = (name) => getOwn(toolCallers, name) ?? ["AI_SDK_DIRECT_TOOL_CALL"];
	for (const [name, tool] of searchTools) if (getCallers(name).some((name) => {
		if (name === "AI_SDK_DIRECT_TOOL_CALL") return false;
		const caller = getToolCaller(tools?.[name]);
		return caller?.type !== "local" || caller.prepareModelMessage == null;
	}) || isToolSearch(tool) && tool.deferLoading) throw new InvalidArgumentError({
		parameter: "tools",
		value: name,
		message: `tool "${name}" must be callable directly or through code mode with toolDiscovery: 'conversation'. The search tool itself must not defer loading.`
	});
	return (activeTools, { toolsContext = {}, experimental_sandbox } = {}) => {
		if (activeTools == null) return;
		const entries = Object.entries(activeTools);
		return Object.fromEntries(entries.filter(([name, tool]) => !tool.deferLoading || discovered.has(name)).map(([searchName, tool]) => {
			if (!isToolSearch(tool)) return [searchName, tool];
			const callers = getCallers(searchName).filter((name) => name === "AI_SDK_DIRECT_TOOL_CALL" || Object.hasOwn(activeTools, name));
			const candidates = entries.filter(([name, candidate]) => candidate.deferLoading && !isToolSearch(candidate) && callers.some((caller) => getCallers(name).includes(caller)));
			return [searchName, {
				...tool,
				execute: async ({ query }) => {
					const availableTools = candidates.map(([name, candidate]) => {
						const description = resolveToolDescription({
							tool: candidate,
							toolName: name,
							toolsContext,
							experimental_sandbox
						});
						return {
							name,
							...description == null ? {} : { description }
						};
					});
					const toolsByName = new Map(availableTools.map((tool) => [tool.name, tool]));
					const customSearch = getToolSearchFunction(tool);
					const terms = [...new Set(tokenize(query))];
					const rankedNames = customSearch ? await customSearch({
						query,
						tools: availableTools.map((tool) => ({ ...tool }))
					}) : availableTools.map(({ name, description }) => {
						const nameTerms = tokenize(name);
						const descriptionTerms = tokenize(description ?? "");
						return {
							name,
							score: terms.reduce((score, term) => score + (nameTerms.includes(term) ? 2 : 0) + (descriptionTerms.includes(term) ? 1 : 0), 0)
						};
					}).filter((match) => match.score > 0).sort((a, b) => b.score - a.score).map((match) => match.name);
					const matches = [...new Set(rankedNames)].flatMap((name) => {
						const match = toolsByName.get(name);
						return match == null ? [] : [match];
					}).slice(0, getToolSearchMaxResults(tool));
					for (const { name } of matches) discovered.add(name);
					return { tools: matches };
				}
			}];
		}));
	};
}
function tokenize(text) {
	return text.replace(/([a-z\d])([A-Z])/g, "$1 $2").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}
/**
* Validates a tool context value against the tool's optional context schema.
*
* When no context schema is defined, the original context value is returned as-is.
* Otherwise, the context is validated and normalized through the schema before
* being passed into tool execution and approval hooks.
*
* @throws {TypeValidationError} When the provided tool context does not match
* the tool's declared `contextSchema`.
*/
async function validateToolContext({ toolName, context, contextSchema }) {
	if (contextSchema == null) return context;
	return await validateTypes({
		value: context,
		schema: contextSchema,
		context: {
			field: "tool context",
			entityName: toolName
		}
	});
}
/**
* Executes a single tool call and manages its lifecycle callbacks.
*
* This function handles the complete tool execution flow:
* 1. Invokes `onToolExecutionStart` callback before execution
* 2. Executes the tool's `execute` function with proper context
* 3. Handles streaming outputs via `onPreliminaryToolResult`
* 4. Invokes `onToolExecutionEnd` callback with success or error result
*
* @returns The tool output with performance metrics, or undefined if the tool has no execute function.
*/
async function executeToolCall({ toolCall, tools, toolsContext, callId, messages, abortSignal, timeout, experimental_sandbox: sandbox, onPreliminaryToolResult, onToolExecutionStart, onToolExecutionEnd, executeToolInTelemetryContext = async ({ execute }) => await execute(), runInTracingChannelSpan = async ({ execute }) => await execute() }) {
	const { toolName, toolCallId, input } = toolCall;
	const tool = getOwn(tools, toolName);
	if (!isExecutableTool(tool)) return;
	const context = await validateToolContext({
		toolName,
		context: getOwn(toolsContext, toolName),
		contextSchema: tool.contextSchema
	});
	const toolExecutionContext = {
		toolCall,
		messages,
		toolContext: context
	};
	const baseCallbackEvent = {
		callId,
		...toolExecutionContext
	};
	return await runInTracingChannelSpan({
		type: "executeTool",
		event: baseCallbackEvent,
		execute: async () => {
			let output;
			await notify({
				event: baseCallbackEvent,
				callbacks: onToolExecutionStart
			});
			const toolAbortSignal = mergeAbortSignals(abortSignal, getToolTimeoutMs(timeout, toolName));
			let toolExecutionMs = 0;
			try {
				await executeToolInTelemetryContext({
					callId,
					toolCallId,
					...toolExecutionContext,
					execute: async () => {
						const startTime = now();
						try {
							const stream = executeTool({
								tool,
								input,
								options: {
									toolCallId,
									messages,
									abortSignal: toolAbortSignal,
									context,
									experimental_sandbox: sandbox
								}
							});
							for await (const part of stream) if (part.type === "preliminary") onPreliminaryToolResult?.({
								...toolCall,
								type: "tool-result",
								output: part.output,
								preliminary: true
							});
							else output = part.output;
						} finally {
							toolExecutionMs = now() - startTime;
						}
					}
				});
			} catch (error) {
				const toolError = {
					type: "tool-error",
					toolCallId,
					toolName,
					input,
					error,
					dynamic: tool.type === "dynamic",
					...toolCall.providerMetadata != null ? { providerMetadata: toolCall.providerMetadata } : {},
					...toolCall.toolMetadata != null ? { toolMetadata: toolCall.toolMetadata } : {}
				};
				await notify({
					event: {
						...baseCallbackEvent,
						toolOutput: toolError,
						toolExecutionMs
					},
					callbacks: onToolExecutionEnd
				});
				return {
					output: toolError,
					toolExecutionMs
				};
			}
			const toolResult = {
				type: "tool-result",
				toolCallId,
				toolName,
				input,
				output,
				dynamic: tool.type === "dynamic",
				...toolCall.providerMetadata != null ? { providerMetadata: toolCall.providerMetadata } : {},
				...toolCall.toolMetadata != null ? { toolMetadata: toolCall.toolMetadata } : {}
			};
			await notify({
				event: {
					...baseCallbackEvent,
					toolOutput: toolResult,
					toolExecutionMs
				},
				callbacks: onToolExecutionEnd
			});
			return {
				output: toolResult,
				toolExecutionMs
			};
		}
	});
}
/**
* Filters the tools to only include the active tools.
* When activeTools is provided, we only include the tools that are in the list.
*
* @param tools - The tools to filter.
* @param activeTools - The active tools to include.
* @returns The filtered tools.
*/
function filterActiveTools({ tools, activeTools }) {
	if (tools == null || activeTools == null) return tools;
	return Object.fromEntries(Object.entries(tools).filter(([name]) => activeTools.includes(name)));
}
function unwrapReasoningFileData(data) {
	if (typeof data === "object" && data !== null && "type" in data) return data.type === "data" ? data.data : data.url;
	return data;
}
function convertFromReasoningOutputs(parts) {
	return parts.map((part) => {
		if (part.type === "reasoning") return {
			type: "reasoning",
			text: part.text,
			...part.providerMetadata != null ? { providerOptions: part.providerMetadata } : {}
		};
		return {
			type: "reasoning-file",
			data: part.file.base64,
			mediaType: part.file.mediaType,
			...part.providerMetadata != null ? { providerOptions: part.providerMetadata } : {}
		};
	});
}
function convertToReasoningOutputs(parts) {
	return parts.map((part) => {
		if (part.type === "reasoning") return {
			type: "reasoning",
			text: part.text,
			...part.providerOptions != null ? { providerMetadata: part.providerOptions } : {}
		};
		const rawData = unwrapReasoningFileData(part.data);
		return {
			type: "reasoning-file",
			file: new DefaultGeneratedFile({
				data: rawData instanceof ArrayBuffer ? new Uint8Array(rawData) : rawData instanceof URL ? rawData.toString() : rawData,
				mediaType: part.mediaType
			}),
			...part.providerOptions != null ? { providerMetadata: part.providerOptions } : {}
		};
	});
}
var DefaultGenerateTextResult = class {
	constructor(options) {
		this.initialResponseMessages = options.initialResponseMessages;
		this.steps = options.steps;
		this._output = options.output;
		this.totalUsage = options.totalUsage;
	}
	get finalStep() {
		return this.steps.at(-1);
	}
	get content() {
		return this.steps.flatMap((step) => step.content);
	}
	get text() {
		return this.finalStep.text;
	}
	get files() {
		return this.steps.flatMap((step) => step.files);
	}
	get reasoningText() {
		return this.finalStep.reasoningText;
	}
	get reasoning() {
		return convertToReasoningOutputs(this.finalStep.reasoning);
	}
	get toolCalls() {
		return this.steps.flatMap((step) => step.toolCalls);
	}
	get staticToolCalls() {
		return this.steps.flatMap((step) => step.staticToolCalls);
	}
	get dynamicToolCalls() {
		return this.steps.flatMap((step) => step.dynamicToolCalls);
	}
	get toolResults() {
		return this.steps.flatMap((step) => step.toolResults);
	}
	get staticToolResults() {
		return this.steps.flatMap((step) => step.staticToolResults);
	}
	get dynamicToolResults() {
		return this.steps.flatMap((step) => step.dynamicToolResults);
	}
	get sources() {
		return this.steps.flatMap((step) => step.sources);
	}
	get finishReason() {
		return this.finalStep.finishReason;
	}
	get rawFinishReason() {
		return this.finalStep.rawFinishReason;
	}
	get warnings() {
		return this.steps.flatMap((step) => step.warnings ?? []);
	}
	get providerMetadata() {
		return this.finalStep.providerMetadata;
	}
	get response() {
		return this.finalStep.response;
	}
	get responseMessages() {
		return [...this.initialResponseMessages, ...this.steps.flatMap((step) => step.response.messages)];
	}
	get request() {
		return this.finalStep.request;
	}
	get usage() {
		return this.totalUsage;
	}
	get output() {
		if (this._output == null) throw new NoOutputGeneratedError();
		return this._output;
	}
};
function isToolExecutionAllowedFinishReason(finishReason) {
	return finishReason === "stop" || finishReason === "tool-calls";
}
var arrayStreamParserFactories = /* @__PURE__ */ new WeakMap();
/**
* Scan only new text and parse/validate each delimited element once. Keep the
* last element pending until another starts or the enclosing object closes,
* matching the partial JSON parser's treatment of an incomplete response.
* Nonstandard envelopes and malformed JSON use the existing partial parser.
*/
function createArrayOutputStreamParser(schema, skipInvalidElements) {
	let phase = 0;
	let prefix = "";
	let elementText = "";
	let depth = 0;
	let inString = false;
	let escaped = false;
	let afterComma = false;
	let pending = [];
	const elements = [];
	let publishedCount;
	async function finishElement() {
		const parsed = await safeParseJSON({ text: elementText });
		if (!parsed.success) return false;
		const validated = await safeValidateTypes({
			value: parsed.value,
			schema
		});
		if (validated.success) pending = [validated.value];
		else if (!skipInvalidElements) return false;
		elementText = "";
		return true;
	}
	function publishPending() {
		elements.push(...pending);
		pending = [];
	}
	return async (textDelta) => {
		for (const char of textDelta) {
			if (phase === 0) {
				prefix += char;
				if (char === "[") {
					if (!/^\s*\{\s*"elements"\s*:\s*\[$/.test(prefix)) return "fallback";
					phase = 1;
				} else if (prefix.length > 256) return "fallback";
				continue;
			}
			if (phase === 2 || phase === 3) {
				if (/\s/.test(char)) continue;
				if (phase === 2 && char === "}") {
					publishPending();
					phase = 3;
					continue;
				}
				return "fallback";
			}
			if (!inString && depth === 0 && (char === "," || char === "]")) {
				if (elementText.length > 0) {
					if (!await finishElement()) return "fallback";
				} else if (char === "," || afterComma) return "fallback";
				afterComma = char === ",";
				if (char === "]") phase = 2;
				continue;
			}
			if (elementText.length === 0) {
				if (/\s/.test(char)) continue;
				publishPending();
				afterComma = false;
			}
			elementText += char;
			if (inString) {
				if (escaped) escaped = false;
				else if (char === "\\") escaped = true;
				else if (char === "\"") inString = false;
			} else if (char === "\"") inString = true;
			else if (char === "{" || char === "[") depth++;
			else if (char === "}" || char === "]") depth--;
		}
		if (phase === 0 || publishedCount === elements.length) return;
		const previousCount = publishedCount ?? 0;
		const delta = (publishedCount == null ? "[" : "") + (previousCount > 0 && elements.length > previousCount ? "," : "") + elements.slice(previousCount).map((value) => JSON.stringify(value)).join(",") + (phase === 3 ? "]" : "");
		publishedCount = elements.length;
		return {
			partial: elements.slice(),
			textDelta: delta
		};
	};
}
function fixJson(input) {
	const stack = ["ROOT"];
	let lastValidIndex = -1;
	let literalStart = null;
	let unicodeEscapeDigits = 0;
	function isHexDigit(char) {
		return char >= "0" && char <= "9" || char >= "A" && char <= "F" || char >= "a" && char <= "f";
	}
	function processValueStart(char, i, swapState) {
		switch (char) {
			case "\"":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_STRING");
				break;
			case "f":
			case "t":
			case "n":
				lastValidIndex = i;
				literalStart = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_LITERAL");
				break;
			case "-":
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_NUMBER");
				break;
			case "0":
			case "1":
			case "2":
			case "3":
			case "4":
			case "5":
			case "6":
			case "7":
			case "8":
			case "9":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_NUMBER");
				break;
			case "{":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_OBJECT_START");
				break;
			case "[":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_ARRAY_START");
		}
	}
	function processAfterObjectValue(char, i) {
		switch (char) {
			case ",":
				stack.pop();
				stack.push("INSIDE_OBJECT_AFTER_COMMA");
				break;
			case "}":
				lastValidIndex = i;
				stack.pop();
		}
	}
	function processAfterArrayValue(char, i) {
		switch (char) {
			case ",":
				stack.pop();
				stack.push("INSIDE_ARRAY_AFTER_COMMA");
				break;
			case "]":
				lastValidIndex = i;
				stack.pop();
		}
	}
	for (let i = 0; i < input.length; i++) {
		const char = input[i];
		switch (stack[stack.length - 1]) {
			case "ROOT":
				processValueStart(char, i, "FINISH");
				break;
			case "INSIDE_OBJECT_START":
				switch (char) {
					case "\"":
						stack.pop();
						stack.push("INSIDE_OBJECT_KEY");
						break;
					case "}":
						lastValidIndex = i;
						stack.pop();
				}
				break;
			case "INSIDE_OBJECT_AFTER_COMMA":
				switch (char) {
					case "\"":
						stack.pop();
						stack.push("INSIDE_OBJECT_KEY");
				}
				break;
			case "INSIDE_OBJECT_KEY":
				switch (char) {
					case "\"":
						stack.pop();
						stack.push("INSIDE_OBJECT_AFTER_KEY");
				}
				break;
			case "INSIDE_OBJECT_AFTER_KEY":
				switch (char) {
					case ":":
						stack.pop();
						stack.push("INSIDE_OBJECT_BEFORE_VALUE");
				}
				break;
			case "INSIDE_OBJECT_BEFORE_VALUE":
				processValueStart(char, i, "INSIDE_OBJECT_AFTER_VALUE");
				break;
			case "INSIDE_OBJECT_AFTER_VALUE":
				processAfterObjectValue(char, i);
				break;
			case "INSIDE_STRING":
				switch (char) {
					case "\"":
						stack.pop();
						lastValidIndex = i;
						break;
					case "\\":
						stack.push("INSIDE_STRING_ESCAPE");
						break;
					default: lastValidIndex = i;
				}
				break;
			case "INSIDE_ARRAY_START":
				switch (char) {
					case "]":
						lastValidIndex = i;
						stack.pop();
						break;
					default: processValueStart(char, i, "INSIDE_ARRAY_AFTER_VALUE");
				}
				break;
			case "INSIDE_ARRAY_AFTER_VALUE":
				switch (char) {
					case ",":
						stack.pop();
						stack.push("INSIDE_ARRAY_AFTER_COMMA");
						break;
					case "]":
						lastValidIndex = i;
						stack.pop();
						break;
					default: lastValidIndex = i;
				}
				break;
			case "INSIDE_ARRAY_AFTER_COMMA":
				processValueStart(char, i, "INSIDE_ARRAY_AFTER_VALUE");
				break;
			case "INSIDE_STRING_ESCAPE":
				stack.pop();
				if (char === "u") {
					unicodeEscapeDigits = 0;
					stack.push("INSIDE_STRING_UNICODE_ESCAPE");
				} else lastValidIndex = i;
				break;
			case "INSIDE_STRING_UNICODE_ESCAPE":
				if (isHexDigit(char)) {
					unicodeEscapeDigits++;
					if (unicodeEscapeDigits === 4) {
						stack.pop();
						lastValidIndex = i;
					}
				}
				break;
			case "INSIDE_NUMBER":
				switch (char) {
					case "0":
					case "1":
					case "2":
					case "3":
					case "4":
					case "5":
					case "6":
					case "7":
					case "8":
					case "9":
						lastValidIndex = i;
						break;
					case "e":
					case "E":
					case "-":
					case ".": break;
					case ",":
						stack.pop();
						if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") processAfterArrayValue(char, i);
						if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") processAfterObjectValue(char, i);
						break;
					case "}":
						stack.pop();
						if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") processAfterObjectValue(char, i);
						break;
					case "]":
						stack.pop();
						if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") processAfterArrayValue(char, i);
						break;
					default: stack.pop();
				}
				break;
			case "INSIDE_LITERAL": {
				const partialLiteral = input.substring(literalStart, i + 1);
				if (!"false".startsWith(partialLiteral) && !"true".startsWith(partialLiteral) && !"null".startsWith(partialLiteral)) {
					stack.pop();
					if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") processAfterObjectValue(char, i);
					else if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") processAfterArrayValue(char, i);
				} else lastValidIndex = i;
				break;
			}
		}
	}
	let result = input.slice(0, lastValidIndex + 1);
	for (let i = stack.length - 1; i >= 0; i--) switch (stack[i]) {
		case "INSIDE_STRING":
			result += "\"";
			break;
		case "INSIDE_OBJECT_KEY":
		case "INSIDE_OBJECT_AFTER_KEY":
		case "INSIDE_OBJECT_AFTER_COMMA":
		case "INSIDE_OBJECT_START":
		case "INSIDE_OBJECT_BEFORE_VALUE":
		case "INSIDE_OBJECT_AFTER_VALUE":
			result += "}";
			break;
		case "INSIDE_ARRAY_START":
		case "INSIDE_ARRAY_AFTER_COMMA":
		case "INSIDE_ARRAY_AFTER_VALUE":
			result += "]";
			break;
		case "INSIDE_LITERAL": {
			const partialLiteral = input.substring(literalStart, input.length);
			if ("true".startsWith(partialLiteral)) result += "true".slice(partialLiteral.length);
			else if ("false".startsWith(partialLiteral)) result += "false".slice(partialLiteral.length);
			else if ("null".startsWith(partialLiteral)) result += "null".slice(partialLiteral.length);
		}
	}
	return result;
}
async function parsePartialJson(jsonText) {
	if (jsonText === void 0) return {
		value: void 0,
		state: "undefined-input"
	};
	let result = await safeParseJSON({ text: jsonText });
	if (result.success) return {
		value: result.value,
		state: "successful-parse"
	};
	result = await safeParseJSON({ text: fixJson(jsonText) });
	if (result.success) return {
		value: result.value,
		state: "repaired-parse"
	};
	return {
		value: void 0,
		state: "failed-parse"
	};
}
var output_exports = /* @__PURE__ */ __exportAll({
	array: () => array$2,
	choice: () => choice,
	json: () => json,
	object: () => object$2,
	text: () => text
});
/**
* Output specification for text generation.
* This is the default output mode that generates plain text.
*
* @returns An output specification for generating text.
*/
var text = () => ({
	name: "text",
	responseFormat: Promise.resolve({ type: "text" }),
	async parseCompleteOutput({ text }) {
		return text;
	},
	async parsePartialOutput({ text }) {
		return { partial: text };
	},
	createElementStreamTransform() {}
});
function object$2({ schema: inputSchema, name, description }) {
	const schema = asSchema(inputSchema);
	return {
		name: "object",
		responseFormat: resolve(schema.jsonSchema).then((jsonSchema) => ({
			type: "json",
			schema: jsonSchema,
			...name != null && { name },
			...description != null && { description }
		})),
		async parseCompleteOutput({ text }, context) {
			const parseResult = await safeParseJSON({ text });
			if (!parseResult.success) throw new NoObjectGeneratedError({
				...context,
				message: "No object generated: could not parse the response.",
				cause: parseResult.error,
				text
			});
			const validationResult = await safeValidateTypes({
				value: parseResult.value,
				schema
			});
			if (!validationResult.success) throw new NoObjectGeneratedError({
				...context,
				message: "No object generated: response did not match schema.",
				cause: validationResult.error,
				text
			});
			return validationResult.value;
		},
		async parsePartialOutput({ text }) {
			const result = await parsePartialJson(text);
			switch (result.state) {
				case "failed-parse":
				case "undefined-input": return;
				case "repaired-parse":
				case "successful-parse": return { partial: result.value };
			}
		},
		createElementStreamTransform() {}
	};
}
function array$2({ element: inputElementSchema, minItems, maxItems, name, description }) {
	validateArrayBound({
		name: "minItems",
		value: minItems
	});
	validateArrayBound({
		name: "maxItems",
		value: maxItems
	});
	if (minItems != null && maxItems != null && minItems > maxItems) throw new InvalidArgumentError({
		parameter: "minItems",
		value: minItems,
		message: "minItems must be less than or equal to maxItems"
	});
	const elementSchema = asSchema(inputElementSchema);
	const output = {
		name: "array",
		responseFormat: resolve(elementSchema.jsonSchema).then((jsonSchema) => {
			const { $schema: _$schema, definitions, $defs, ...itemSchema } = jsonSchema;
			return {
				type: "json",
				schema: {
					$schema: "http://json-schema.org/draft-07/schema#",
					...definitions != null && { definitions },
					...$defs != null && { $defs },
					type: "object",
					properties: { elements: {
						type: "array",
						items: itemSchema,
						...minItems != null && { minItems },
						...maxItems != null && { maxItems }
					} },
					required: ["elements"],
					additionalProperties: false
				},
				...name != null && { name },
				...description != null && { description }
			};
		}),
		async parseCompleteOutput({ text }, context) {
			const parseResult = await safeParseJSON({ text });
			if (!parseResult.success) throw new NoObjectGeneratedError({
				...context,
				message: "No object generated: could not parse the response.",
				cause: parseResult.error,
				text
			});
			const outerValue = parseResult.value;
			if (outerValue == null || typeof outerValue !== "object" || !("elements" in outerValue) || !Array.isArray(outerValue.elements)) throw new NoObjectGeneratedError({
				...context,
				message: "No object generated: response did not match schema.",
				cause: new TypeValidationError({
					value: outerValue,
					cause: "response must be an object with an elements array"
				}),
				text
			});
			const lengthValidationError = getArrayLengthValidationError({
				value: outerValue.elements,
				minItems,
				maxItems
			});
			if (lengthValidationError != null) throw new NoObjectGeneratedError({
				...context,
				message: "No object generated: response did not match schema.",
				cause: lengthValidationError,
				text
			});
			const validatedElements = [];
			for (const element of outerValue.elements) {
				const validationResult = await safeValidateTypes({
					value: element,
					schema: elementSchema
				});
				if (!validationResult.success) throw new NoObjectGeneratedError({
					...context,
					message: "No object generated: response did not match schema.",
					cause: validationResult.error,
					text
				});
				validatedElements.push(validationResult.value);
			}
			return validatedElements;
		},
		async parsePartialOutput({ text }) {
			const result = await parsePartialJson(text);
			switch (result.state) {
				case "failed-parse":
				case "undefined-input": return;
				case "repaired-parse":
				case "successful-parse": {
					const outerValue = result.value;
					if (outerValue == null || typeof outerValue !== "object" || !("elements" in outerValue) || !Array.isArray(outerValue.elements)) return;
					const rawElements = result.state === "repaired-parse" && outerValue.elements.length > 0 ? outerValue.elements.slice(0, -1) : outerValue.elements;
					const parsedElements = [];
					for (const rawElement of rawElements) {
						const validationResult = await safeValidateTypes({
							value: rawElement,
							schema: elementSchema
						});
						if (validationResult.success) parsedElements.push(validationResult.value);
					}
					return { partial: parsedElements };
				}
			}
		},
		createElementStreamTransform() {
			let publishedElements = 0;
			return new TransformStream({ transform({ partialOutput }, controller) {
				if (partialOutput != null) for (; publishedElements < partialOutput.length; publishedElements++) {
					if (maxItems != null && publishedElements >= maxItems) {
						controller.error(getArrayLengthValidationError({
							value: partialOutput,
							maxItems
						}));
						return;
					}
					controller.enqueue(partialOutput[publishedElements]);
				}
			} });
		}
	};
	const parsePartialOutput = output.parsePartialOutput;
	arrayStreamParserFactories.set(output, () => output.parsePartialOutput === parsePartialOutput ? createArrayOutputStreamParser(elementSchema, true) : void 0);
	return output;
}
function validateArrayBound({ name, value }) {
	if (value == null) return;
	if (!Number.isInteger(value)) throw new InvalidArgumentError({
		parameter: name,
		value,
		message: `${name} must be an integer`
	});
	if (value < 0) throw new InvalidArgumentError({
		parameter: name,
		value,
		message: `${name} must be greater than or equal to 0`
	});
}
function getArrayLengthValidationError({ value, minItems, maxItems }) {
	if (minItems != null && value.length < minItems) return new TypeValidationError({
		value,
		cause: `elements array must contain at least ${minItems} items`
	});
	if (maxItems != null && value.length > maxItems) return new TypeValidationError({
		value,
		cause: `elements array must contain at most ${maxItems} items`
	});
}
/**
* Output specification for choice generation.
* When the model generates a text response, it will return one of the choice options.
*
* @param options - The available choices.
* @param name - Optional name of the output that should be generated. Used by some providers for additional LLM guidance, e.g. via tool or schema name.
* @param description - Optional description of the output that should be generated. Used by some providers for additional LLM guidance, e.g. via tool or schema description.
*
* @returns An output specification for generating a choice.
*/
var choice = ({ options: choiceOptions, name, description }) => {
	return {
		name: "choice",
		responseFormat: Promise.resolve({
			type: "json",
			schema: {
				$schema: "http://json-schema.org/draft-07/schema#",
				type: "object",
				properties: { result: {
					type: "string",
					enum: choiceOptions
				} },
				required: ["result"],
				additionalProperties: false
			},
			...name != null && { name },
			...description != null && { description }
		}),
		async parseCompleteOutput({ text }, context) {
			const parseResult = await safeParseJSON({ text });
			if (!parseResult.success) throw new NoObjectGeneratedError({
				...context,
				message: "No object generated: could not parse the response.",
				cause: parseResult.error,
				text
			});
			const outerValue = parseResult.value;
			if (outerValue == null || typeof outerValue !== "object" || !("result" in outerValue) || typeof outerValue.result !== "string" || !choiceOptions.includes(outerValue.result)) throw new NoObjectGeneratedError({
				...context,
				message: "No object generated: response did not match schema.",
				cause: new TypeValidationError({
					value: outerValue,
					cause: "response must be an object that contains a choice value."
				}),
				text
			});
			return outerValue.result;
		},
		async parsePartialOutput({ text }) {
			const result = await parsePartialJson(text);
			switch (result.state) {
				case "failed-parse":
				case "undefined-input": return;
				case "repaired-parse":
				case "successful-parse": {
					const outerValue = result.value;
					if (outerValue == null || typeof outerValue !== "object" || !("result" in outerValue) || typeof outerValue.result !== "string") return;
					const potentialMatches = choiceOptions.filter((choiceOption) => choiceOption.startsWith(outerValue.result));
					if (result.state === "successful-parse") return potentialMatches.includes(outerValue.result) ? { partial: outerValue.result } : void 0;
					else return potentialMatches.length === 1 ? { partial: potentialMatches[0] } : void 0;
				}
			}
		},
		createElementStreamTransform() {}
	};
};
/**
* Output specification for unstructured JSON generation.
* When the model generates a text response, it will return a JSON object.
*
* @param name - Optional name of the output that should be generated. Used by some providers for additional LLM guidance, e.g. via tool or schema name.
* @param description - Optional description of the output that should be generated. Used by some providers for additional LLM guidance, e.g. via tool or schema description.
*
* @returns An output specification for generating JSON.
*/
var json = ({ name, description } = {}) => {
	return {
		name: "json",
		responseFormat: Promise.resolve({
			type: "json",
			...name != null && { name },
			...description != null && { description }
		}),
		async parseCompleteOutput({ text }, context) {
			const parseResult = await safeParseJSON({ text });
			if (!parseResult.success) throw new NoObjectGeneratedError({
				...context,
				message: "No object generated: could not parse the response.",
				cause: parseResult.error,
				text
			});
			return parseResult.value;
		},
		async parsePartialOutput({ text }) {
			const result = await parsePartialJson(text);
			switch (result.state) {
				case "failed-parse":
				case "undefined-input": return;
				case "repaired-parse":
				case "successful-parse": return result.value === void 0 ? void 0 : { partial: result.value };
			}
		},
		createElementStreamTransform() {}
	};
};
var inputSchemaInputSymbol = Symbol("ai-sdk-tool-call-input-schema-input");
function setToolCallInputSchemaInput(toolCall, inputSchemaInput) {
	Object.defineProperty(toolCall, inputSchemaInputSymbol, { value: inputSchemaInput });
	return toolCall;
}
function getToolCallInputSchemaInput(toolCall) {
	return inputSchemaInputSymbol in toolCall ? { value: toolCall[inputSchemaInputSymbol] } : void 0;
}
async function parseToolCall({ toolCall, tools, repairToolCall, refineToolInput, messages, instructions, abortSignal }) {
	try {
		if (tools == null) {
			if (toolCall.providerExecuted && toolCall.dynamic) return await refineParsedToolCallInput({
				toolCall: await parseProviderExecutedDynamicToolCall(toolCall),
				refineToolInput
			});
			throw new NoSuchToolError({ toolName: toolCall.toolName });
		}
		try {
			return await refineParsedToolCallInput({
				toolCall: await doParseToolCall({
					toolCall,
					tools
				}),
				refineToolInput
			});
		} catch (error) {
			if (repairToolCall == null || !(NoSuchToolError.isInstance(error) || InvalidToolInputError.isInstance(error))) throw error;
			let repairedToolCall = null;
			try {
				abortSignal?.throwIfAborted();
				repairedToolCall = await waitForPromiseWithAbortSignal({
					promise: repairToolCall({
						toolCall,
						tools,
						inputSchema: async ({ toolName }) => {
							const inputSchema = getOwn(tools, toolName)?.inputSchema;
							return await asSchema(inputSchema).jsonSchema;
						},
						instructions,
						system: instructions,
						messages,
						error,
						abortSignal
					}),
					abortSignal
				});
			} catch (repairError) {
				abortSignal?.throwIfAborted();
				throw new ToolCallRepairError({
					cause: repairError,
					originalError: error
				});
			}
			if (repairedToolCall == null) throw error;
			const parsedRepairedToolCall = await refineParsedToolCallInput({
				toolCall: await doParseToolCall({
					toolCall: repairedToolCall,
					tools
				}),
				refineToolInput
			});
			abortSignal?.throwIfAborted();
			return parsedRepairedToolCall;
		}
	} catch (error) {
		abortSignal?.throwIfAborted();
		const parsedInput = await safeParseJSON({ text: toolCall.input });
		const input = parsedInput.success ? parsedInput.value : toolCall.input;
		const tool = getOwn(tools, toolCall.toolName);
		return {
			type: "tool-call",
			toolCallId: toolCall.toolCallId,
			toolName: toolCall.toolName,
			input,
			dynamic: true,
			invalid: true,
			error,
			title: tool?.title,
			providerExecuted: toolCall.providerExecuted,
			providerMetadata: toolCall.providerMetadata,
			...tool?.metadata != null ? { toolMetadata: tool.metadata } : {}
		};
	}
}
async function waitForPromiseWithAbortSignal({ promise, abortSignal }) {
	if (abortSignal == null) return await promise;
	return await new Promise((resolve, reject) => {
		const cleanup = () => {
			abortSignal.removeEventListener("abort", onAbort);
		};
		const onAbort = () => {
			cleanup();
			reject(abortSignal.reason);
		};
		Promise.resolve(promise).then((value) => {
			cleanup();
			resolve(value);
		}).catch((error) => {
			cleanup();
			reject(error);
		});
		abortSignal.addEventListener("abort", onAbort, { once: true });
		if (abortSignal.aborted) onAbort();
	});
}
async function refineParsedToolCallInput({ toolCall, refineToolInput }) {
	const refine = getOwn(refineToolInput, toolCall.toolName);
	if (refine == null) return toolCall;
	const refinedToolCall = {
		...toolCall,
		input: await refine(toolCall.input)
	};
	const inputSchemaInput = getToolCallInputSchemaInput(toolCall);
	return inputSchemaInput == null ? refinedToolCall : setToolCallInputSchemaInput(refinedToolCall, inputSchemaInput.value);
}
async function parseProviderExecutedDynamicToolCall(toolCall) {
	const parseResult = toolCall.input.trim() === "" ? {
		success: true,
		value: {}
	} : await safeParseJSON({ text: toolCall.input });
	if (parseResult.success === false) throw new InvalidToolInputError({
		toolName: toolCall.toolName,
		toolInput: toolCall.input,
		cause: parseResult.error
	});
	return {
		type: "tool-call",
		toolCallId: toolCall.toolCallId,
		toolName: toolCall.toolName,
		input: parseResult.value,
		providerExecuted: true,
		dynamic: true,
		providerMetadata: toolCall.providerMetadata
	};
}
async function doParseToolCall({ toolCall, tools }) {
	const toolName = toolCall.toolName;
	const tool = getOwn(tools, toolName);
	if (tool == null) {
		if (toolCall.providerExecuted && toolCall.dynamic) return await parseProviderExecutedDynamicToolCall(toolCall);
		throw new NoSuchToolError({
			toolName: toolCall.toolName,
			availableTools: Object.keys(tools)
		});
	}
	const schema = asSchema(tool.inputSchema);
	const parseResult = toolCall.input.trim() === "" ? await safeValidateTypes({
		value: {},
		schema
	}) : await safeParseJSON({
		text: toolCall.input,
		schema
	});
	if (parseResult.success === false) throw new InvalidToolInputError({
		toolName,
		toolInput: toolCall.input,
		cause: parseResult.error
	});
	return setToolCallInputSchemaInput(tool.type === "dynamic" ? {
		type: "tool-call",
		toolCallId: toolCall.toolCallId,
		toolName: toolCall.toolName,
		input: parseResult.value,
		providerExecuted: toolCall.providerExecuted,
		providerMetadata: toolCall.providerMetadata,
		...tool.metadata != null ? { toolMetadata: tool.metadata } : {},
		dynamic: true,
		title: tool.title
	} : {
		type: "tool-call",
		toolCallId: toolCall.toolCallId,
		toolName,
		input: parseResult.value,
		providerExecuted: toolCall.providerExecuted,
		providerMetadata: toolCall.providerMetadata,
		...tool.metadata != null ? { toolMetadata: tool.metadata } : {},
		title: tool.title
	}, parseResult.rawValue);
}
/**
* Resolves model call settings for a single step.
*
* Undefined step settings intentionally fall back to the outer call settings,
* while defined falsy values such as `temperature: 0` and `seed: 0` are kept.
*/
function prepareStepCallSettings({ callSettings, stepSettings }) {
	return prepareLanguageModelCallOptions({
		maxOutputTokens: stepSettings?.maxOutputTokens ?? callSettings.maxOutputTokens,
		temperature: stepSettings?.temperature ?? callSettings.temperature,
		topP: stepSettings?.topP ?? callSettings.topP,
		topK: stepSettings?.topK ?? callSettings.topK,
		presencePenalty: stepSettings?.presencePenalty ?? callSettings.presencePenalty,
		frequencyPenalty: stepSettings?.frequencyPenalty ?? callSettings.frequencyPenalty,
		stopSequences: stepSettings?.stopSequences ?? callSettings.stopSequences,
		seed: stepSettings?.seed ?? callSettings.seed,
		reasoning: stepSettings?.reasoning ?? callSettings.reasoning
	});
}
/**
* Resolves the approval state for a tool call by checking user-supplied and tool-defined
* approval settings, and normalizes the result to the object status shape.
* User-defined approval settings take precedence over tool-defined settings.
* If no approval settings are provided, the tool call does not require approval.
*/
async function resolveToolApproval({ tools, toolCall, toolApproval, messages, toolsContext, runtimeContext }) {
	if (toolApproval != null && typeof toolApproval === "function") return normalizeToolApprovalStatus(await toolApproval({
		toolCall,
		tools,
		toolsContext,
		messages,
		runtimeContext
	}));
	const toolName = toolCall.toolName;
	const tool = getOwn(tools, toolName);
	const input = toolCall.input;
	const userDefinedToolApprovalStatus = getOwn(toolApproval, toolName);
	if (userDefinedToolApprovalStatus != null) return normalizeToolApprovalStatus(typeof userDefinedToolApprovalStatus === "function" ? await userDefinedToolApprovalStatus(input, {
		toolCallId: toolCall.toolCallId,
		messages,
		toolContext: await validateToolContext({
			toolName,
			context: getOwn(toolsContext, toolName),
			contextSchema: tool?.contextSchema
		}),
		runtimeContext
	}) : userDefinedToolApprovalStatus);
	if (tool?.needsApproval == null) return { type: "not-applicable" };
	return (typeof tool.needsApproval === "function" ? await tool.needsApproval(input, {
		toolCallId: toolCall.toolCallId,
		messages,
		context: await validateToolContext({
			toolName,
			context: getOwn(toolsContext, toolName),
			contextSchema: tool?.contextSchema
		})
	}) : tool.needsApproval) ? { type: "user-approval" } : { type: "not-applicable" };
}
function normalizeToolApprovalStatus(status) {
	return status === void 0 ? { type: "not-applicable" } : typeof status === "string" ? { type: status } : status;
}
/**
* Returns a shallow copy of the runtime context with only top-level
* properties marked for telemetry inclusion.
*/
function filterIncludedContext({ context, includeContext }) {
	if (context == null) return {};
	return Object.fromEntries(Object.entries(context).filter(([key]) => includeContext?.[key] === true));
}
function filterToolsContext({ toolsContext, includeToolsContext }) {
	if (includeToolsContext == null) return {};
	return Object.fromEntries(Object.entries(toolsContext).map(([toolName, toolContext]) => [toolName, filterToolContext({
		toolName,
		toolContext,
		includeToolsContext
	})]));
}
function filterToolContext({ toolName, toolContext, includeToolsContext }) {
	const includeToolContext = includeToolsContext?.[toolName];
	return filterIncludedContext({
		context: toolContext,
		includeContext: includeToolContext
	});
}
/**
* Creates an async callback that invokes the provided callbacks in parallel.
* Undefined callbacks are skipped, and thrown or rejected callback errors are
* ignored.
*
* @param callbacks The callbacks to invoke for each event.
* @returns A callback that forwards each event to all callbacks and waits for
* them to settle.
*/
function mergeCallbacks(...callbacks) {
	return async (event) => {
		await Promise.allSettled(callbacks.map(async (callback) => {
			await callback?.(event);
		}));
	};
}
var AI_SDK_TELEMETRY_TRACING_CHANNEL = "ai:telemetry";
function isNodeRuntime() {
	return globalThis.process?.release?.name === "node";
}
/**
* Apply provider-owned credential redaction on telemetry-only copies. Only visit SDK
* metadata containers, never arbitrary prompts, tool outputs, or user context.
*/
function redactTelemetryCredentials(value) {
	return replaceProperties(value, {
		args: redactTelemetryValue,
		tools: redactTools,
		stepTools: redactTools,
		request: redactMetadata,
		response: redactMetadata,
		steps: (steps) => mapArray(steps, redactTelemetryCredentials),
		finalStep: redactTelemetryCredentials,
		error: redactTelemetryCredentials,
		cause: redactTelemetryCredentials,
		errors: (errors) => mapArray(errors, redactTelemetryCredentials),
		lastError: redactTelemetryCredentials,
		requestBodyValues: redactBody
	});
}
function redactMetadata(value) {
	return Array.isArray(value) ? mapArray(value, redactMetadata) : replaceProperties(value, { body: redactBody });
}
function redactBody(value) {
	return replaceProperties(redactTelemetryValue(value), { tools: redactTools });
}
function redactTools(value) {
	if (Array.isArray(value)) return mapArray(value, redactTelemetryCredentials);
	if (!isRecord$2(value)) return value;
	return replaceProperties(value, Object.fromEntries(Object.keys(value).map((key) => [key, redactTelemetryCredentials])));
}
function isRecord$2(value) {
	return value != null && typeof value === "object" && !Array.isArray(value);
}
function mapArray(value, redact) {
	if (!Array.isArray(value)) return value;
	const copy = value.map(redact);
	return copy.some((entry, index) => entry !== value[index]) ? copy : value;
}
/** Preserve result getters, streams, and property descriptors without mutation. */
function replaceProperties(value, redactors) {
	if (!isRecord$2(value)) return value;
	let descriptors;
	for (const [key, redact] of Object.entries(redactors)) {
		const descriptor = Object.getOwnPropertyDescriptor(value, key);
		if (descriptor == null || !("value" in descriptor)) continue;
		const redacted = redact(descriptor.value);
		if (redacted !== descriptor.value) {
			descriptors ??= Object.getOwnPropertyDescriptors(value);
			descriptors[key] = {
				...descriptor,
				value: redacted
			};
		}
	}
	return descriptors == null ? value : Object.create(Object.getPrototypeOf(value), descriptors);
}
var diagnosticsChannelPromise;
/**
* Loads Node's diagnostics channel module only when the current runtime supports
* it. Unsupported runtimes and failed imports intentionally resolve to
* undefined so telemetry tracing never crashes user code.
*/
async function loadDiagnosticsChannel() {
	if (!isNodeRuntime()) return;
	if (diagnosticsChannelPromise == null) diagnosticsChannelPromise = Promise.resolve(loadBuiltinModule("node:diagnostics_channel"));
	return diagnosticsChannelPromise;
}
function loadBuiltinModule(id) {
	const processWithBuiltins = globalThis.process;
	try {
		return processWithBuiltins?.getBuiltinModule?.(id);
	} catch {
		return;
	}
}
/**
* Runs an async operation inside the AI SDK telemetry tracing channel when
* tracing subscribers may exist. Without Node diagnostics-channel support,
* without tracingChannel support, or when the runtime reports no subscribers,
* this is a direct pass-through.
*
* The execution bookkeeping preserves the original model/tool result or error
* if tracing itself throws, and prevents falling back by calling `execute` a
* second time.
*/
async function runWithTracingChannelSpan(message, execute, recordResult = true) {
	const tracingChannel = (await loadDiagnosticsChannel())?.tracingChannel?.(AI_SDK_TELEMETRY_TRACING_CHANNEL);
	if (tracingChannel == null || tracingChannel.hasSubscribers === false) return await execute();
	let executePromise;
	let executionResult;
	let executionError;
	let hasExecutionResult = false;
	let hasExecutionError = false;
	const tracedExecute = () => {
		try {
			executePromise = Promise.resolve(execute());
		} catch (error) {
			executePromise = Promise.reject(error);
		}
		executePromise = executePromise.then((result) => {
			executionResult = result;
			hasExecutionResult = true;
			return result;
		}, (error) => {
			executionError = error;
			hasExecutionError = true;
			throw error;
		});
		return recordResult ? executePromise.then(redactTelemetryCredentials, (error) => {
			throw redactTelemetryCredentials(error);
		}) : executePromise.then(() => void 0, () => {
			throw new Error("AI SDK operation failed");
		});
	};
	try {
		await tracingChannel.tracePromise(tracedExecute, message);
		return executionResult;
	} catch {
		if (hasExecutionError) throw executionError;
		if (hasExecutionResult) return executionResult;
		if (executePromise != null) return await executePromise;
		return await execute();
	}
}
/**
* Opens a long-lived tracing-channel span context and returns a runner that can
* re-enter that context later without changing stream setup timing.
*/
function openTelemetryChannelSpanContext({ message, completion, recordResult = true }) {
	if (!isNodeRuntime()) {
		Promise.resolve(completion).catch(() => {});
		return;
	}
	const diagnosticsChannel = loadBuiltinModule("node:diagnostics_channel");
	const asyncHooks = loadBuiltinModule("node:async_hooks");
	const tracingChannel = diagnosticsChannel?.tracingChannel?.(AI_SDK_TELEMETRY_TRACING_CHANNEL);
	if (tracingChannel == null || tracingChannel.hasSubscribers === false || asyncHooks == null) {
		Promise.resolve(completion).catch(() => {});
		return;
	}
	const context = message;
	let asyncResource;
	let asyncEndPublished = false;
	const safePublish = (publish) => {
		try {
			publish();
		} catch {}
	};
	const publishAsyncEnd = ({ result, error }) => {
		if (asyncEndPublished) return;
		asyncEndPublished = true;
		if (error !== void 0) {
			context.error = recordResult ? redactTelemetryCredentials(error) : /* @__PURE__ */ new Error("AI SDK operation failed");
			safePublish(() => tracingChannel.error.publish(context));
		}
		if (recordResult && result !== void 0) context.result = redactTelemetryCredentials(result);
		safePublish(() => tracingChannel.asyncEnd.publish(context));
	};
	safePublish(() => {
		tracingChannel.start.runStores(context, () => {
			asyncResource = new asyncHooks.AsyncResource("ai.telemetry");
		});
	});
	safePublish(() => tracingChannel.end.publish(context));
	Promise.resolve(completion).then((result) => publishAsyncEnd({ result }), (error) => publishAsyncEnd({ error }));
	return { run: (execute) => asyncResource == null ? execute() : asyncResource.runInAsyncScope(execute) };
}
function getGlobalTelemetryIntegrations() {
	return globalThis.AI_SDK_TELEMETRY_INTEGRATIONS ?? [];
}
/**
* Filters SDK-owned content fields on a copy. Only descend into SDK event
* containers; user context has its own inclusion policy.
*/
function filterTelemetryEvent(event, telemetry) {
	const hideInputs = telemetry.recordInputs === false;
	const hideOutputs = telemetry.recordOutputs === false;
	if (!hideInputs && !hideOutputs || event == null || typeof event !== "object") return event;
	const filtered = Object.assign(Object.create(Object.getPrototypeOf(event)), event);
	const replace = (fields) => {
		for (const [key, value] of Object.entries(fields)) if (Object.hasOwn(event, key)) filtered[key] = value;
	};
	const isSpeech = filtered.operationId === "ai.generateSpeech";
	if (hideInputs) {
		replace({
			instructions: void 0,
			system: void 0,
			prompt: void 0,
			messages: [],
			promptMessages: [],
			experimental_steeringMessages: [],
			tools: void 0,
			stepTools: void 0,
			schema: void 0,
			schemaName: void 0,
			schemaDescription: void 0,
			...typeof filtered.output === "object" ? { output: void 0 } : {},
			providerOptions: {},
			value: "",
			values: [],
			query: "",
			documents: [],
			state: Array.isArray(filtered.state) ? [] : typeof filtered.state === "string" ? "" : {},
			questions: {},
			...isSpeech ? { text: "" } : {}
		});
		if (filtered.toolCall != null) filtered.toolCall = {
			...filtered.toolCall,
			input: void 0
		};
		if (filtered.toolOutput != null) filtered.toolOutput = {
			...filtered.toolOutput,
			input: void 0
		};
		if (Array.isArray(filtered.ranking)) filtered.ranking = filtered.ranking.map((entry) => "document" in entry ? {
			...entry,
			document: typeof entry.document === "string" ? "" : {}
		} : entry);
	}
	if (hideOutputs) {
		replace({
			content: [],
			...!isSpeech ? { text: "" } : {},
			reasoning: Array.isArray(filtered.reasoning) ? [] : void 0,
			reasoningText: void 0,
			files: [],
			sources: [],
			toolCalls: [],
			staticToolCalls: [],
			dynamicToolCalls: [],
			toolResults: [],
			staticToolResults: [],
			dynamicToolResults: [],
			responseMessages: [],
			object: void 0,
			objectText: "",
			embedding: [],
			embeddings: [],
			ranking: [],
			answers: {},
			segments: [],
			words: []
		});
		if (filtered.toolOutput != null) filtered.toolOutput = {
			...filtered.toolOutput,
			output: void 0,
			error: void 0
		};
	}
	replace({
		providerMetadata: void 0,
		error: filtered.error == null ? filtered.error : /* @__PURE__ */ new Error("AI SDK operation failed")
	});
	for (const key of ["toolCall", "toolOutput"]) {
		const toolEvent = filtered[key];
		if (toolEvent != null && typeof toolEvent === "object") filtered[key] = {
			...toolEvent,
			providerMetadata: void 0,
			..."error" in toolEvent ? { error: toolEvent.error == null ? toolEvent.error : /* @__PURE__ */ new Error("AI SDK operation failed") } : {}
		};
	}
	for (const key of ["request", "response"]) {
		const filterMetadata = (metadata) => {
			if (metadata == null || typeof metadata !== "object") return metadata;
			const filteredMetadata = { ...metadata };
			delete filteredMetadata.body;
			if (key === "request" ? hideInputs : hideOutputs) {
				if ("messages" in metadata) filteredMetadata.messages = [];
				if ("instructions" in metadata) filteredMetadata.instructions = void 0;
			}
			return filteredMetadata;
		};
		const metadata = filtered[key];
		if (metadata != null) filtered[key] = Array.isArray(metadata) ? metadata.map(filterMetadata) : filterMetadata(metadata);
	}
	if (Array.isArray(filtered.steps)) filtered.steps = filtered.steps.map((step) => filterTelemetryEvent(step, telemetry));
	if (Object.hasOwn(event, "finalStep")) filtered.finalStep = filterTelemetryEvent(filtered.finalStep, telemetry);
	return filtered;
}
function augmentEvent(event, telemetry, filterContext = false) {
	const augmentedEvent = Object.assign(Object.create(Object.getPrototypeOf(event)), event, {
		recordInputs: telemetry.recordInputs,
		recordOutputs: telemetry.recordOutputs,
		functionId: telemetry.functionId,
		aiVersion: VERSION
	});
	if (filterContext && event != null && typeof event === "object" && "runtimeContext" in event) augmentedEvent.runtimeContext = filterIncludedContext({
		context: event.runtimeContext,
		includeContext: telemetry.includeRuntimeContext
	});
	if (filterContext && event != null && typeof event === "object") {
		if ("toolsContext" in event) augmentedEvent.toolsContext = filterToolsContext({
			toolsContext: event.toolsContext,
			includeToolsContext: telemetry.includeToolsContext
		});
		else if ("toolContext" in event && event.toolContext != null && "toolCall" in event && event.toolCall != null && typeof event.toolCall === "object" && "toolName" in event.toolCall) augmentedEvent.toolContext = filterToolContext({
			toolName: event.toolCall.toolName,
			toolContext: event.toolContext,
			includeToolsContext: telemetry.includeToolsContext
		});
	}
	return redactTelemetryCredentials(filterTelemetryEvent(augmentedEvent, telemetry));
}
/**
* Creates a telemetry dispatcher that sends telemetry events
* to the resolved set of integrations.
*
* When per-call integrations are provided, they take precedence over the globally
* registered integrations for that call. When no per-call integrations are
* provided, the globally registered integrations are used.
*
* @param args.telemetry - Optional per-call telemetry settings and integrations.
*
* @returns A telemetry dispatcher that fans out lifecycle events to the
* resolved set of integrations.
*/
function createTelemetryDispatcher({ telemetry }) {
	if (telemetry?.isEnabled === false) return {};
	const localIntegrations = telemetry?.integrations;
	const integrations = localIntegrations != null ? asArray(localIntegrations) : getGlobalTelemetryIntegrations();
	const telemetryMetadata = {
		recordInputs: telemetry?.recordInputs,
		recordOutputs: telemetry?.recordOutputs,
		functionId: telemetry?.functionId,
		includeRuntimeContext: telemetry?.includeRuntimeContext,
		includeToolsContext: telemetry?.includeToolsContext
	};
	const recordResult = telemetry?.recordInputs !== false && telemetry?.recordOutputs !== false;
	const mergeTelemetryCallback = (key, deprecatedKey) => {
		const integrationCallbacks = integrations.map((integration) => {
			const callback = integration[key] ?? (deprecatedKey == null ? void 0 : integration[deprecatedKey]);
			return typeof callback === "function" ? callback.bind(integration) : void 0;
		}).filter(Boolean).map((callback) => ((event) => callback(augmentEvent(event, telemetryMetadata))));
		if (integrationCallbacks.length === 0) return;
		const mergedIntegrationCallback = mergeCallbacks(...integrationCallbacks);
		return async (event) => {
			await mergedIntegrationCallback(event);
		};
	};
	const onStepEnd = mergeTelemetryCallback("onStepEnd");
	const onStepFinish = mergeTelemetryCallback("onStepFinish");
	const executeLanguageModelCallWrappers = integrations.map((integration) => integration.executeLanguageModelCall?.bind(integration)).filter(Boolean);
	const executeToolWrappers = integrations.map((integration) => integration.executeTool?.bind(integration)).filter(Boolean);
	return {
		runInTracingChannelSpan: async ({ type, event, execute }) => await runWithTracingChannelSpan({
			type,
			event: augmentEvent(event, telemetryMetadata, true)
		}, execute, recordResult),
		startTracingChannelContext: ({ type, event, completion }) => openTelemetryChannelSpanContext({
			message: {
				type,
				event: augmentEvent(event, telemetryMetadata, true)
			},
			completion,
			recordResult
		}),
		onStart: mergeTelemetryCallback("onStart"),
		onStepStart: mergeTelemetryCallback("onStepStart"),
		onLanguageModelCallStart: mergeTelemetryCallback("onLanguageModelCallStart"),
		onLanguageModelCallEnd: mergeTelemetryCallback("onLanguageModelCallEnd"),
		onToolExecutionStart: mergeTelemetryCallback("onToolExecutionStart"),
		onToolExecutionEnd: mergeTelemetryCallback("onToolExecutionEnd"),
		onStepEnd: onStepEnd == null && onStepFinish == null ? void 0 : mergeCallbacks(onStepEnd, onStepFinish),
		onStepError: mergeTelemetryCallback("onStepError"),
		onObjectStepStart: mergeTelemetryCallback("onObjectStepStart"),
		onObjectStepEnd: mergeTelemetryCallback("onObjectStepEnd"),
		onEmbedStart: mergeTelemetryCallback("onEmbedStart"),
		onEmbedEnd: mergeTelemetryCallback("onEmbedEnd"),
		onRerankStart: mergeTelemetryCallback("onRerankStart"),
		onRerankEnd: mergeTelemetryCallback("onRerankEnd"),
		experimental_onDecideStart: mergeTelemetryCallback("experimental_onDecideStart", "experimental_onEvaluateStart"),
		experimental_onDecisionModelCallStart: mergeTelemetryCallback("experimental_onDecisionModelCallStart", "experimental_onEvaluationModelCallStart"),
		experimental_onDecisionModelCallEnd: mergeTelemetryCallback("experimental_onDecisionModelCallEnd", "experimental_onEvaluationModelCallEnd"),
		experimental_onDecideEnd: mergeTelemetryCallback("experimental_onDecideEnd", "experimental_onEvaluateEnd"),
		experimental_onStreamTranscriptionStart: mergeTelemetryCallback("experimental_onStreamTranscriptionStart"),
		experimental_onStreamTranscriptionEnd: mergeTelemetryCallback("experimental_onStreamTranscriptionEnd"),
		onEnd: mergeTelemetryCallback("onEnd"),
		onAbort: mergeTelemetryCallback("onAbort"),
		onError: mergeTelemetryCallback("onError"),
		/**
		* Runs provider calls inside integration-specific context so
		* auto-instrumented provider requests can be associated with model work.
		*/
		executeLanguageModelCall: async ({ execute, ...event }) => {
			const augmentedEvent = augmentEvent(event, telemetryMetadata);
			let wrappedExecute = execute;
			for (const executeWrapper of executeLanguageModelCallWrappers) {
				const innerExecute = wrappedExecute;
				wrappedExecute = async () => {
					const originals = /* @__PURE__ */ new Map();
					const redact = (original) => {
						const redacted = redactTelemetryCredentials(original);
						if (redacted !== original) originals.set(redacted, original);
						return redacted;
					};
					const restore = (value) => originals.has(value) ? originals.get(value) : value;
					try {
						return restore(await executeWrapper({
							...augmentedEvent,
							execute: async () => {
								try {
									return redact(await innerExecute());
								} catch (error) {
									throw redact(error);
								}
							}
						}));
					} catch (error) {
						throw restore(error);
					}
				};
			}
			return await runWithTracingChannelSpan({
				type: "languageModelCall",
				event: augmentedEvent
			}, wrappedExecute, recordResult);
		},
		/**
		* Composes all `executeTool` wrappers around the original tool execution.
		* Each wrapper receives an `execute` function that calls the next wrapper in
		* the chain, so integrations can establish nested telemetry context before
		* delegating to the underlying tool.
		*/
		executeTool: async ({ execute, ...event }) => {
			const augmentedEvent = augmentEvent(event, telemetryMetadata);
			let wrappedExecute = execute;
			for (const executeWrapper of executeToolWrappers) {
				const innerExecute = wrappedExecute;
				wrappedExecute = () => executeWrapper({
					...augmentedEvent,
					execute: innerExecute
				});
			}
			return await wrappedExecute();
		}
	};
}
function asReasoningText(reasoningParts) {
	const reasoningText = reasoningParts.map((part) => "text" in part ? part.text : "").join("");
	return reasoningText.length > 0 ? reasoningText : void 0;
}
var DefaultStepResult = class {
	constructor({ callId, stepNumber, provider, modelId, runtimeContext, toolsContext, content, finishReason, rawFinishReason, usage, performance, warnings, request, response, providerMetadata, steeringMessages }) {
		this.callId = callId;
		this.stepNumber = stepNumber;
		this.model = {
			provider,
			modelId
		};
		this.runtimeContext = runtimeContext;
		this.toolsContext = toolsContext;
		this.content = content;
		this.finishReason = finishReason;
		this.rawFinishReason = rawFinishReason;
		this.usage = usage;
		this.performance = performance;
		this.warnings = warnings;
		this.request = request;
		this.response = response;
		this.providerMetadata = providerMetadata;
		if (steeringMessages != null && steeringMessages.length > 0) this.experimental_steeringMessages = steeringMessages;
	}
	get text() {
		return this.content.filter((part) => part.type === "text").map((part) => part.text).join("");
	}
	get reasoning() {
		return convertFromReasoningOutputs(this.content.filter((part) => part.type === "reasoning" || part.type === "reasoning-file"));
	}
	get reasoningText() {
		return asReasoningText(this.reasoning);
	}
	get files() {
		return this.content.filter((part) => part.type === "file").map((part) => part.file);
	}
	get sources() {
		return this.content.filter((part) => part.type === "source");
	}
	get toolCalls() {
		return this.content.filter((part) => part.type === "tool-call");
	}
	get staticToolCalls() {
		return this.toolCalls.filter((toolCall) => toolCall.dynamic !== true);
	}
	get dynamicToolCalls() {
		return this.toolCalls.filter((toolCall) => toolCall.dynamic === true);
	}
	get toolResults() {
		return this.content.filter((part) => part.type === "tool-result");
	}
	get staticToolResults() {
		return this.toolResults.filter((toolResult) => toolResult.dynamic !== true);
	}
	get dynamicToolResults() {
		return this.toolResults.filter((toolResult) => toolResult.dynamic === true);
	}
};
/**
* Creates a copy of a step result whose runtime context only contains
* top-level properties marked for telemetry inclusion.
*/
function restrictStepResult({ step, includeRuntimeContext, includeToolsContext }) {
	return new DefaultStepResult({
		callId: step.callId,
		stepNumber: step.stepNumber,
		provider: step.model.provider,
		modelId: step.model.modelId,
		runtimeContext: filterIncludedContext({
			context: step.runtimeContext,
			includeContext: includeRuntimeContext
		}),
		toolsContext: filterToolsContext({
			toolsContext: step.toolsContext,
			includeToolsContext
		}),
		content: step.content,
		finishReason: step.finishReason,
		rawFinishReason: step.rawFinishReason,
		usage: step.usage,
		performance: step.performance,
		warnings: step.warnings,
		request: step.request,
		response: step.response,
		providerMetadata: step.providerMetadata,
		steeringMessages: step.experimental_steeringMessages
	});
}
/**
* Creates a telemetry dispatcher that only includes configured runtime context
* properties in text-generation lifecycle events before dispatching them.
*/
function createRestrictedTelemetryDispatcher$3({ telemetry, includeRuntimeContext, includeToolsContext }) {
	const telemetryDispatcher = createTelemetryDispatcher({ telemetry });
	const restrictStepStartEvent = (event) => ({
		...event,
		runtimeContext: filterIncludedContext({
			context: event.runtimeContext,
			includeContext: includeRuntimeContext
		}),
		steps: event.steps.map((step) => restrictStepResult({
			step,
			includeRuntimeContext,
			includeToolsContext
		})),
		toolsContext: filterToolsContext({
			toolsContext: event.toolsContext,
			includeToolsContext
		})
	});
	return {
		...telemetryDispatcher,
		onStart: (event) => telemetryDispatcher.onStart?.({
			...event,
			runtimeContext: filterIncludedContext({
				context: event.runtimeContext,
				includeContext: includeRuntimeContext
			}),
			toolsContext: filterToolsContext({
				toolsContext: event.toolsContext,
				includeToolsContext
			})
		}),
		onStepStart: (event) => telemetryDispatcher.onStepStart?.(restrictStepStartEvent(event)),
		onStepEnd: (event) => telemetryDispatcher.onStepEnd?.(restrictStepResult({
			step: event,
			includeRuntimeContext,
			includeToolsContext
		})),
		onStepFinish: (event) => telemetryDispatcher.onStepEnd?.(restrictStepResult({
			step: event,
			includeRuntimeContext,
			includeToolsContext
		})),
		onStepError: (event) => telemetryDispatcher.onStepError?.(restrictStepStartEvent(event)),
		onEnd: (event) => telemetryDispatcher.onEnd?.(((restrictedSteps) => {
			return {
				...event,
				runtimeContext: filterIncludedContext({
					context: event.runtimeContext,
					includeContext: includeRuntimeContext
				}),
				steps: restrictedSteps,
				finalStep: restrictedSteps.at(-1),
				toolsContext: filterToolsContext({
					toolsContext: event.toolsContext,
					includeToolsContext
				})
			};
		})(event.steps.map((step) => restrictStepResult({
			step,
			includeRuntimeContext,
			includeToolsContext
		})))),
		onAbort: (event) => telemetryDispatcher.onAbort?.({
			...event,
			steps: event.steps.map((step) => restrictStepResult({
				step,
				includeRuntimeContext,
				includeToolsContext
			}))
		}),
		onToolExecutionStart: (event) => telemetryDispatcher.onToolExecutionStart?.({
			...event,
			toolContext: filterToolContext({
				toolName: event.toolCall.toolName,
				toolContext: event.toolContext,
				includeToolsContext
			})
		}),
		onToolExecutionEnd: (event) => telemetryDispatcher.onToolExecutionEnd?.({
			...event,
			toolContext: filterToolContext({
				toolName: event.toolCall.toolName,
				toolContext: event.toolContext,
				includeToolsContext
			})
		})
	};
}
createIdGenerator({
	prefix: "steer",
	size: 24
});
var steeringRunStarter = Symbol.for("vercel.ai.steering.start");
/**
* Starts a run for a steering object that was passed to a generation.
*/
function startSteeringRun(steering) {
	if (steering == null) return;
	const start = steering[steeringRunStarter];
	if (typeof start !== "function") throw new InvalidArgumentError({
		parameter: "experimental_steering",
		value: steering,
		message: "The steering object must be created with experimental_createSteering()."
	});
	return start.call(steering);
}
/**
* Creates a stop condition that returns `true` when the number of completed
* steps equals `stepCount`.
*
* @param stepCount - The number of steps to allow before stopping.
*/
function isStepCount(stepCount) {
	return ({ steps }) => steps.length === stepCount;
}
/**
* Evaluates the provided stop conditions for the current list of steps.
*
* Returns `true` as soon as any stop condition is met.
*
* @param stopConditions - The stop conditions to evaluate.
* @param steps - The completed steps accumulated so far.
*/
async function isStopConditionMet({ stopConditions, steps }) {
	return (await Promise.all(stopConditions.map((condition) => condition({ steps })))).some((result) => result);
}
/**
* Adds token counts while preserving an unknown total when both counts are
* unknown.
*/
function sumTokenCounts(tokenCount1, tokenCount2) {
	return tokenCount1 == null && tokenCount2 == null ? void 0 : (tokenCount1 ?? 0) + (tokenCount2 ?? 0);
}
/**
* Performs a deep-equal comparison of two parsed JSON objects.
*
* @param {any} obj1 - The first object to compare.
* @param {any} obj2 - The second object to compare.
* @returns {boolean} - Returns true if the two objects are deeply equal, false otherwise.
*/
function isDeepEqualData(obj1, obj2) {
	if (obj1 === obj2) return true;
	if (obj1 == null || obj2 == null) return false;
	if (typeof obj1 !== "object" && typeof obj2 !== "object") return obj1 === obj2;
	if (obj1.constructor !== obj2.constructor) return false;
	if (obj1 instanceof Date && obj2 instanceof Date) return obj1.getTime() === obj2.getTime();
	if (Array.isArray(obj1)) {
		if (obj1.length !== obj2.length) return false;
		for (let i = 0; i < obj1.length; i++) if (!isDeepEqualData(obj1[i], obj2[i])) return false;
		return true;
	}
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);
	if (keys1.length !== keys2.length) return false;
	for (const key of keys1) {
		if (!keys2.includes(key)) return false;
		if (!isDeepEqualData(obj1[key], obj2[key])) return false;
	}
	return true;
}
/**
* Converts the result of a `generateText` or `streamText` call to a list of response messages.
*/
async function toResponseMessages({ content: inputContent, tools }) {
	const responseMessages = [];
	const toolCallOrder = /* @__PURE__ */ new Map();
	const content = [];
	for (const part of inputContent) {
		if (part.type === "source") continue;
		if ((part.type === "tool-result" || part.type === "tool-error") && !part.providerExecuted) continue;
		if (part.type === "text" && part.text.length === 0 && part.providerMetadata == null) continue;
		switch (part.type) {
			case "text":
				content.push({
					type: "text",
					text: part.text,
					providerOptions: part.providerMetadata
				});
				break;
			case "custom":
				content.push({
					type: "custom",
					kind: part.kind,
					providerOptions: part.providerMetadata
				});
				break;
			case "reasoning":
				content.push({
					type: "reasoning",
					text: part.text,
					providerOptions: part.providerMetadata
				});
				break;
			case "file":
				content.push({
					type: "file",
					data: part.file.base64,
					mediaType: part.file.mediaType,
					providerOptions: part.providerMetadata
				});
				break;
			case "reasoning-file":
				content.push({
					type: "reasoning-file",
					data: part.file.base64,
					mediaType: part.file.mediaType,
					providerOptions: part.providerMetadata
				});
				break;
			case "tool-call":
				if (!toolCallOrder.has(part.toolCallId)) toolCallOrder.set(part.toolCallId, toolCallOrder.size);
				content.push({
					type: "tool-call",
					toolCallId: part.toolCallId,
					toolName: part.toolName,
					input: part.invalid && typeof part.input !== "object" ? {} : part.input,
					providerExecuted: part.providerExecuted,
					providerOptions: part.providerMetadata
				});
				break;
			case "tool-result": {
				const output = await createToolModelOutput({
					toolCallId: part.toolCallId,
					input: part.input,
					tool: getOwn(tools, part.toolName),
					output: part.output,
					errorMode: "none"
				});
				content.push({
					type: "tool-result",
					toolCallId: part.toolCallId,
					toolName: part.toolName,
					output,
					providerOptions: part.providerMetadata
				});
				break;
			}
			case "tool-error": {
				const output = await createToolModelOutput({
					toolCallId: part.toolCallId,
					input: part.input,
					tool: getOwn(tools, part.toolName),
					output: part.error,
					errorMode: "json"
				});
				content.push({
					type: "tool-result",
					toolCallId: part.toolCallId,
					toolName: part.toolName,
					output,
					providerOptions: part.providerMetadata
				});
				break;
			}
			case "tool-approval-request":
				const inputSchemaInput = getToolCallInputSchemaInput(part.toolCall);
				content.push({
					type: "tool-approval-request",
					approvalId: part.approvalId,
					toolCallId: part.toolCall.toolCallId,
					...part.reason != null ? { reason: part.reason } : {},
					isAutomatic: part.isAutomatic,
					...part.signature != null ? { signature: part.signature } : {},
					...inputSchemaInput != null && !isDeepEqualData(inputSchemaInput.value, part.toolCall.input) ? { inputSchemaInput: inputSchemaInput.value } : {}
				});
		}
	}
	if (content.length > 0) responseMessages.push({
		role: "assistant",
		content
	});
	const toolResultContent = [];
	for (const part of inputContent) {
		if (part.type !== "tool-approval-response" && part.type !== "tool-result" && part.type !== "tool-error") continue;
		if (part.type === "tool-approval-response") {
			toolResultContent.push({
				type: "tool-approval-response",
				approvalId: part.approvalId,
				approved: part.approved,
				reason: part.reason,
				providerExecuted: part.providerExecuted
			});
			if (part.approved === false) toolResultContent.push({
				type: "tool-result",
				toolCallId: part.toolCall.toolCallId,
				toolName: part.toolCall.toolName,
				output: {
					type: "execution-denied",
					reason: part.reason
				}
			});
			continue;
		}
		if (part.providerExecuted) continue;
		const output = await createToolModelOutput({
			toolCallId: part.toolCallId,
			input: part.input,
			tool: getOwn(tools, part.toolName),
			output: part.type === "tool-result" ? part.output : part.error,
			errorMode: part.type === "tool-error" ? "text" : "none"
		});
		toolResultContent.push({
			type: "tool-result",
			toolCallId: part.toolCallId,
			toolName: part.toolName,
			output,
			...part.providerMetadata != null ? { providerOptions: part.providerMetadata } : {}
		});
	}
	if (toolResultContent.length > 0) responseMessages.push({
		role: "tool",
		content: sortToolResultContentByToolCallOrder({
			toolResultContent,
			toolCallOrder
		})
	});
	return responseMessages;
}
function sortToolResultContentByToolCallOrder({ toolResultContent, toolCallOrder }) {
	const sortedToolResults = toolResultContent.filter((part) => part.type === "tool-result").map((part, index) => ({
		part,
		index
	})).sort((a, b) => {
		const aOrder = toolCallOrder.get(a.part.toolCallId);
		const bOrder = toolCallOrder.get(b.part.toolCallId);
		if (aOrder == null && bOrder == null) return a.index - b.index;
		if (aOrder == null) return 1;
		if (bOrder == null) return -1;
		return aOrder - bOrder || a.index - b.index;
	}).map(({ part }) => part);
	let toolResultIndex = 0;
	return toolResultContent.map((part) => part.type === "tool-result" ? sortedToolResults[toolResultIndex++] : part);
}
var encoder$1 = new TextEncoder();
/**
* Deterministic JSON serialization: object keys are sorted so that two
* structurally-equal values always produce the same string regardless of key
* insertion order. Used as the input to content hashing.
*/
function canonicalJSON(value) {
	if (value === null || value === void 0) return JSON.stringify(value);
	if (typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map((element) => element === void 0 ? "null" : canonicalJSON(element)).join(",")}]`;
	return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonicalJSON(value[k])}`).join(",")}}`;
}
function toBase64url(bytes) {
	return convertUint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
/**
* Canonical SHA-256 digest (base64url) of an arbitrary JSON-serializable value.
*/
async function hashCanonical(value) {
	const digest = await crypto.subtle.digest("SHA-256", encoder$1.encode(canonicalJSON(value)));
	return toBase64url(new Uint8Array(digest));
}
var encoder = new TextEncoder();
function fromBase64url(str) {
	return convertBase64ToUint8Array(str);
}
async function importKey(secret) {
	const keyData = typeof secret === "string" ? encoder.encode(secret) : secret;
	return crypto.subtle.importKey("raw", keyData, {
		name: "HMAC",
		hash: "SHA-256"
	}, false, ["sign", "verify"]);
}
function buildPayload(approvalId, toolCallId, toolName, inputDigest) {
	return encoder.encode(JSON.stringify([
		"ai-sdk-tool-approval-v1",
		approvalId,
		toolCallId,
		toolName,
		inputDigest
	]));
}
function buildLegacyPayload(approvalId, toolCallId, toolName, inputDigest) {
	return encoder.encode(`${approvalId}\n${toolCallId}\n${toolName}\n${inputDigest}`);
}
async function signToolApproval({ secret, approvalId, toolCallId, toolName, input }) {
	const key = await importKey(secret);
	const payload = buildPayload(approvalId, toolCallId, toolName, await hashCanonical(input));
	const sig = await crypto.subtle.sign("HMAC", key, payload);
	return toBase64url(new Uint8Array(sig));
}
async function verifyToolApprovalSignature({ secret, signature, approvalId, toolCallId, toolName, input }) {
	const key = await importKey(secret);
	const inputDigest = await hashCanonical(input);
	const sigBytes = fromBase64url(signature);
	const payload = buildPayload(approvalId, toolCallId, toolName, inputDigest);
	if (await crypto.subtle.verify("HMAC", key, sigBytes, payload)) return true;
	if (!approvalId.includes("\n") && !toolCallId.includes("\n") && !toolName.includes("\n")) {
		const legacyPayload = buildLegacyPayload(approvalId, toolCallId, toolName, inputDigest);
		return crypto.subtle.verify("HMAC", key, sigBytes, legacyPayload);
	}
	return false;
}
async function maybeSignApproval({ secret, approvalId, toolCallId, toolName, input }) {
	if (secret == null) return void 0;
	return signToolApproval({
		secret,
		approvalId,
		toolCallId,
		toolName,
		input
	});
}
/**
* Re-validates approved tool approvals reconstructed from client-supplied
* message history before they are executed. Checks HMAC signature (when
* configured), input schema, and approval policy.
*/
async function validateApprovedToolApprovals({ approvedToolApprovals, tools, toolApproval, messages, toolsContext, runtimeContext, toolApprovalSecret, refineToolInput }) {
	const approved = [];
	const denied = [];
	const invalid = [];
	for (const collectedApproval of approvedToolApprovals) {
		const tool = getOwn(tools, collectedApproval.toolCall.toolName);
		const { toolMetadata: _toolMetadata, dynamic: _dynamic, ...toolCallFromHistory } = collectedApproval.toolCall;
		const approval = {
			...collectedApproval,
			toolCall: {
				...toolCallFromHistory,
				...tool?.metadata != null ? { toolMetadata: tool.metadata } : {},
				...tool?.type === "dynamic" ? { dynamic: true } : {},
				title: tool?.title
			}
		};
		const { approvalRequest, toolCall } = approval;
		if (toolApprovalSecret != null) {
			if (approvalRequest.signature == null) throw new InvalidToolApprovalSignatureError({
				approvalId: approvalRequest.approvalId,
				toolCallId: toolCall.toolCallId,
				reason: "missing signature"
			});
			if (!await verifyToolApprovalSignature({
				secret: toolApprovalSecret,
				signature: approvalRequest.signature,
				approvalId: approvalRequest.approvalId,
				toolCallId: toolCall.toolCallId,
				toolName: toolCall.toolName,
				input: toolCall.input
			})) throw new InvalidToolApprovalSignatureError({
				approvalId: approvalRequest.approvalId,
				toolCallId: toolCall.toolCallId,
				reason: "invalid signature"
			});
		}
		if (isExecutableTool(tool) && tool.inputSchema != null) {
			const hasInputSchemaInput = Object.prototype.hasOwnProperty.call(approvalRequest, "inputSchemaInput");
			const validation = await safeValidateTypes({
				value: hasInputSchemaInput ? approvalRequest.inputSchemaInput : toolCall.input,
				schema: asSchema(tool.inputSchema)
			});
			let validationError;
			if (!validation.success) validationError = validation.error;
			else try {
				const revalidatedToolCall = await refineParsedToolCallInput({
					toolCall: {
						...toolCall,
						input: validation.value
					},
					refineToolInput
				});
				if (!isDeepEqualData(structuredClone(revalidatedToolCall.input), structuredClone(toolCall.input))) validationError = /* @__PURE__ */ new Error("Approved tool input does not match the validated schema output.");
			} catch (error) {
				validationError = error;
			}
			if (validationError != null) {
				invalid.push({
					...approval,
					error: new InvalidToolInputError({
						toolName: toolCall.toolName,
						toolInput: JSON.stringify(toolCall.input),
						cause: validationError
					})
				});
				continue;
			}
		}
		const approvalStatus = await resolveToolApproval({
			tools,
			toolApproval,
			toolCall,
			messages,
			toolsContext,
			runtimeContext
		});
		if (approvalStatus.type === "denied") denied.push({
			...approval,
			approvalResponse: {
				...approval.approvalResponse,
				approved: false,
				reason: approvalStatus.reason ?? approval.approvalResponse.reason
			}
		});
		else approved.push(approval);
	}
	return {
		approvedToolApprovals: approved,
		deniedToolApprovals: denied,
		invalidToolApprovals: invalid
	};
}
/**
* Validates the maximum number of tool calls that may execute concurrently.
*/
function prepareToolCallConcurrency(toolCallConcurrency) {
	if (toolCallConcurrency == null) return;
	if (!Number.isInteger(toolCallConcurrency)) throw new InvalidArgumentError({
		parameter: "toolCallConcurrency",
		value: toolCallConcurrency,
		message: "toolCallConcurrency must be an integer"
	});
	if (toolCallConcurrency < 1) throw new InvalidArgumentError({
		parameter: "toolCallConcurrency",
		value: toolCallConcurrency,
		message: "toolCallConcurrency must be >= 1"
	});
	return toolCallConcurrency;
}
/**
* Maps items with an optional concurrency limit while preserving result order.
*
* Workers claim items in input order. When the signal is aborted or an
* execution rejects, no additional queued items are started.
*/
async function mapWithConcurrency({ items, concurrency, abortSignal, execute }) {
	if (concurrency == null || concurrency >= items.length) return Promise.all(items.map(execute));
	const results = new Array(items.length);
	let nextIndex = 0;
	let stopped = false;
	const worker = async () => {
		while (!stopped) {
			abortSignal?.throwIfAborted();
			const index = nextIndex++;
			if (index >= items.length) return;
			try {
				results[index] = await execute(items[index], index);
			} catch (error) {
				stopped = true;
				throw error;
			}
		}
	};
	await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
	return results;
}
var originalGenerateId$4 = createIdGenerator({
	prefix: "aitxt",
	size: 24
});
var originalGenerateCallId$9 = createIdGenerator({
	prefix: "call",
	size: 24
});
/**
* Generate a text and call tools for a given prompt using a language model.
*
* This function does not stream the output. If you want to stream the output, use `streamText` instead.
*
* @param model - The language model to use.
*
* @param tools - Tools that are accessible to and can be called by the model. The model needs to support calling tools.
* @param toolChoice - The tool choice strategy. Default: 'auto'.
* @param toolOrder - Controls the order in which tools are sent to the provider. Tools not listed are appended alphabetically.
* @param toolCallConcurrency - Maximum number of tool calls that may execute concurrently within a step. Set to 1 for sequential execution. Default: unlimited.
*
* @param system - A system message that will be part of the prompt.
* @param prompt - A simple text prompt. You can either use `prompt` or `messages` but not both.
* @param messages - A list of messages. You can either use `prompt` or `messages` but not both.
* @param allowSystemInMessages - Whether system messages are allowed in the `prompt` or `messages` fields. Default: false.
*
* @param maxOutputTokens - Maximum number of tokens to generate.
* @param temperature - Temperature setting.
* The value is passed through to the provider. The range depends on the provider and model.
* It is recommended to set either `temperature` or `topP`, but not both.
* @param topP - Nucleus sampling.
* The value is passed through to the provider. The range depends on the provider and model.
* It is recommended to set either `temperature` or `topP`, but not both.
* @param topK - Only sample from the top K options for each subsequent token.
* Used to remove "long tail" low probability responses.
* Recommended for advanced use cases only. You usually only need to use temperature.
* @param presencePenalty - Presence penalty setting.
* It affects the likelihood of the model to repeat information that is already in the prompt.
* The value is passed through to the provider. The range depends on the provider and model.
* @param frequencyPenalty - Frequency penalty setting.
* It affects the likelihood of the model to repeatedly use the same words or phrases.
* The value is passed through to the provider. The range depends on the provider and model.
* @param stopSequences - Stop sequences.
* If set, the model will stop generating text when one of the stop sequences is generated.
* @param seed - The seed (integer) to use for random sampling.
* If set and supported by the model, calls will generate deterministic results.
*
* @param maxRetries - Maximum number of retries. Set to 0 to disable retries. Default: 2.
* @param abortSignal - An optional abort signal that can be used to cancel the call.
* @param timeout - An optional timeout in milliseconds. The call will be aborted if it takes longer than the specified timeout.
* @param headers - Additional HTTP headers to be sent with the request. Only applicable for HTTP-based providers.
*
* @param experimental_sandbox - The sandbox environment that is passed through to tool execution.
* @param experimental_steering - A steering object that adds user messages to the generation at the next step boundary.
* @param runtimeContext - User-defined runtime context that flows through the entire generation lifecycle.
* @param experimental_refineToolInput - Optional mapping of tool names to functions that refine parsed tool inputs before tools are executed and before outputs, callbacks, and telemetry are recorded.
* @param onStart - Callback invoked when generation begins, before any LLM calls.
* @param experimental_onStart - Deprecated alias for `onStart`.
* @param onStepStart - Callback invoked when each step begins, before the provider is called.
* @param experimental_onStepStart - Deprecated alias for `onStepStart`.
* Receives step number, messages (in ModelMessage format), tools, and runtimeContext.
* @param onLanguageModelCallStart - Callback invoked immediately before each provider model call begins.
* @param experimental_onLanguageModelCallStart - Deprecated alias for `onLanguageModelCallStart`.
* @param onLanguageModelCallEnd - Callback invoked after each provider model call response is normalized and parsed.
* @param experimental_onLanguageModelCallEnd - Deprecated alias for `onLanguageModelCallEnd`.
* @param onToolExecutionStart - Callback invoked before each tool execution begins.
* Receives tool name, call ID, input, and context.
* @param experimental_onToolCallStart - Deprecated alias for `onToolExecutionStart`.
* @param onToolExecutionEnd - Callback invoked after each tool execution completes.
* Uses a discriminated union: check `success` to determine if `output` or `error` is present.
* @param experimental_onToolCallFinish - Deprecated alias for `onToolExecutionEnd`.
* @param onStepFinish - Callback that is called when each step (LLM call) is finished, including intermediate steps.
* @param onStepError - Callback that is called when a step that started fails before it produces a step result, i.e. when the provider call throws or rejects, or when the call is aborted or times out.
* @param onEnd - Callback that is called when all steps are finished and the response is complete.
* @param onFinish - Deprecated alias for `onEnd`.
*
* @returns
* A result object that contains the generated text, the results of the tool calls, and additional information.
*/
async function generateText(options) {
	const steeringRun = startSteeringRun(options.experimental_steering);
	try {
		return await generateTextInternal(options, steeringRun);
	} catch (error) {
		steeringRun?.end(options.abortSignal?.aborted ? "aborted" : "error");
		throw error;
	}
}
async function generateTextInternal({ model: modelArg, tools, toolChoice, instructions, system, prompt, messages, allowSystemInMessages, maxRetries: maxRetriesArg, abortSignal, timeout, headers, stopWhen = isStepCount(1), experimental_sandbox: sandbox, output, toolApproval, experimental_toolCallers, experimental_toolApprovalSecret, experimental_telemetry, telemetry = experimental_telemetry, providerOptions, activeTools, toolOrder, toolCallConcurrency, prepareStep, experimental_repairToolCall, repairToolCall = experimental_repairToolCall, experimental_refineToolInput: refineToolInput, experimental_download: download, runtimeContext = {}, toolsContext = {}, experimental_include, include = experimental_include, _internal: { generateId = originalGenerateId$4, generateCallId = originalGenerateCallId$9, now: now$4 = now } = {}, onStart, experimental_onStart, onStepStart, experimental_onStepStart, onLanguageModelCallStart, experimental_onLanguageModelCallStart, onLanguageModelCallEnd, experimental_onLanguageModelCallEnd, onToolExecutionStart, onToolExecutionEnd, experimental_onToolCallStart, experimental_onToolCallFinish, onStepEnd, onStepError, onStepFinish, onFinish, onEnd = onFinish, ...settings }, steeringRun) {
	include = {
		requestBody: include?.requestBody ?? false,
		requestMessages: include?.requestMessages ?? false,
		responseBody: include?.responseBody ?? false
	};
	const resolvedToolCallConcurrency = prepareToolCallConcurrency(toolCallConcurrency);
	const model = resolveLanguageModel(modelArg);
	const resolvedToolCallers = resolveToolCallerConfiguration({
		tools,
		toolCallers: experimental_toolCallers
	});
	const prepareToolSearch = createToolSearchState({
		tools,
		toolCallers: resolvedToolCallers
	});
	const stopConditions = asArray(stopWhen);
	const resolvedOnStart = onStart ?? experimental_onStart;
	const resolvedOnStepStart = onStepStart ?? experimental_onStepStart;
	const resolvedOnLanguageModelCallStart = onLanguageModelCallStart ?? experimental_onLanguageModelCallStart;
	const resolvedOnLanguageModelCallEnd = onLanguageModelCallEnd ?? experimental_onLanguageModelCallEnd;
	const resolvedOnToolExecutionStart = onToolExecutionStart ?? experimental_onToolCallStart;
	const resolvedOnToolExecutionEnd = onToolExecutionEnd ?? experimental_onToolCallFinish;
	const resolvedOnStepEnd = onStepEnd ?? onStepFinish;
	const unsupportedTimeoutWarnings = [];
	if (getFirstChunkTimeoutMs(timeout) != null) unsupportedTimeoutWarnings.push({
		type: "unsupported",
		feature: "timeout.firstChunkMs",
		details: "The firstChunkMs timeout is only supported by streaming functions."
	});
	if (getChunkTimeoutMs(timeout) != null) unsupportedTimeoutWarnings.push({
		type: "unsupported",
		feature: "timeout.chunkMs",
		details: "The chunkMs timeout is only supported by streaming functions."
	});
	if (unsupportedTimeoutWarnings.length > 0) logWarnings({
		warnings: unsupportedTimeoutWarnings,
		provider: model.provider,
		model: model.modelId
	});
	const totalTimeoutMs = getTotalTimeoutMs(timeout);
	const stepTimeoutMs = getStepTimeoutMs(timeout);
	const stepAbortController = stepTimeoutMs != null ? new AbortController() : void 0;
	const mergedAbortSignal = mergeAbortSignals(abortSignal, totalTimeoutMs, stepAbortController?.signal);
	const { maxRetries, retry } = prepareRetries({
		maxRetries: maxRetriesArg,
		abortSignal: mergedAbortSignal
	});
	const callSettings = prepareLanguageModelCallOptions(settings);
	const headersWithUserAgent = withUserAgentSuffix(headers ?? {}, `ai/${VERSION}`);
	const initialPrompt = await standardizePrompt({
		instructions,
		system,
		prompt,
		messages,
		allowSystemInMessages
	});
	const callId = generateCallId();
	const telemetryDispatcher = createRestrictedTelemetryDispatcher$3({
		telemetry,
		includeRuntimeContext: telemetry?.includeRuntimeContext,
		includeToolsContext: telemetry?.includeToolsContext
	});
	const runInTracingChannelSpan = telemetryDispatcher.runInTracingChannelSpan ?? (async ({ execute }) => await execute());
	const generateTextStartEvent = {
		callId,
		operationId: "ai.generateText",
		provider: model.provider,
		modelId: model.modelId,
		instructions: initialPrompt.instructions,
		messages: initialPrompt.messages,
		tools,
		toolChoice,
		activeTools,
		toolOrder,
		maxOutputTokens: callSettings.maxOutputTokens,
		temperature: callSettings.temperature,
		topP: callSettings.topP,
		topK: callSettings.topK,
		presencePenalty: callSettings.presencePenalty,
		frequencyPenalty: callSettings.frequencyPenalty,
		stopSequences: callSettings.stopSequences,
		seed: callSettings.seed,
		reasoning: callSettings.reasoning,
		maxRetries,
		timeout,
		headers: headersWithUserAgent,
		providerOptions,
		output,
		runtimeContext,
		toolsContext
	};
	const executeGenerateText = async () => {
		await notify({
			event: generateTextStartEvent,
			callbacks: [resolvedOnStart, telemetryDispatcher.onStart]
		});
		let openStep;
		try {
			const initialMessages = initialPrompt.messages;
			const initialResponseMessages = [];
			const { approvedToolApprovals, deniedToolApprovals: collectedDeniedToolApprovals } = collectToolApprovals({ messages: initialMessages });
			const { approvedToolApprovals: localApprovedToolApprovals, deniedToolApprovals: revalidationDeniedToolApprovals, invalidToolApprovals } = await validateApprovedToolApprovals({
				approvedToolApprovals: approvedToolApprovals.filter((toolApproval) => !toolApproval.toolCall.providerExecuted),
				tools,
				toolApproval,
				messages: initialMessages,
				toolsContext,
				runtimeContext,
				toolApprovalSecret: experimental_toolApprovalSecret,
				refineToolInput
			});
			const deniedToolApprovalsWithoutResults = [...collectedDeniedToolApprovals, ...revalidationDeniedToolApprovals].filter((toolApproval) => toolApproval.existingToolResult == null);
			if (deniedToolApprovalsWithoutResults.length > 0 || localApprovedToolApprovals.length > 0 || invalidToolApprovals.length > 0) {
				const toolResults = await executeTools({
					toolCalls: localApprovedToolApprovals.map((toolApproval) => toolApproval.toolCall),
					tools,
					callId,
					messages: initialMessages,
					abortSignal: mergedAbortSignal,
					timeout,
					experimental_sandbox: sandbox,
					toolsContext,
					onToolExecutionStart: (event) => notify({
						event,
						callbacks: [resolvedOnToolExecutionStart, telemetryDispatcher.onToolExecutionStart]
					}),
					onToolExecutionEnd: (event) => notify({
						event,
						callbacks: [resolvedOnToolExecutionEnd, telemetryDispatcher.onToolExecutionEnd]
					}),
					executeToolInTelemetryContext: telemetryDispatcher.executeTool,
					runInTracingChannelSpan,
					toolCallConcurrency: resolvedToolCallConcurrency
				});
				const toolContent = [];
				for (const result of toolResults) {
					const output = result.output;
					const modelOutput = await createToolModelOutput({
						toolCallId: output.toolCallId,
						input: output.input,
						tool: getOwn(tools, output.toolName),
						output: output.type === "tool-result" ? output.output : output.error,
						errorMode: output.type === "tool-error" ? "text" : "none"
					});
					toolContent.push({
						type: "tool-result",
						toolCallId: output.toolCallId,
						toolName: output.toolName,
						output: modelOutput
					});
				}
				for (const toolApproval of invalidToolApprovals) toolContent.push({
					type: "tool-result",
					toolCallId: toolApproval.toolCall.toolCallId,
					toolName: toolApproval.toolCall.toolName,
					output: await createToolModelOutput({
						toolCallId: toolApproval.toolCall.toolCallId,
						input: toolApproval.toolCall.input,
						tool: getOwn(tools, toolApproval.toolCall.toolName),
						output: toolApproval.error,
						errorMode: "text"
					})
				});
				for (const toolApproval of deniedToolApprovalsWithoutResults) toolContent.push({
					type: "tool-result",
					toolCallId: toolApproval.toolCall.toolCallId,
					toolName: toolApproval.toolCall.toolName,
					output: {
						type: "execution-denied",
						reason: toolApproval.approvalResponse.reason,
						...toolApproval.toolCall.providerExecuted && { providerOptions: { openai: { approvalId: toolApproval.approvalResponse.approvalId } } }
					}
				});
				initialResponseMessages.push({
					role: "tool",
					content: toolContent
				});
			}
			const callSettings = prepareLanguageModelCallOptions(settings);
			let currentModelResponse;
			let clientToolCalls = [];
			let clientToolOutputs = [];
			let toolApprovalResponses = [];
			let deniedToolApprovalResponses = [];
			const steps = [];
			let instructionsForNextStep = initialPrompt.instructions;
			let messagesForNextStep = [...initialMessages, ...initialResponseMessages];
			const pendingDeferredToolCalls = /* @__PURE__ */ new Map();
			let steeringEndReason = "finished";
			const shouldStartNextStep = async () => {
				if (steps[steps.length - 1].finishReason === "interrupted") return false;
				if (clientToolOutputs.length + deniedToolApprovalResponses.length !== clientToolCalls.length) {
					steeringEndReason = "waiting-for-tool-results";
					return false;
				}
				if (clientToolCalls.length === 0 && pendingDeferredToolCalls.size === 0) {
					const isTruncated = steps[steps.length - 1].finishReason === "length" || steps[steps.length - 1].finishReason === "content-filter";
					if (!steeringRun?.hasPendingMessages() && (isTruncated || !steeringRun?.promoteQueuedMessage())) return false;
					if (steps[steps.length - 1].finishReason === "error") {
						steeringEndReason = "error";
						return false;
					}
				}
				if (await isStopConditionMet({
					stopConditions,
					steps
				})) {
					steeringEndReason = "stop-condition";
					return false;
				}
				return true;
			};
			do {
				if (steps.length > 0) mergedAbortSignal?.throwIfAborted();
				const stepTimeoutId = setAbortTimeout({
					abortController: stepAbortController,
					label: "Step",
					timeoutMs: stepTimeoutMs
				});
				const stepNumber = steps.length;
				const steeringMessages = steeringRun?.takeMessages() ?? [];
				if (steeringMessages.length > 0) messagesForNextStep = [...messagesForNextStep, ...steeringMessages];
				try {
					await runInTracingChannelSpan({
						type: "step",
						event: {
							callId,
							stepNumber
						},
						execute: async () => {
							const accumulatedResponseMessages = [...initialResponseMessages, ...steps.flatMap((step) => step.response.messages)];
							const stepInputMessages = messagesForNextStep;
							const prepareStepResult = await prepareStep?.({
								model,
								steps,
								stepNumber: steps.length,
								instructions: instructionsForNextStep,
								initialInstructions: initialPrompt.instructions,
								messages: stepInputMessages,
								initialMessages,
								responseMessages: accumulatedResponseMessages,
								...steeringMessages.length > 0 ? { experimental_steeringMessages: steeringMessages } : {},
								runtimeContext,
								toolsContext,
								experimental_sandbox: sandbox
							});
							const stepSandbox = prepareStepResult?.experimental_sandbox ?? sandbox;
							const stepModel = resolveLanguageModel(prepareStepResult?.model ?? model);
							const stepInstructions = prepareStepResult?.instructions ?? prepareStepResult?.system ?? instructionsForNextStep;
							runtimeContext = prepareStepResult?.runtimeContext ?? runtimeContext;
							toolsContext = prepareStepResult?.toolsContext ?? toolsContext;
							const stepActiveTools = filterActiveTools({
								tools,
								activeTools: prepareStepResult?.activeTools ?? activeTools
							});
							const { executionTools, modelTools: stepModelTools, toolCallerMessages } = prepareToolsForToolCallers({
								tools: prepareToolSearch(stepActiveTools, {
									toolsContext,
									experimental_sandbox: stepSandbox
								}),
								toolCallers: resolvedToolCallers
							});
							const stepToolOrder = prepareStepResult?.toolOrder ?? toolOrder;
							const stepTools = await prepareTools({
								tools: stepModelTools,
								toolOrder: stepToolOrder,
								toolsContext,
								experimental_sandbox: stepSandbox
							});
							const stepToolChoice = prepareToolChoice({ toolChoice: prepareStepResult?.toolChoice ?? toolChoice });
							const stepExecutionTools = stepToolChoice.type === "none" ? void 0 : executionTools;
							const stepMessages = appendToolCallerMessages({
								messages: prepareStepResult?.messages ?? stepInputMessages,
								toolCallerMessages
							});
							const deliveredSteeringMessages = (steeringRun?.resolveTakenMessages({
								stepNumber,
								sentMessages: stepMessages
							}) ?? []).map(({ message }) => message);
							const promptMessages = await convertToLanguageModelPrompt({
								prompt: {
									instructions: stepInstructions,
									messages: stepMessages
								},
								supportedUrls: await stepModel.supportedUrls,
								download,
								abortSignal: mergedAbortSignal,
								provider: stepModel.provider.split(".")[0]
							});
							const stepProviderOptions = mergeObjects(providerOptions, prepareStepResult?.providerOptions);
							const stepCallSettings = prepareStepCallSettings({
								callSettings,
								stepSettings: prepareStepResult
							});
							const stepStartEvent = {
								callId,
								provider: stepModel.provider,
								modelId: stepModel.modelId,
								stepNumber,
								instructions: stepInstructions,
								messages: stepMessages,
								tools,
								toolChoice: prepareStepResult?.toolChoice ?? toolChoice,
								activeTools: prepareStepResult?.activeTools ?? activeTools,
								toolOrder: stepToolOrder,
								steps: [...steps],
								providerOptions: stepProviderOptions,
								output,
								runtimeContext,
								promptMessages,
								stepTools,
								stepToolChoice,
								toolsContext
							};
							await notify({
								event: stepStartEvent,
								callbacks: [resolvedOnStepStart, telemetryDispatcher.onStepStart]
							});
							openStep = stepStartEvent;
							const languageModelCallContext = {
								provider: stepModel.provider,
								modelId: stepModel.modelId,
								instructions: stepInstructions,
								messages: stepMessages,
								tools: stepTools,
								...stepCallSettings
							};
							const languageModelCallStartEvent = {
								callId,
								...languageModelCallContext
							};
							const stepStartTimestampMs = now$4();
							await notify({
								event: languageModelCallStartEvent,
								callbacks: [resolvedOnLanguageModelCallStart, telemetryDispatcher.onLanguageModelCallStart]
							});
							const executeLanguageModelCallInTelemetryContext = telemetryDispatcher.executeLanguageModelCall ?? (async ({ execute }) => await execute());
							currentModelResponse = await retry(async () => {
								const result = await executeLanguageModelCallInTelemetryContext({
									...languageModelCallStartEvent,
									execute: async () => {
										const result = await stepModel.doGenerate({
											...stepCallSettings,
											tools: stepTools,
											toolChoice: stepToolChoice,
											responseFormat: await output?.responseFormat,
											prompt: promptMessages,
											providerOptions: stepProviderOptions,
											abortSignal: mergedAbortSignal,
											headers: headersWithUserAgent
										});
										return {
											...result,
											...result.request && { request: sanitizeRequestMetadata(result.request) }
										};
									}
								});
								return {
									...result,
									response: {
										id: result.response?.id ?? generateId(),
										timestamp: result.response?.timestamp ?? /* @__PURE__ */ new Date(),
										modelId: result.response?.modelId ?? stepModel.modelId,
										headers: result.response?.headers,
										body: result.response?.body
									}
								};
							});
							const responseTimeMs = now$4() - stepStartTimestampMs;
							const stepUsage = asLanguageModelUsage(currentModelResponse.usage);
							const stepToolCalls = await Promise.all(currentModelResponse.content.filter((part) => part.type === "tool-call").map((toolCall) => parseToolCall({
								toolCall,
								tools: stepModelTools,
								repairToolCall: stepToolChoice.type === "none" ? void 0 : repairToolCall,
								refineToolInput: stepToolChoice.type === "none" ? void 0 : refineToolInput,
								instructions: stepInstructions,
								messages: stepMessages,
								abortSignal: mergedAbortSignal
							})));
							const toolApprovalRequests = {};
							const stepToolApprovalResponses = {};
							const blockedToolCallIds = /* @__PURE__ */ new Set();
							const generatedFileDataCache = /* @__PURE__ */ new WeakMap();
							const modelCallContent = await convertLanguageModelContent({
								content: currentModelResponse.content,
								toolCalls: stepToolCalls,
								toolOutputs: [],
								toolApprovalRequests: [],
								toolApprovalResponses: [],
								tools,
								abortSignal: mergedAbortSignal,
								generatedFileDataCache
							});
							await notify({
								event: {
									callId,
									provider: stepModel.provider,
									modelId: currentModelResponse.response.modelId,
									finishReason: currentModelResponse.finishReason.unified,
									usage: stepUsage,
									content: modelCallContent,
									responseId: currentModelResponse.response.id,
									...currentModelResponse.request?.url != null ? { request: { url: getRequestOrigin(currentModelResponse.request.url) } } : {},
									...currentModelResponse.providerMetadata != null ? { providerMetadata: currentModelResponse.providerMetadata } : {},
									performance: {
										responseTimeMs,
										effectiveOutputTokensPerSecond: calculateTokensPerSecond({
											tokens: stepUsage.outputTokens,
											durationMs: responseTimeMs
										}),
										outputTokensPerSecond: void 0,
										inputTokensPerSecond: void 0,
										effectiveTotalTokensPerSecond: calculateTokensPerSecond({
											tokens: sumTokenCounts(stepUsage.inputTokens, stepUsage.outputTokens),
											durationMs: responseTimeMs
										}),
										timeToFirstOutputMs: void 0
									}
								},
								callbacks: [resolvedOnLanguageModelCallEnd, telemetryDispatcher.onLanguageModelCallEnd]
							});
							const enforcedToolChoice = stepToolChoice.type === "auto" ? void 0 : stepToolChoice;
							if (enforcedToolChoice != null && (enforcedToolChoice.type === "none" ? stepToolCalls.length > 0 : currentModelResponse.finishReason.unified !== "interrupted" && !stepToolCalls.some((toolCall) => enforcedToolChoice.type === "required" || toolCall.toolName === enforcedToolChoice.toolName))) throw new ToolChoiceViolationError({
								toolChoice: enforcedToolChoice,
								finishReason: currentModelResponse.finishReason.unified,
								provider: stepModel.provider,
								modelId: stepModel.modelId,
								content: currentModelResponse.content
							});
							for (const toolCall of stepToolCalls) {
								if (toolCall.invalid) continue;
								const tool = getOwn(stepExecutionTools, toolCall.toolName);
								if (tool == null) continue;
								if (tool.onInputStart != null || tool.onInputAvailable != null) {
									const context = await validateToolContext({
										toolName: toolCall.toolName,
										context: getOwn(toolsContext, toolCall.toolName),
										contextSchema: tool.contextSchema
									});
									if (tool.onInputStart != null) await tool.onInputStart({
										toolCallId: toolCall.toolCallId,
										messages: stepMessages,
										abortSignal: mergedAbortSignal,
										context
									});
									if (tool.onInputAvailable != null) await tool.onInputAvailable({
										input: toolCall.input,
										toolCallId: toolCall.toolCallId,
										messages: stepMessages,
										abortSignal: mergedAbortSignal,
										context
									});
								}
								const toolApprovalStatus = await resolveToolApproval({
									tools: stepExecutionTools,
									toolApproval,
									toolCall,
									messages: stepMessages,
									toolsContext,
									runtimeContext
								});
								if (toolApprovalStatus.type === "not-applicable") continue;
								const approvalId = generateId();
								const signature = await maybeSignApproval({
									secret: experimental_toolApprovalSecret,
									approvalId,
									toolCallId: toolCall.toolCallId,
									toolName: toolCall.toolName,
									input: toolCall.input
								});
								switch (toolApprovalStatus.type) {
									case "user-approval":
										toolApprovalRequests[toolCall.toolCallId] = {
											type: "tool-approval-request",
											approvalId,
											toolCall,
											...toolApprovalStatus.reason != null ? { reason: toolApprovalStatus.reason } : {},
											...signature != null ? { signature } : {}
										};
										blockedToolCallIds.add(toolCall.toolCallId);
										break;
									case "approved":
										toolApprovalRequests[toolCall.toolCallId] = {
											type: "tool-approval-request",
											approvalId,
											toolCall,
											isAutomatic: true,
											...signature != null ? { signature } : {}
										};
										stepToolApprovalResponses[toolCall.toolCallId] = {
											type: "tool-approval-response",
											approvalId,
											toolCall,
											approved: true,
											reason: toolApprovalStatus.reason,
											providerExecuted: toolCall.providerExecuted
										};
										break;
									case "denied":
										toolApprovalRequests[toolCall.toolCallId] = {
											type: "tool-approval-request",
											approvalId,
											toolCall,
											isAutomatic: true,
											...signature != null ? { signature } : {}
										};
										stepToolApprovalResponses[toolCall.toolCallId] = {
											type: "tool-approval-response",
											approvalId,
											toolCall,
											approved: false,
											reason: toolApprovalStatus.reason,
											providerExecuted: toolCall.providerExecuted
										};
										blockedToolCallIds.add(toolCall.toolCallId);
								}
							}
							const invalidToolCalls = stepToolCalls.filter((toolCall) => toolCall.invalid && toolCall.dynamic && !toolCall.providerExecuted);
							clientToolOutputs = [];
							for (const toolCall of invalidToolCalls) clientToolOutputs.push({
								type: "tool-error",
								toolCallId: toolCall.toolCallId,
								toolName: toolCall.toolName,
								input: toolCall.input,
								error: getErrorMessage(toolCall.error),
								dynamic: true
							});
							clientToolCalls = stepToolCalls.filter((toolCall) => !toolCall.providerExecuted);
							toolApprovalResponses = Object.values(stepToolApprovalResponses);
							deniedToolApprovalResponses = toolApprovalResponses.filter((toolApprovalResponse) => toolApprovalResponse.approved === false);
							const toolExecutionMs = {};
							if (stepExecutionTools != null && isToolExecutionAllowedFinishReason(currentModelResponse.finishReason.unified)) {
								const toolExecutionResults = await executeTools({
									toolCalls: clientToolCalls.filter((toolCall) => !toolCall.invalid && !blockedToolCallIds.has(toolCall.toolCallId)),
									tools: stepExecutionTools,
									callId,
									messages: stepMessages,
									abortSignal: mergedAbortSignal,
									timeout,
									experimental_sandbox: stepSandbox,
									toolsContext,
									onToolExecutionStart: (event) => notify({
										event,
										callbacks: [resolvedOnToolExecutionStart, telemetryDispatcher.onToolExecutionStart]
									}),
									onToolExecutionEnd: (event) => notify({
										event,
										callbacks: [resolvedOnToolExecutionEnd, telemetryDispatcher.onToolExecutionEnd]
									}),
									executeToolInTelemetryContext: telemetryDispatcher.executeTool,
									runInTracingChannelSpan,
									toolCallConcurrency: resolvedToolCallConcurrency
								});
								for (const result of toolExecutionResults) {
									toolExecutionMs[result.output.toolCallId] = result.toolExecutionMs;
									clientToolOutputs.push(result.output);
								}
							}
							const stepTimeMs = now$4() - stepStartTimestampMs;
							const stepPerformance = {
								effectiveOutputTokensPerSecond: calculateTokensPerSecond({
									tokens: stepUsage.outputTokens,
									durationMs: responseTimeMs
								}),
								outputTokensPerSecond: void 0,
								inputTokensPerSecond: void 0,
								effectiveTotalTokensPerSecond: calculateTokensPerSecond({
									tokens: sumTokenCounts(stepUsage.inputTokens, stepUsage.outputTokens),
									durationMs: responseTimeMs
								}),
								stepTimeMs,
								responseTimeMs,
								toolExecutionMs,
								timeToFirstOutputMs: void 0
							};
							for (const toolCall of stepToolCalls) {
								if (!toolCall.providerExecuted) continue;
								const tool = getOwn(stepExecutionTools, toolCall.toolName);
								if (tool?.type === "provider" && tool.supportsDeferredResults) {
									if (!currentModelResponse.content.some((part) => part.type === "tool-result" && part.toolCallId === toolCall.toolCallId)) pendingDeferredToolCalls.set(toolCall.toolCallId, { toolName: toolCall.toolName });
								}
							}
							for (const part of currentModelResponse.content) if (part.type === "tool-result") pendingDeferredToolCalls.delete(part.toolCallId);
							const stepContent = await convertLanguageModelContent({
								content: currentModelResponse.content,
								toolCalls: stepToolCalls,
								toolOutputs: clientToolOutputs,
								toolApprovalRequests: Object.values(toolApprovalRequests),
								toolApprovalResponses,
								tools,
								abortSignal: mergedAbortSignal,
								generatedFileDataCache
							});
							const stepResponseMessages = await toResponseMessages({
								content: stepContent,
								tools
							});
							const stepRequest = {
								...currentModelResponse.request,
								body: include.requestBody ? currentModelResponse.request?.body : void 0,
								messages: include.requestMessages ? cloneModelMessages(stepMessages) : void 0
							};
							const stepResponse = {
								...currentModelResponse.response,
								messages: cloneModelMessages(stepResponseMessages),
								body: include.responseBody ? currentModelResponse.response?.body : void 0
							};
							const currentStepResult = new DefaultStepResult({
								callId,
								stepNumber,
								provider: stepModel.provider,
								modelId: stepModel.modelId,
								runtimeContext,
								content: stepContent,
								finishReason: currentModelResponse.finishReason.unified,
								rawFinishReason: currentModelResponse.finishReason.raw,
								usage: stepUsage,
								performance: stepPerformance,
								warnings: currentModelResponse.warnings,
								providerMetadata: currentModelResponse.providerMetadata,
								request: stepRequest,
								response: stepResponse,
								toolsContext,
								steeringMessages: deliveredSteeringMessages
							});
							logWarnings({
								warnings: currentModelResponse.warnings ?? [],
								provider: stepModel.provider,
								model: stepModel.modelId
							});
							steps.push(currentStepResult);
							instructionsForNextStep = stepInstructions;
							messagesForNextStep = [...stepMessages, ...stepResponseMessages];
							openStep = void 0;
							await notify({
								event: currentStepResult,
								callbacks: [resolvedOnStepEnd, telemetryDispatcher.onStepEnd]
							});
							return currentStepResult;
						}
					});
				} finally {
					if (stepTimeoutId != null) clearTimeout(stepTimeoutId);
				}
			} while (await shouldStartNextStep());
			steeringRun?.end(steeringEndReason);
			const lastStep = steps[steps.length - 1];
			const totalUsage = steps.reduce((totalUsage, step) => {
				return addLanguageModelUsage(totalUsage, step.usage);
			}, {
				inputTokens: void 0,
				inputTokenDetails: {
					noCacheTokens: void 0,
					cacheReadTokens: void 0,
					cacheWriteTokens: void 0
				},
				outputTokens: void 0,
				outputTokenDetails: {
					textTokens: void 0,
					reasoningTokens: void 0
				},
				totalTokens: void 0
			});
			const files = steps.flatMap((step) => step.files);
			const sources = steps.flatMap((step) => step.sources);
			const toolCalls = steps.flatMap((step) => step.toolCalls);
			const staticToolCalls = steps.flatMap((step) => step.staticToolCalls);
			const dynamicToolCalls = steps.flatMap((step) => step.dynamicToolCalls);
			const toolResults = steps.flatMap((step) => step.toolResults);
			const staticToolResults = steps.flatMap((step) => step.staticToolResults);
			const dynamicToolResults = steps.flatMap((step) => step.dynamicToolResults);
			const warnings = steps.flatMap((step) => step.warnings ?? []);
			await notify({
				event: {
					callId,
					stepNumber: lastStep.stepNumber,
					model: lastStep.model,
					runtimeContext: lastStep.runtimeContext,
					finishReason: lastStep.finishReason,
					rawFinishReason: lastStep.rawFinishReason,
					usage: totalUsage,
					totalUsage,
					content: steps.flatMap((step) => step.content),
					text: lastStep.text,
					reasoning: lastStep.reasoning,
					reasoningText: lastStep.reasoningText,
					files,
					sources,
					toolCalls,
					staticToolCalls,
					dynamicToolCalls,
					toolResults,
					staticToolResults,
					dynamicToolResults,
					responseMessages: [...initialResponseMessages, ...steps.flatMap((step) => step.response.messages)],
					warnings,
					request: lastStep.request,
					response: lastStep.response,
					providerMetadata: lastStep.providerMetadata,
					steps,
					finalStep: lastStep,
					toolsContext
				},
				callbacks: [onEnd, telemetryDispatcher.onEnd]
			});
			let resolvedOutput;
			if (lastStep.finishReason === "stop" || lastStep.finishReason !== "tool-calls" && lastStep.text.length > 0) {
				const outputSpecification = output ?? text();
				const textForOutput = (await outputSpecification.responseFormat)?.type === "json" ? currentModelResponse.structuredOutputText ?? lastStep.text : lastStep.text;
				resolvedOutput = await outputSpecification.parseCompleteOutput({ text: textForOutput }, {
					response: lastStep.response,
					usage: lastStep.usage,
					finishReason: lastStep.finishReason
				});
			}
			return new DefaultGenerateTextResult({
				initialResponseMessages,
				steps,
				totalUsage,
				output: resolvedOutput
			});
		} catch (error) {
			const wrappedError = wrapGatewayError(error);
			steeringRun?.end(mergedAbortSignal?.aborted ? "aborted" : "error");
			if (openStep != null) await notify({
				event: {
					...openStep,
					error: wrappedError
				},
				callbacks: [onStepError, telemetryDispatcher.onStepError]
			});
			await telemetryDispatcher.onError?.({
				callId,
				error
			});
			throw wrappedError;
		}
	};
	return await runInTracingChannelSpan({
		type: "generateText",
		event: generateTextStartEvent,
		execute: executeGenerateText
	});
}
async function executeTools({ toolCalls, tools, callId, messages, abortSignal, timeout, experimental_sandbox: sandbox, toolsContext, onToolExecutionStart, onToolExecutionEnd, executeToolInTelemetryContext, runInTracingChannelSpan, toolCallConcurrency }) {
	return (await mapWithConcurrency({
		items: toolCalls,
		concurrency: toolCallConcurrency,
		abortSignal,
		execute: async (toolCall) => await executeToolCall({
			toolCall,
			tools,
			callId,
			messages,
			abortSignal,
			timeout,
			experimental_sandbox: sandbox,
			toolsContext,
			onToolExecutionStart,
			onToolExecutionEnd,
			executeToolInTelemetryContext,
			runInTracingChannelSpan
		})
	})).filter((result) => result != null);
}
TransformStream;
var z$1 = {
	array: array$1,
	boolean: boolean$1,
	custom: custom$1,
	discriminatedUnion: discriminatedUnion$1,
	enum: _enum$1,
	extend: extend$1,
	int: int$1,
	literal: literal$1,
	looseObject,
	maximum: _lte,
	minLength: _minLength,
	never: never$1,
	nonnegative: _nonnegative,
	number: number$1,
	object: object$1,
	optional: optional$1,
	pipe: pipe$1,
	positive: _positive,
	record: record$1,
	refine: refine$1,
	startsWith: _startsWith,
	string: string$1,
	transform: transform$1,
	union: union$1,
	unknown: unknown$1
};
var z = {
	array,
	boolean,
	custom,
	discriminatedUnion,
	instanceof: _instanceof,
	lazy,
	literal,
	null: _null,
	number,
	object,
	record,
	string,
	union,
	unknown
};
var jsonValueSchema = z.lazy(() => z.union([
	z.null(),
	z.string(),
	z.number(),
	z.boolean(),
	z.record(z.string(), jsonValueSchema.optional()),
	z.array(jsonValueSchema)
]));
var providerMetadataSchema = z.record(z.string(), z.record(z.string(), jsonValueSchema.optional()));
var citationSchema = z$1.object({
	source: z$1.discriminatedUnion("sourceType", [z$1.object({
		type: z$1.literal("source"),
		sourceType: z$1.literal("url"),
		id: z$1.string(),
		url: z$1.string(),
		title: z$1.optional(z$1.string()),
		providerMetadata: z$1.optional(providerMetadataSchema)
	}), z$1.object({
		type: z$1.literal("source"),
		sourceType: z$1.literal("document"),
		id: z$1.string(),
		mediaType: z$1.string(),
		title: z$1.string(),
		filename: z$1.optional(z$1.string()),
		providerMetadata: z$1.optional(providerMetadataSchema)
	})]),
	startIndex: z$1.optional(z$1.number().check(z$1.int()).check(z$1.nonnegative())),
	endIndex: z$1.optional(z$1.number().check(z$1.int()).check(z$1.nonnegative())),
	citedText: z$1.optional(z$1.string())
});
var toolMetadataSchema$1 = z$1.record(z$1.string(), z$1.optional(jsonValueSchema));
lazySchema(() => zodSchema(z$1.union([
	z$1.looseObject({
		type: z$1.literal("text-start"),
		id: z$1.string(),
		providerMetadata: z$1.optional(providerMetadataSchema)
	}),
	z$1.looseObject({
		type: z$1.literal("text-delta"),
		id: z$1.string(),
		delta: z$1.string(),
		providerMetadata: z$1.optional(providerMetadataSchema)
	}),
	z$1.looseObject({
		type: z$1.literal("text-end"),
		id: z$1.string(),
		citations: z$1.optional(z$1.array(citationSchema)),
		providerMetadata: z$1.optional(providerMetadataSchema)
	}),
	z$1.looseObject({
		type: z$1.literal("error"),
		errorText: z$1.string()
	}),
	z$1.looseObject({
		type: z$1.literal("tool-input-start"),
		toolCallId: z$1.string(),
		toolName: z$1.string(),
		inputEncoding: z$1.optional(z$1.enum(["json", "text"])),
		providerExecuted: z$1.optional(z$1.boolean()),
		providerMetadata: z$1.optional(providerMetadataSchema),
		toolMetadata: z$1.optional(toolMetadataSchema$1),
		dynamic: z$1.optional(z$1.boolean()),
		title: z$1.optional(z$1.string())
	}),
	z$1.looseObject({
		type: z$1.literal("tool-input-delta"),
		toolCallId: z$1.string(),
		inputTextDelta: z$1.string()
	}),
	z$1.looseObject({
		type: z$1.literal("tool-input-available"),
		toolCallId: z$1.string(),
		toolName: z$1.string(),
		input: z$1.unknown(),
		providerExecuted: z$1.optional(z$1.boolean()),
		providerMetadata: z$1.optional(providerMetadataSchema),
		toolMetadata: z$1.optional(toolMetadataSchema$1),
		dynamic: z$1.optional(z$1.boolean()),
		title: z$1.optional(z$1.string())
	}),
	z$1.looseObject({
		type: z$1.literal("tool-input-error"),
		toolCallId: z$1.string(),
		toolName: z$1.string(),
		input: z$1.unknown(),
		providerExecuted: z$1.optional(z$1.boolean()),
		providerMetadata: z$1.optional(providerMetadataSchema),
		toolMetadata: z$1.optional(toolMetadataSchema$1),
		dynamic: z$1.optional(z$1.boolean()),
		errorText: z$1.string(),
		title: z$1.optional(z$1.string())
	}),
	z$1.looseObject({
		type: z$1.literal("tool-approval-request"),
		approvalId: z$1.string(),
		toolCallId: z$1.string(),
		approvalDescriptor: z$1.optional(z$1.unknown()),
		inputSchemaInput: z$1.optional(z$1.unknown()),
		reason: z$1.optional(z$1.string()),
		isAutomatic: z$1.optional(z$1.boolean()),
		signature: z$1.optional(z$1.string())
	}),
	z$1.looseObject({
		type: z$1.literal("tool-approval-response"),
		approvalId: z$1.string(),
		approved: z$1.boolean(),
		reason: z$1.optional(z$1.string()),
		providerExecuted: z$1.optional(z$1.boolean()),
		providerMetadata: z$1.optional(providerMetadataSchema)
	}),
	z$1.looseObject({
		type: z$1.literal("tool-output-available"),
		toolCallId: z$1.string(),
		output: z$1.unknown(),
		providerExecuted: z$1.optional(z$1.boolean()),
		providerMetadata: z$1.optional(providerMetadataSchema),
		toolMetadata: z$1.optional(toolMetadataSchema$1),
		dynamic: z$1.optional(z$1.boolean()),
		preliminary: z$1.optional(z$1.boolean())
	}),
	z$1.looseObject({
		type: z$1.literal("tool-output-error"),
		toolCallId: z$1.string(),
		errorText: z$1.string(),
		providerExecuted: z$1.optional(z$1.boolean()),
		providerMetadata: z$1.optional(providerMetadataSchema),
		toolMetadata: z$1.optional(toolMetadataSchema$1),
		dynamic: z$1.optional(z$1.boolean())
	}),
	z$1.looseObject({
		type: z$1.literal("tool-output-denied"),
		toolCallId: z$1.string()
	}),
	z$1.looseObject({
		type: z$1.literal("reasoning-start"),
		id: z$1.string(),
		providerMetadata: z$1.optional(providerMetadataSchema)
	}),
	z$1.looseObject({
		type: z$1.literal("reasoning-delta"),
		id: z$1.string(),
		delta: z$1.string(),
		providerMetadata: z$1.optional(providerMetadataSchema)
	}),
	z$1.looseObject({
		type: z$1.literal("reasoning-end"),
		id: z$1.string(),
		providerMetadata: z$1.optional(providerMetadataSchema)
	}),
	z$1.looseObject({
		type: z$1.literal("custom"),
		kind: z$1.pipe(z$1.string(), z$1.transform((value) => value)),
		providerMetadata: z$1.optional(providerMetadataSchema)
	}),
	z$1.looseObject({
		type: z$1.literal("source-url"),
		sourceId: z$1.string(),
		url: z$1.string(),
		title: z$1.optional(z$1.string()),
		providerMetadata: z$1.optional(providerMetadataSchema)
	}),
	z$1.looseObject({
		type: z$1.literal("source-document"),
		sourceId: z$1.string(),
		mediaType: z$1.string(),
		title: z$1.string(),
		filename: z$1.optional(z$1.string()),
		providerMetadata: z$1.optional(providerMetadataSchema)
	}),
	z$1.looseObject({
		type: z$1.literal("file"),
		url: z$1.string(),
		mediaType: z$1.string(),
		providerMetadata: z$1.optional(providerMetadataSchema)
	}),
	z$1.looseObject({
		type: z$1.literal("reasoning-file"),
		url: z$1.string(),
		mediaType: z$1.string(),
		providerMetadata: z$1.optional(providerMetadataSchema)
	}),
	z$1.looseObject({
		type: z$1.literal("steering-message"),
		id: z$1.string(),
		parts: z$1.array(z$1.union([z$1.looseObject({
			type: z$1.literal("text"),
			text: z$1.string(),
			providerMetadata: z$1.optional(providerMetadataSchema)
		}), z$1.looseObject({
			type: z$1.literal("file"),
			mediaType: z$1.string(),
			url: z$1.string(),
			filename: z$1.optional(z$1.string()),
			providerReference: z$1.optional(z$1.record(z$1.string(), z$1.string())),
			providerMetadata: z$1.optional(providerMetadataSchema)
		})]))
	}),
	z$1.looseObject({
		type: z$1.custom((value) => typeof value === "string" && value.startsWith("data-"), { message: "Type must start with \"data-\"" }),
		id: z$1.optional(z$1.string()),
		data: z$1.unknown(),
		transient: z$1.optional(z$1.boolean())
	}),
	z$1.looseObject({ type: z$1.literal("start-step") }),
	z$1.looseObject({ type: z$1.literal("finish-step") }),
	z$1.looseObject({ type: z$1.literal("reset-step") }),
	z$1.looseObject({
		type: z$1.literal("start"),
		messageId: z$1.optional(z$1.string()),
		messageMetadata: z$1.optional(z$1.unknown())
	}),
	z$1.looseObject({
		type: z$1.literal("finish"),
		finishReason: z$1.optional(z$1.enum([
			"stop",
			"length",
			"content-filter",
			"tool-calls",
			"error",
			"interrupted",
			"other"
		])),
		messageMetadata: z$1.optional(z$1.unknown())
	}),
	z$1.looseObject({
		type: z$1.literal("abort"),
		reason: z$1.optional(z$1.string())
	}),
	z$1.looseObject({
		type: z$1.literal("message-metadata"),
		messageMetadata: z$1.unknown()
	})
])));
createIdGenerator({
	prefix: "aitxt",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "aitxt",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
var toolMetadataSchema = z$1.record(z$1.string(), z$1.optional(jsonValueSchema));
var providerReferenceSchema$1 = z$1.record(z$1.string(), z$1.string());
lazySchema(() => {
	const approvalRequestedSchema = z$1.object({
		id: z$1.string(),
		approved: z$1.optional(z$1.never()),
		descriptor: z$1.optional(z$1.unknown()),
		requestReason: z$1.optional(z$1.string()),
		reason: z$1.optional(z$1.never()),
		isAutomatic: z$1.optional(z$1.boolean()),
		signature: z$1.optional(z$1.string()),
		inputSchemaInput: z$1.optional(z$1.unknown())
	});
	const approvalRespondedSchema = z$1.extend(approvalRequestedSchema, {
		approved: z$1.boolean(),
		reason: z$1.optional(z$1.string())
	});
	const approvalGrantedSchema = z$1.extend(approvalRespondedSchema, { approved: z$1.literal(true) });
	const approvalDeniedSchema = z$1.extend(approvalRespondedSchema, { approved: z$1.literal(false) });
	return zodSchema(z$1.array(z$1.object({
		id: z$1.string(),
		role: z$1.enum([
			"system",
			"user",
			"assistant"
		]),
		metadata: z$1.optional(z$1.unknown()),
		parts: z$1.array(z$1.union([
			z$1.object({
				type: z$1.literal("text"),
				text: z$1.string(),
				citations: z$1.optional(z$1.array(citationSchema)),
				state: z$1.optional(z$1.enum(["streaming", "done"])),
				providerMetadata: z$1.optional(providerMetadataSchema)
			}),
			z$1.object({
				type: z$1.literal("reasoning"),
				id: z$1.optional(z$1.string()),
				text: z$1.string(),
				state: z$1.optional(z$1.enum(["streaming", "done"])),
				providerMetadata: z$1.optional(providerMetadataSchema)
			}),
			z$1.object({
				type: z$1.literal("custom"),
				kind: z$1.string(),
				providerMetadata: z$1.optional(providerMetadataSchema)
			}),
			z$1.object({
				type: z$1.literal("source-url"),
				sourceId: z$1.string(),
				url: z$1.string(),
				title: z$1.optional(z$1.string()),
				providerMetadata: z$1.optional(providerMetadataSchema)
			}),
			z$1.object({
				type: z$1.literal("source-document"),
				sourceId: z$1.string(),
				mediaType: z$1.string(),
				title: z$1.string(),
				filename: z$1.optional(z$1.string()),
				providerMetadata: z$1.optional(providerMetadataSchema)
			}),
			z$1.object({
				type: z$1.literal("file"),
				mediaType: z$1.string(),
				filename: z$1.optional(z$1.string()),
				url: z$1.string(),
				providerReference: z$1.optional(providerReferenceSchema$1),
				providerMetadata: z$1.optional(providerMetadataSchema)
			}),
			z$1.object({
				type: z$1.literal("reasoning-file"),
				mediaType: z$1.string(),
				url: z$1.string(),
				providerMetadata: z$1.optional(providerMetadataSchema)
			}),
			z$1.object({
				type: z$1.literal("steering-message"),
				id: z$1.string(),
				parts: z$1.array(z$1.union([z$1.object({
					type: z$1.literal("text"),
					text: z$1.string(),
					providerMetadata: z$1.optional(providerMetadataSchema)
				}), z$1.object({
					type: z$1.literal("file"),
					mediaType: z$1.string(),
					filename: z$1.optional(z$1.string()),
					url: z$1.string(),
					providerReference: z$1.optional(providerReferenceSchema$1),
					providerMetadata: z$1.optional(providerMetadataSchema)
				})]))
			}),
			z$1.object({ type: z$1.literal("step-start") }),
			z$1.object({
				type: z$1.string().check(z$1.startsWith("data-")),
				id: z$1.optional(z$1.string()),
				data: z$1.unknown()
			}),
			z$1.object({
				type: z$1.literal("dynamic-tool"),
				dynamic: z$1.optional(z$1.literal(false)),
				toolName: z$1.string(),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("input-streaming"),
				input: z$1.optional(z$1.unknown()),
				rawInput: z$1.optional(z$1.string()),
				inputEncoding: z$1.optional(z$1.enum(["json", "text"])),
				providerExecuted: z$1.optional(z$1.boolean()),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				output: z$1.optional(z$1.never()),
				errorText: z$1.optional(z$1.never()),
				approval: z$1.optional(z$1.never())
			}),
			z$1.object({
				type: z$1.literal("dynamic-tool"),
				dynamic: z$1.optional(z$1.literal(false)),
				toolName: z$1.string(),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("input-available"),
				input: z$1.unknown(),
				providerExecuted: z$1.optional(z$1.boolean()),
				output: z$1.optional(z$1.never()),
				errorText: z$1.optional(z$1.never()),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				approval: z$1.optional(z$1.never())
			}),
			z$1.object({
				type: z$1.literal("dynamic-tool"),
				dynamic: z$1.optional(z$1.literal(false)),
				toolName: z$1.string(),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("approval-requested"),
				input: z$1.unknown(),
				providerExecuted: z$1.optional(z$1.boolean()),
				output: z$1.optional(z$1.never()),
				errorText: z$1.optional(z$1.never()),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				approval: approvalRequestedSchema
			}),
			z$1.object({
				type: z$1.literal("dynamic-tool"),
				dynamic: z$1.optional(z$1.literal(false)),
				toolName: z$1.string(),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("approval-responded"),
				input: z$1.unknown(),
				providerExecuted: z$1.optional(z$1.boolean()),
				output: z$1.optional(z$1.never()),
				errorText: z$1.optional(z$1.never()),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				approval: approvalRespondedSchema
			}),
			z$1.object({
				type: z$1.literal("dynamic-tool"),
				dynamic: z$1.optional(z$1.literal(false)),
				toolName: z$1.string(),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("output-available"),
				input: z$1.unknown(),
				providerExecuted: z$1.optional(z$1.boolean()),
				output: z$1.unknown(),
				errorText: z$1.optional(z$1.never()),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				resultProviderMetadata: z$1.optional(providerMetadataSchema),
				preliminary: z$1.optional(z$1.boolean()),
				approval: z$1.optional(approvalGrantedSchema)
			}),
			z$1.object({
				type: z$1.literal("dynamic-tool"),
				dynamic: z$1.optional(z$1.literal(false)),
				toolName: z$1.string(),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("output-error"),
				input: z$1.optional(z$1.unknown()),
				rawInput: z$1.optional(z$1.unknown()),
				providerExecuted: z$1.optional(z$1.boolean()),
				output: z$1.optional(z$1.never()),
				errorText: z$1.string(),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				resultProviderMetadata: z$1.optional(providerMetadataSchema),
				approval: z$1.optional(approvalGrantedSchema)
			}),
			z$1.object({
				type: z$1.literal("dynamic-tool"),
				dynamic: z$1.optional(z$1.literal(false)),
				toolName: z$1.string(),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("output-denied"),
				input: z$1.unknown(),
				providerExecuted: z$1.optional(z$1.boolean()),
				output: z$1.optional(z$1.never()),
				errorText: z$1.optional(z$1.never()),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				approval: approvalDeniedSchema
			}),
			z$1.object({
				type: z$1.string().check(z$1.startsWith("tool-")),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("input-streaming"),
				providerExecuted: z$1.optional(z$1.boolean()),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				input: z$1.optional(z$1.unknown()),
				rawInput: z$1.optional(z$1.string()),
				inputEncoding: z$1.optional(z$1.enum(["json", "text"])),
				output: z$1.optional(z$1.never()),
				errorText: z$1.optional(z$1.never()),
				approval: z$1.optional(z$1.never())
			}),
			z$1.object({
				type: z$1.string().check(z$1.startsWith("tool-")),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("input-available"),
				providerExecuted: z$1.optional(z$1.boolean()),
				input: z$1.unknown(),
				output: z$1.optional(z$1.never()),
				errorText: z$1.optional(z$1.never()),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				approval: z$1.optional(z$1.never())
			}),
			z$1.object({
				type: z$1.string().check(z$1.startsWith("tool-")),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("approval-requested"),
				input: z$1.unknown(),
				providerExecuted: z$1.optional(z$1.boolean()),
				output: z$1.optional(z$1.never()),
				errorText: z$1.optional(z$1.never()),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				approval: approvalRequestedSchema
			}),
			z$1.object({
				type: z$1.string().check(z$1.startsWith("tool-")),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("approval-responded"),
				input: z$1.unknown(),
				providerExecuted: z$1.optional(z$1.boolean()),
				output: z$1.optional(z$1.never()),
				errorText: z$1.optional(z$1.never()),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				approval: approvalRespondedSchema
			}),
			z$1.object({
				type: z$1.string().check(z$1.startsWith("tool-")),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("output-available"),
				providerExecuted: z$1.optional(z$1.boolean()),
				input: z$1.unknown(),
				output: z$1.unknown(),
				errorText: z$1.optional(z$1.never()),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				resultProviderMetadata: z$1.optional(providerMetadataSchema),
				preliminary: z$1.optional(z$1.boolean()),
				approval: z$1.optional(approvalGrantedSchema)
			}),
			z$1.object({
				type: z$1.string().check(z$1.startsWith("tool-")),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("output-error"),
				providerExecuted: z$1.optional(z$1.boolean()),
				input: z$1.optional(z$1.unknown()),
				rawInput: z$1.optional(z$1.unknown()),
				output: z$1.optional(z$1.never()),
				errorText: z$1.string(),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				resultProviderMetadata: z$1.optional(providerMetadataSchema),
				approval: z$1.optional(approvalGrantedSchema)
			}),
			z$1.object({
				type: z$1.string().check(z$1.startsWith("tool-")),
				toolCallId: z$1.string(),
				title: z$1.optional(z$1.string()),
				toolMetadata: z$1.optional(toolMetadataSchema),
				state: z$1.literal("output-denied"),
				providerExecuted: z$1.optional(z$1.boolean()),
				input: z$1.unknown(),
				output: z$1.optional(z$1.never()),
				errorText: z$1.optional(z$1.never()),
				callProviderMetadata: z$1.optional(providerMetadataSchema),
				approval: approvalDeniedSchema
			})
		]))
	}).check((context) => {
		const message = context.value;
		if (message.role !== "assistant" && message.parts.length === 0) context.issues.push({
			continue: true,
			origin: "array",
			code: "too_small",
			minimum: 1,
			inclusive: true,
			input: message.parts,
			path: ["parts"],
			message: "Message must contain at least one part"
		});
	})).check(z$1.minLength(1, "Messages array must not be empty")));
});
/**
* Writes an enumerable own property without invoking inherited setters such as
* `Object.prototype.__proto__`. Keeps the target object's prototype unchanged.
*/
function setOwn(object, key, value) {
	Object.defineProperty(object, key, {
		value,
		enumerable: true,
		configurable: true,
		writable: true
	});
}
var gatewayCostMetadataKeys = [
	"cost",
	"gatewayCost",
	"inferenceCost",
	"inputInferenceCost",
	"marketCost",
	"outputInferenceCost",
	"surchargeCost"
];
var RetryableNoImageResultError = class extends Error {
	constructor() {
		super("No image generated.");
		this.name = "RetryableNoImageResultError";
	}
};
/**
* Generates images using an image model.
*
* @param model - The image model to use.
* @param prompt - The prompt that should be used to generate the image.
* @param n - Number of images to generate. Default: 1.
* @param maxImagesPerCall - Maximum number of images to generate in a single API call.
* @param size - Size of the images to generate. Must have the format `{width}x{height}`.
* @param aspectRatio - Aspect ratio of the images to generate. Must have the format `{width}:{height}`.
* @param seed - Seed for the image generation.
* @param providerOptions - Additional provider-specific options that are passed through to the provider
* as body parameters.
* @param maxRetries - Maximum number of retries per image model call, including retries after unclassified empty responses. Empty responses marked as not retryable by the provider are not retried. Set to 0 to disable retries. Default: 2.
* @param abortSignal - An optional abort signal that can be used to cancel the call.
* @param headers - Additional HTTP headers to be sent with the request. Only applicable for HTTP-based providers.
*
* @returns A result object that contains the generated images.
*/
async function generateImage({ model: modelArg, prompt: promptArg, n = 1, maxImagesPerCall, size, aspectRatio, seed, providerOptions, maxRetries: maxRetriesArg, abortSignal, headers }) {
	const model = resolveImageModel(modelArg);
	const headersWithUserAgent = withUserAgentSuffix(headers ?? {}, `ai/${VERSION}`);
	const { retry } = prepareRetries({
		maxRetries: maxRetriesArg,
		abortSignal,
		additionalRetryableError: (error) => error instanceof RetryableNoImageResultError
	});
	const maxImagesPerCallWithDefault = maxImagesPerCall ?? await invokeModelMaxImagesPerCall(model) ?? 1;
	const callCount = Math.ceil(n / maxImagesPerCallWithDefault);
	const callImageCounts = Array.from({ length: callCount }, (_, i) => {
		if (i < callCount - 1) return maxImagesPerCallWithDefault;
		const remainder = n % maxImagesPerCallWithDefault;
		return remainder === 0 ? maxImagesPerCallWithDefault : remainder;
	});
	const results = (await Promise.all(callImageCounts.map(async (callImageCount) => {
		const callResults = [];
		try {
			await retry(async () => {
				const { prompt, files, mask } = normalizePrompt$1(promptArg);
				const result = await model.doGenerate({
					prompt,
					files,
					mask,
					n: callImageCount,
					abortSignal,
					headers: headersWithUserAgent,
					size,
					aspectRatio,
					seed,
					providerOptions: providerOptions ?? {}
				});
				callResults.push(result);
				if (result.images.length === 0 && result.isRetryable !== false) throw new RetryableNoImageResultError();
				return result;
			});
			return callResults;
		} catch (error) {
			if ((error instanceof RetryableNoImageResultError ? error : RetryError.isInstance(error) && error.lastError instanceof RetryableNoImageResultError ? error.lastError : void 0) != null) return callResults;
			throw error;
		}
	}))).flat();
	const images = [];
	const calls = [];
	const warnings = [];
	const responses = [];
	const providerMetadata = {};
	let totalUsage = {
		inputTokens: void 0,
		outputTokens: void 0,
		totalTokens: void 0
	};
	for (const result of results) {
		const callImages = result.images.map((image, index) => new DefaultGeneratedFile({
			data: image,
			mediaType: detectMediaType({
				data: image,
				topLevelType: "image"
			}) ?? "image/png",
			providerMetadata: getImageProviderMetadata(result.providerMetadata, index)
		}));
		images.push(...callImages);
		calls.push({
			images: callImages,
			providerMetadata: result.providerMetadata,
			response: result.response,
			warnings: result.warnings,
			usage: result.usage
		});
		warnings.push(...result.warnings);
		if (result.usage != null) totalUsage = addImageModelUsage(totalUsage, result.usage);
		if (result.providerMetadata) for (const [providerName, metadata] of Object.entries(result.providerMetadata)) if (providerName === "gateway") {
			const currentEntry = providerMetadata[providerName];
			if (currentEntry != null && typeof currentEntry === "object") {
				const currentGatewayMetadata = currentEntry;
				const newGatewayMetadata = metadata;
				providerMetadata[providerName] = {
					...currentEntry,
					...metadata,
					...Object.fromEntries(gatewayCostMetadataKeys.flatMap((key) => {
						const total = addDecimalStrings(currentGatewayMetadata[key], newGatewayMetadata[key]);
						return total == null ? [] : [[key, total]];
					}))
				};
			} else providerMetadata[providerName] = { ...metadata };
			const imagesValue = providerMetadata[providerName].images;
			if (Array.isArray(imagesValue) && imagesValue.length === 0) delete providerMetadata[providerName].images;
		} else {
			const currentEntry = getOwn(providerMetadata, providerName) ?? { images: [] };
			currentEntry.images.push(...metadata.images);
			setOwn(providerMetadata, providerName, currentEntry);
		}
		responses.push(result.response);
	}
	logWarnings({
		warnings,
		provider: model.provider,
		model: model.modelId
	});
	if (!images.length) throw new NoImageGeneratedError({
		calls,
		responses
	});
	return new DefaultGenerateImageResult({
		images,
		calls,
		warnings,
		responses,
		providerMetadata,
		usage: totalUsage
	});
}
var DefaultGenerateImageResult = class {
	constructor(options) {
		this.images = options.images;
		this.calls = options.calls;
		this.warnings = options.warnings;
		this.responses = options.responses;
		this.providerMetadata = options.providerMetadata;
		this.usage = options.usage;
	}
	get image() {
		return this.images[0];
	}
};
/**
* Extracts per-image metadata from the legacy `providerMetadata.<provider>.images` result shape.
*/
function getImageProviderMetadata(providerMetadata, imageIndex) {
	if (providerMetadata == null) return;
	let imageMetadata;
	for (const [providerName, metadata] of Object.entries(providerMetadata)) {
		const value = metadata.images?.[imageIndex];
		if (isJSONObject(value) && !Array.isArray(value)) setOwn(imageMetadata ??= {}, providerName, value);
	}
	return imageMetadata;
}
async function invokeModelMaxImagesPerCall(model) {
	if (!(model.maxImagesPerCall instanceof Function)) return model.maxImagesPerCall;
	return model.maxImagesPerCall({ modelId: model.modelId });
}
function addDecimalStrings(value1, value2) {
	if (typeof value1 !== "string" || typeof value2 !== "string" || !/^\d+(?:\.\d+)?$/.test(value1) || !/^\d+(?:\.\d+)?$/.test(value2)) return;
	const [integer1, fraction1 = ""] = value1.split(".");
	const [integer2, fraction2 = ""] = value2.split(".");
	const precision = Math.max(fraction1.length, fraction2.length);
	const sumString = (BigInt(integer1 + fraction1.padEnd(precision, "0")) + BigInt(integer2 + fraction2.padEnd(precision, "0"))).toString().padStart(precision + 1, "0");
	return precision === 0 ? sumString : `${sumString.slice(0, -precision)}.${sumString.slice(-precision)}`.replace(/\.?0+$/, "");
}
function normalizePrompt$1(prompt) {
	if (typeof prompt === "string") return {
		prompt,
		files: void 0,
		mask: void 0
	};
	return {
		prompt: prompt.text,
		files: prompt.images.map(toImageModelV4File),
		mask: prompt.mask ? toImageModelV4File(prompt.mask) : void 0
	};
}
function toImageModelV4File(dataContent) {
	if (typeof dataContent === "string" && dataContent.startsWith("http")) return {
		type: "url",
		url: dataContent
	};
	if (typeof dataContent === "string" && dataContent.startsWith("data:")) {
		const { mediaType: dataUrlMediaType, base64Content } = splitDataUrl(dataContent);
		if (base64Content != null) {
			const uint8Data = convertBase64ToUint8Array(base64Content);
			return {
				type: "file",
				data: uint8Data,
				mediaType: dataUrlMediaType || detectMediaType({
					data: uint8Data,
					topLevelType: "image"
				}) || "image/png"
			};
		}
	}
	const uint8Data = convertDataContentToUint8Array(dataContent);
	return {
		type: "file",
		data: uint8Data,
		mediaType: detectMediaType({
			data: uint8Data,
			topLevelType: "image"
		}) || "image/png"
	};
}
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
new TextEncoder();
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "aiobj",
	size: 24
});
var { atob: atob$1 } = globalThis;
createIdGenerator({
	prefix: "aiobj",
	size: 24
});
var DefaultGeneratedAudioFile = class extends DefaultGeneratedFile {
	constructor({ data, mediaType }) {
		super({
			data,
			mediaType
		});
		let format = "mp3";
		if (mediaType) {
			const mediaTypeParts = mediaType.split("/");
			if (mediaTypeParts.length === 2) {
				if (mediaType !== "audio/mpeg") format = mediaTypeParts[1];
			}
		}
		if (!format) throw new InvalidResponseDataError({
			data: mediaType,
			message: `Could not determine audio format from media type: ${mediaType}`
		});
		this.format = format;
	}
};
var originalGenerateCallId$3 = createIdGenerator({
	prefix: "call",
	size: 24
});
/**
* Generates speech audio using a speech model.
*
* @param model - The speech model to use.
* @param text - The text to convert to speech.
* @param voice - The voice to use for speech generation.
* @param outputFormat - The output format to use for speech generation e.g. "mp3", "wav", etc.
* @param instructions - Instructions for the speech generation e.g. "Speak in a slow and steady tone".
* @param speed - The speed of the speech generation.
* @param language - The language for speech generation (ISO 639-1 code e.g. "en", "es", "fr") or "auto" for automatic detection.
* @param providerOptions - Additional provider-specific options that are passed through to the provider
* as body parameters.
* @param maxRetries - Maximum number of retries. Set to 0 to disable retries. Default: 2.
* @param abortSignal - An optional abort signal that can be used to cancel the call.
* @param headers - Additional HTTP headers to be sent with the request. Only applicable for HTTP-based providers.
* @param telemetry - Optional telemetry configuration.
*
* @returns A result object that contains the generated audio data.
*/
async function generateSpeech({ model, text, voice, outputFormat, instructions, speed, language, providerOptions = {}, maxRetries: maxRetriesArg, abortSignal, headers, telemetry, _internal: { generateCallId = originalGenerateCallId$3 } = {} }) {
	const resolvedModel = resolveSpeechModel(model);
	if (!resolvedModel) throw new Error("Model could not be resolved");
	const headersWithUserAgent = withUserAgentSuffix(headers ?? {}, `ai/${VERSION}`);
	const { maxRetries, retry } = prepareRetries({
		maxRetries: maxRetriesArg,
		abortSignal
	});
	const callId = generateCallId();
	const telemetryDispatcher = createTelemetryDispatcher({ telemetry });
	const runInTracingChannelSpan = telemetryDispatcher.runInTracingChannelSpan ?? (async ({ execute }) => await execute());
	const startEvent = {
		callId,
		operationId: "ai.generateSpeech",
		provider: resolvedModel.provider,
		modelId: resolvedModel.modelId,
		text,
		voice,
		outputFormat,
		instructions,
		speed,
		language,
		maxRetries,
		headers,
		providerOptions
	};
	return await runInTracingChannelSpan({
		type: "generateSpeech",
		event: startEvent,
		execute: async () => {
			await notify({
				event: startEvent,
				callbacks: [telemetryDispatcher.onStart]
			});
			try {
				const result = await retry(() => resolvedModel.doGenerate({
					text,
					voice,
					outputFormat,
					instructions,
					speed,
					language,
					abortSignal,
					headers: headersWithUserAgent,
					providerOptions
				}));
				if (!result.audio || result.audio.length === 0) throw new NoSpeechGeneratedError({ responses: [result.response] });
				logWarnings({
					warnings: result.warnings,
					provider: resolvedModel.provider,
					model: resolvedModel.modelId
				});
				const detectedMediaType = detectMediaType({
					data: result.audio,
					topLevelType: "audio"
				});
				const audio = new DefaultGeneratedAudioFile({
					data: result.audio,
					mediaType: detectedMediaType ?? getResponseAudioMediaType(result.response.headers) ?? getOutputFormatMediaType(outputFormat) ?? "audio/mp3"
				});
				if (telemetryDispatcher.onEnd != null) await notify({
					event: {
						callId,
						operationId: "ai.generateSpeech",
						provider: resolvedModel.provider,
						modelId: resolvedModel.modelId,
						text,
						audio: {
							byteLength: getBase64OrBinaryByteLength(result.audio),
							mediaType: audio.mediaType,
							format: audio.format
						},
						usage: result.usage,
						warnings: result.warnings,
						providerMetadata: result.providerMetadata,
						response: getTelemetryResponseMetadata(result.response)
					},
					callbacks: [telemetryDispatcher.onEnd]
				});
				return new DefaultSpeechResult({
					audio,
					warnings: result.warnings,
					responses: [result.response],
					providerMetadata: result.providerMetadata
				});
			} catch (error) {
				await telemetryDispatcher.onError?.({
					callId,
					error
				});
				throw error;
			}
		}
	});
}
function getBase64OrBinaryByteLength(audio) {
	if (audio instanceof Uint8Array) return audio.byteLength;
	let characterCount = 0;
	let lastCharacter = "";
	let secondLastCharacter = "";
	for (const character of audio) {
		if (/\s/.test(character)) continue;
		characterCount++;
		secondLastCharacter = lastCharacter;
		lastCharacter = character;
	}
	const padding = lastCharacter === "=" ? secondLastCharacter === "=" ? 2 : 1 : 0;
	return Math.floor(characterCount * 3 / 4) - padding;
}
function getTelemetryResponseMetadata(response) {
	return {
		timestamp: response.timestamp,
		modelId: response.modelId,
		headers: response.headers
	};
}
function getResponseAudioMediaType(headers) {
	const mediaType = Object.entries(headers ?? {}).find(([name]) => name.toLowerCase() === "content-type")?.[1];
	if (mediaType == null) return;
	const normalizedMediaType = mediaType.split(";", 1)[0].trim().toLowerCase();
	if (normalizedMediaType.length === 0) return;
	return normalizedMediaType.startsWith("audio/") ? normalizedMediaType : void 0;
}
function getOutputFormatMediaType(outputFormat) {
	if (outputFormat == null) return;
	switch (outputFormat.trim().toLowerCase()) {
		case "pcm":
		case "audio/pcm": return "audio/pcm";
		case "audio/l16": return "audio/l16";
		case "mulaw":
		case "audio/mulaw": return "audio/mulaw";
		case "alaw":
		case "audio/alaw": return "audio/alaw";
		default: return;
	}
}
var DefaultSpeechResult = class {
	constructor(options) {
		this.audio = options.audio;
		this.warnings = options.warnings;
		this.responses = options.responses;
		this.providerMetadata = options.providerMetadata ?? {};
	}
};
var fileInlineDataSchema = z.union([
	z.string(),
	z.custom(isUint8Array, { message: "Must be a Uint8Array" }),
	z.custom(isArrayBuffer, { message: "Must be an ArrayBuffer" }),
	z.custom(isBuffer, { message: "Must be a Buffer" })
]);
var providerReferenceSchema = z.record(z.string(), z.string());
/**
* @internal
*/
var textPartSchema = z.object({
	type: z.literal("text"),
	text: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
/**
* @internal
* @deprecated Use `filePartSchema` with `mediaType: 'image'` instead:
* `{ type: 'file', mediaType: 'image', data: { type: 'data', data } }`.
*/
var imagePartSchema = z.object({
	type: z.literal("image"),
	image: z.union([
		fileInlineDataSchema,
		z.instanceof(URL),
		providerReferenceSchema
	]),
	mediaType: z.string().optional(),
	providerOptions: providerMetadataSchema.optional()
});
var taggedFileDataSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("data"),
		data: fileInlineDataSchema
	}),
	z.object({
		type: z.literal("url"),
		url: z.instanceof(URL)
	}),
	z.object({
		type: z.literal("reference"),
		reference: providerReferenceSchema
	}),
	z.object({
		type: z.literal("text"),
		text: z.string()
	})
]);
var taggedReasoningFileDataSchema = z.discriminatedUnion("type", [z.object({
	type: z.literal("data"),
	data: fileInlineDataSchema
}), z.object({
	type: z.literal("url"),
	url: z.instanceof(URL)
})]);
/**
* @internal
*/
var filePartSchema = z.object({
	type: z.literal("file"),
	data: z.union([
		taggedFileDataSchema,
		fileInlineDataSchema,
		z.instanceof(URL),
		providerReferenceSchema
	]),
	filename: z.string().optional(),
	mediaType: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
/**
* @internal
*/
var reasoningPartSchema = z.object({
	type: z.literal("reasoning"),
	text: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
/**
* @internal
*/
var customPartSchema = z.object({
	type: z.literal("custom"),
	kind: z.string().transform((value) => value),
	providerOptions: providerMetadataSchema.optional()
});
/**
* @internal
*/
var reasoningFilePartSchema = z.object({
	type: z.literal("reasoning-file"),
	data: z.union([
		taggedReasoningFileDataSchema,
		fileInlineDataSchema,
		z.instanceof(URL)
	]),
	mediaType: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
/**
* @internal
*/
var toolCallPartSchema = z.object({
	type: z.literal("tool-call"),
	toolCallId: z.string(),
	toolName: z.string(),
	input: z.unknown(),
	providerOptions: providerMetadataSchema.optional(),
	providerExecuted: z.boolean().optional()
});
/**
* @internal
*/
var outputSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("text"),
		value: z.string(),
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("json"),
		value: jsonValueSchema,
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("execution-denied"),
		reason: z.string().optional(),
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("error-text"),
		value: z.string(),
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("error-json"),
		value: jsonValueSchema,
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("content"),
		value: z.array(z.union([
			z.object({
				type: z.literal("text"),
				text: z.string(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file"),
				data: taggedFileDataSchema,
				mediaType: z.string(),
				filename: z.string().optional(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file-data"),
				data: z.string(),
				mediaType: z.string(),
				filename: z.string().optional(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file-url"),
				url: z.string(),
				mediaType: z.string().optional(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file-id"),
				fileId: z.union([z.string(), z.record(z.string(), z.string())]),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file-reference"),
				providerReference: z.record(z.string(), z.string()),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("image-data"),
				data: z.string(),
				mediaType: z.string(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("image-url"),
				url: z.string(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("image-file-id"),
				fileId: z.union([z.string(), z.record(z.string(), z.string())]),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("image-file-reference"),
				providerReference: z.record(z.string(), z.string()),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("custom"),
				providerOptions: providerMetadataSchema.optional()
			})
		]))
	})
]);
/**
* @internal
*/
var toolResultPartSchema = z.object({
	type: z.literal("tool-result"),
	toolCallId: z.string(),
	toolName: z.string(),
	output: outputSchema,
	providerOptions: providerMetadataSchema.optional()
});
/**
* @internal
*/
var toolApprovalRequestSchema = z.object({
	type: z.literal("tool-approval-request"),
	approvalId: z.string(),
	toolCallId: z.string(),
	reason: z.string().optional(),
	isAutomatic: z.boolean().optional(),
	signature: z.string().optional(),
	inputSchemaInput: z.unknown().optional()
});
/**
* @internal
*/
var toolApprovalResponseSchema = z.object({
	type: z.literal("tool-approval-response"),
	approvalId: z.string(),
	approved: z.boolean(),
	reason: z.string().optional()
});
var systemModelMessageSchema = z.object({
	role: z.literal("system"),
	content: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
var userModelMessageSchema = z.object({
	role: z.literal("user"),
	content: z.union([z.string(), z.array(z.union([
		textPartSchema,
		imagePartSchema,
		filePartSchema
	]))]),
	providerOptions: providerMetadataSchema.optional()
});
var assistantModelMessageSchema = z.object({
	role: z.literal("assistant"),
	content: z.union([z.string(), z.array(z.union([
		textPartSchema,
		customPartSchema,
		filePartSchema,
		reasoningPartSchema,
		reasoningFilePartSchema,
		toolCallPartSchema,
		toolResultPartSchema,
		toolApprovalRequestSchema
	]))]),
	providerOptions: providerMetadataSchema.optional()
});
var toolModelMessageSchema = z.object({
	role: z.literal("tool"),
	content: z.array(z.union([toolResultPartSchema, toolApprovalResponseSchema])),
	providerOptions: providerMetadataSchema.optional()
});
z.union([
	systemModelMessageSchema,
	userModelMessageSchema,
	assistantModelMessageSchema,
	toolModelMessageSchema
]);
z$1.object({
	token: z$1.string().check(z$1.refine((value) => value.trim().length > 0)),
	url: z$1.string().check(z$1.refine((value) => {
		try {
			const url = new URL(value);
			return (url.protocol === "ws:" || url.protocol === "wss:") && url.hostname !== "";
		} catch {
			return false;
		}
	})),
	expiresAt: z$1.optional(z$1.number().check(z$1.positive()).check(z$1.maximum(Number.MAX_SAFE_INTEGER))),
	tools: z$1.optional(z$1.array(z$1.object({
		type: z$1.literal("function"),
		name: z$1.string().check(z$1.minLength(1)),
		description: z$1.optional(z$1.string()),
		parameters: z$1.record(z$1.string(), z$1.unknown())
	})))
});
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
//#endregion
export { output_exports as i, generateSpeech as n, generateText as r, generateImage as t };
