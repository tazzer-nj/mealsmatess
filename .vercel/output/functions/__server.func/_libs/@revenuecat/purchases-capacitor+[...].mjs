import { r as __exportAll } from "../../_runtime.mjs";
import { i as registerPlugin, r as WebPlugin } from "../capacitor__app+capacitor__core.mjs";
//#region node_modules/@revenuecat/purchases-typescript-internal-esm/dist/generated/error-codes.js
/**
* Error codes indicating the reason for an error.
* @public
*/
var PURCHASES_ERROR_CODE;
(function(PURCHASES_ERROR_CODE) {
	PURCHASES_ERROR_CODE["UNKNOWN_ERROR"] = "0";
	PURCHASES_ERROR_CODE["PURCHASE_CANCELLED_ERROR"] = "1";
	PURCHASES_ERROR_CODE["STORE_PROBLEM_ERROR"] = "2";
	PURCHASES_ERROR_CODE["PURCHASE_NOT_ALLOWED_ERROR"] = "3";
	PURCHASES_ERROR_CODE["PURCHASE_INVALID_ERROR"] = "4";
	PURCHASES_ERROR_CODE["PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR"] = "5";
	PURCHASES_ERROR_CODE["PRODUCT_ALREADY_PURCHASED_ERROR"] = "6";
	PURCHASES_ERROR_CODE["RECEIPT_ALREADY_IN_USE_ERROR"] = "7";
	PURCHASES_ERROR_CODE["INVALID_RECEIPT_ERROR"] = "8";
	PURCHASES_ERROR_CODE["MISSING_RECEIPT_FILE_ERROR"] = "9";
	PURCHASES_ERROR_CODE["NETWORK_ERROR"] = "10";
	PURCHASES_ERROR_CODE["INVALID_CREDENTIALS_ERROR"] = "11";
	PURCHASES_ERROR_CODE["UNEXPECTED_BACKEND_RESPONSE_ERROR"] = "12";
	PURCHASES_ERROR_CODE["RECEIPT_IN_USE_BY_OTHER_SUBSCRIBER_ERROR"] = "13";
	PURCHASES_ERROR_CODE["INVALID_APP_USER_ID_ERROR"] = "14";
	PURCHASES_ERROR_CODE["OPERATION_ALREADY_IN_PROGRESS_ERROR"] = "15";
	PURCHASES_ERROR_CODE["UNKNOWN_BACKEND_ERROR"] = "16";
	PURCHASES_ERROR_CODE["INVALID_APPLE_SUBSCRIPTION_KEY_ERROR"] = "17";
	PURCHASES_ERROR_CODE["INELIGIBLE_ERROR"] = "18";
	PURCHASES_ERROR_CODE["INSUFFICIENT_PERMISSIONS_ERROR"] = "19";
	PURCHASES_ERROR_CODE["PAYMENT_PENDING_ERROR"] = "20";
	PURCHASES_ERROR_CODE["INVALID_SUBSCRIBER_ATTRIBUTES_ERROR"] = "21";
	PURCHASES_ERROR_CODE["LOG_OUT_ANONYMOUS_USER_ERROR"] = "22";
	PURCHASES_ERROR_CODE["CONFIGURATION_ERROR"] = "23";
	PURCHASES_ERROR_CODE["UNSUPPORTED_ERROR"] = "24";
	PURCHASES_ERROR_CODE["EMPTY_SUBSCRIBER_ATTRIBUTES_ERROR"] = "25";
	PURCHASES_ERROR_CODE["PRODUCT_DISCOUNT_MISSING_IDENTIFIER_ERROR"] = "26";
	PURCHASES_ERROR_CODE["PRODUCT_DISCOUNT_MISSING_SUBSCRIPTION_GROUP_IDENTIFIER_ERROR"] = "28";
	PURCHASES_ERROR_CODE["CUSTOMER_INFO_ERROR"] = "29";
	PURCHASES_ERROR_CODE["SYSTEM_INFO_ERROR"] = "30";
	PURCHASES_ERROR_CODE["BEGIN_REFUND_REQUEST_ERROR"] = "31";
	PURCHASES_ERROR_CODE["PRODUCT_REQUEST_TIMED_OUT_ERROR"] = "32";
	PURCHASES_ERROR_CODE["API_ENDPOINT_BLOCKED"] = "33";
	PURCHASES_ERROR_CODE["INVALID_PROMOTIONAL_OFFER_ERROR"] = "34";
	PURCHASES_ERROR_CODE["OFFLINE_CONNECTION_ERROR"] = "35";
	PURCHASES_ERROR_CODE["FEATURE_NOT_AVAILABLE_IN_CUSTOM_ENTITLEMENTS_COMPUTATION_MODE"] = "36";
	PURCHASES_ERROR_CODE["SIGNATURE_VERIFICATION_ERROR"] = "37";
	PURCHASES_ERROR_CODE["FEATURE_NOT_SUPPORTED_WITH_STORE_KIT_1"] = "38";
	PURCHASES_ERROR_CODE["INVALID_WEB_PURCHASE_TOKEN"] = "39";
	PURCHASES_ERROR_CODE["PURCHASE_BELONGS_TO_OTHER_USER"] = "40";
	PURCHASES_ERROR_CODE["EXPIRED_WEB_PURCHASE_TOKEN"] = "41";
	PURCHASES_ERROR_CODE["TEST_STORE_SIMULATED_PURCHASE_ERROR"] = "42";
})(PURCHASES_ERROR_CODE || (PURCHASES_ERROR_CODE = {}));
//#endregion
//#region node_modules/@revenuecat/purchases-typescript-internal-esm/dist/errors.js
var __extends = (function() {
	var extendStatics = function(d, b) {
		extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
			d.__proto__ = b;
		} || function(d, b) {
			for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
		};
		return extendStatics(d, b);
	};
	return function(d, b) {
		if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
		extendStatics(d, b);
		function __() {
			this.constructor = d;
		}
		d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
})();
(function(_super) {
	__extends(UninitializedPurchasesError, _super);
	function UninitializedPurchasesError() {
		var _this = _super.call(this, "There is no singleton instance. Make sure you configure Purchases before trying to get the default instance. More info here: https://errors.rev.cat/configuring-sdk") || this;
		Object.setPrototypeOf(_this, UninitializedPurchasesError.prototype);
		return _this;
	}
	return UninitializedPurchasesError;
})(Error);
(function(_super) {
	__extends(UnsupportedPlatformError, _super);
	function UnsupportedPlatformError() {
		var _this = _super.call(this, "This method is not available in the current platform.") || this;
		Object.setPrototypeOf(_this, UnsupportedPlatformError.prototype);
		return _this;
	}
	return UnsupportedPlatformError;
})(Error);
//#endregion
//#region node_modules/@revenuecat/purchases-typescript-internal-esm/dist/errorNormalizer.js
var __assign = function() {
	__assign = Object.assign || function(t) {
		for (var s, i = 1, n = arguments.length; i < n; i++) {
			s = arguments[i];
			for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
		}
		return t;
	};
	return __assign.apply(this, arguments);
};
/**
* React Native nests `ErrorContainer.info` under `userInfo`, Capacitor under `data`,
* and `purchases-js-hybrid-mappings` under `info`.
*/
var PAYLOAD_KEYS = [
	"userInfo",
	"data",
	"info"
];
function isRecord(value) {
	return typeof value === "object" && value !== null;
}
function readPayload(error) {
	for (var _i = 0, PAYLOAD_KEYS_1 = PAYLOAD_KEYS; _i < PAYLOAD_KEYS_1.length; _i++) {
		var candidate = error[PAYLOAD_KEYS_1[_i]];
		if (isRecord(candidate)) return candidate;
	}
	return {};
}
function firstString() {
	var values = [];
	for (var _i = 0; _i < arguments.length; _i++) values[_i] = arguments[_i];
	for (var _a = 0, values_1 = values; _a < values_1.length; _a++) {
		var value = values_1[_a];
		if (typeof value === "string") return value;
	}
	return "";
}
/**
* Every code the SDK emits is a PURCHASES_ERROR_CODE value, which is always numeric.
* Plugin level rejections use names such as "UNIMPLEMENTED" or "PAYWALL_ERROR" and are
* not ours to touch.
*
* Deliberately looser than PURCHASES_ERROR_CODE membership: that enum omits codes the
* native SDKs emit (36 to 41), and Android and iOS disagree on 28 and 36, so matching
* against it would reject genuine errors.
*/
function readCode(error, payload) {
	var _a;
	var candidate = (_a = error.code) !== null && _a !== void 0 ? _a : payload.code;
	var code = String(candidate);
	return /^\d+$/.test(code) ? code : void 0;
}
/**
* Fills in the fields {@link PurchasesError} declares but the platform bridges
* leave nested.
*
* Hybrid SDKs should call this on every error rejected by the native module,
* then rethrow the returned value.
*
* The error is mutated in place and returned. Copying it into a new object
* would discard its prototype and stack, which would break `instanceof Error`
* for consumers and `instanceof CapacitorException` on Capacitor.
*
* Values the bridge did not send fall back to the same defaults the native
* layer already applies, so the result always satisfies {@link PurchasesError}.
*
* Anything that is not an object, or that carries no error code, is returned
* untouched.
*
* @public
*/
function normalizePurchasesError(error) {
	if (!isRecord(error)) return error;
	var payload = readPayload(error);
	var code = readCode(error, payload);
	if (code === void 0) return error;
	error.code = code;
	var userInfo = __assign({}, payload);
	if (typeof userInfo.readableErrorCode !== "string") userInfo.readableErrorCode = firstString(payload.readableErrorCode, error.readableErrorCode);
	error.userInfo = userInfo;
	if (typeof error.message !== "string" || error.message === "") error.message = firstString(payload.message);
	if (typeof error.readableErrorCode !== "string") error.readableErrorCode = userInfo.readableErrorCode;
	if (typeof error.underlyingErrorMessage !== "string") error.underlyingErrorMessage = firstString(payload.underlyingErrorMessage);
	error.userCancelled = code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
	return error;
}
//#endregion
//#region node_modules/@revenuecat/purchases-typescript-internal-esm/dist/offerings.js
/**
* Enum indicating possible package types.
* @public
*/
var PACKAGE_TYPE;
(function(PACKAGE_TYPE) {
	/**
	* A package that was defined with a custom identifier.
	*/
	PACKAGE_TYPE["UNKNOWN"] = "UNKNOWN";
	/**
	* A package that was defined with a custom identifier.
	*/
	PACKAGE_TYPE["CUSTOM"] = "CUSTOM";
	/**
	* A package configured with the predefined lifetime identifier.
	*/
	PACKAGE_TYPE["LIFETIME"] = "LIFETIME";
	/**
	* A package configured with the predefined annual identifier.
	*/
	PACKAGE_TYPE["ANNUAL"] = "ANNUAL";
	/**
	* A package configured with the predefined six month identifier.
	*/
	PACKAGE_TYPE["SIX_MONTH"] = "SIX_MONTH";
	/**
	* A package configured with the predefined three month identifier.
	*/
	PACKAGE_TYPE["THREE_MONTH"] = "THREE_MONTH";
	/**
	* A package configured with the predefined two month identifier.
	*/
	PACKAGE_TYPE["TWO_MONTH"] = "TWO_MONTH";
	/**
	* A package configured with the predefined monthly identifier.
	*/
	PACKAGE_TYPE["MONTHLY"] = "MONTHLY";
	/**
	* A package configured with the predefined weekly identifier.
	*/
	PACKAGE_TYPE["WEEKLY"] = "WEEKLY";
})(PACKAGE_TYPE || (PACKAGE_TYPE = {}));
/**
* Enum indicating possible eligibility status for introductory pricing.
* @public
*/
var INTRO_ELIGIBILITY_STATUS;
(function(INTRO_ELIGIBILITY_STATUS) {
	/**
	* RevenueCat doesn't have enough information to determine eligibility.
	*/
	INTRO_ELIGIBILITY_STATUS[INTRO_ELIGIBILITY_STATUS["INTRO_ELIGIBILITY_STATUS_UNKNOWN"] = 0] = "INTRO_ELIGIBILITY_STATUS_UNKNOWN";
	/**
	* The user is not eligible for a free trial or intro pricing for this product.
	*/
	INTRO_ELIGIBILITY_STATUS[INTRO_ELIGIBILITY_STATUS["INTRO_ELIGIBILITY_STATUS_INELIGIBLE"] = 1] = "INTRO_ELIGIBILITY_STATUS_INELIGIBLE";
	/**
	* The user is eligible for a free trial or intro pricing for this product.
	*/
	INTRO_ELIGIBILITY_STATUS[INTRO_ELIGIBILITY_STATUS["INTRO_ELIGIBILITY_STATUS_ELIGIBLE"] = 2] = "INTRO_ELIGIBILITY_STATUS_ELIGIBLE";
	/**
	* There is no free trial or intro pricing for this product.
	*/
	INTRO_ELIGIBILITY_STATUS[INTRO_ELIGIBILITY_STATUS["INTRO_ELIGIBILITY_STATUS_NO_INTRO_OFFER_EXISTS"] = 3] = "INTRO_ELIGIBILITY_STATUS_NO_INTRO_OFFER_EXISTS";
})(INTRO_ELIGIBILITY_STATUS || (INTRO_ELIGIBILITY_STATUS = {}));
/**
* Enum indicating possible product categories.
* @public
*/
var PRODUCT_CATEGORY;
(function(PRODUCT_CATEGORY) {
	/**
	* A type of product for non-subscription.
	*/
	PRODUCT_CATEGORY["NON_SUBSCRIPTION"] = "NON_SUBSCRIPTION";
	/**
	* A type of product for subscriptions.
	*/
	PRODUCT_CATEGORY["SUBSCRIPTION"] = "SUBSCRIPTION";
	/**
	* A type of product for unknowns.
	*/
	PRODUCT_CATEGORY["UNKNOWN"] = "UNKNOWN";
})(PRODUCT_CATEGORY || (PRODUCT_CATEGORY = {}));
/**
* Enum indicating possible product types.
* @public
*/
var PRODUCT_TYPE;
(function(PRODUCT_TYPE) {
	/**
	* A consumable in-app purchase.
	*/
	PRODUCT_TYPE["CONSUMABLE"] = "CONSUMABLE";
	/**
	* A non-consumable in-app purchase. Only applies to Apple Store products.
	*/
	PRODUCT_TYPE["NON_CONSUMABLE"] = "NON_CONSUMABLE";
	/**
	* A non-renewing subscription. Only applies to Apple Store products.
	*/
	PRODUCT_TYPE["NON_RENEWABLE_SUBSCRIPTION"] = "NON_RENEWABLE_SUBSCRIPTION";
	/**
	* An auto-renewable subscription.
	*/
	PRODUCT_TYPE["AUTO_RENEWABLE_SUBSCRIPTION"] = "AUTO_RENEWABLE_SUBSCRIPTION";
	/**
	* A subscription that is pre-paid. Only applies to Google Play products.
	*/
	PRODUCT_TYPE["PREPAID_SUBSCRIPTION"] = "PREPAID_SUBSCRIPTION";
	/**
	* Unable to determine product type.
	*/
	PRODUCT_TYPE["UNKNOWN"] = "UNKNOWN";
})(PRODUCT_TYPE || (PRODUCT_TYPE = {}));
/**
* Enum with possible proration modes in a subscription upgrade or downgrade in the Play Store. Used only for Google.
* @deprecated Use STORE_REPLACEMENT_MODE
* @public
*/
var PRORATION_MODE;
(function(PRORATION_MODE) {
	PRORATION_MODE[PRORATION_MODE["UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY"] = 0] = "UNKNOWN_SUBSCRIPTION_UPGRADE_DOWNGRADE_POLICY";
	/**
	* Replacement takes effect immediately, and the remaining time will be
	* prorated and credited to the user.
	*/
	PRORATION_MODE[PRORATION_MODE["IMMEDIATE_WITH_TIME_PRORATION"] = 1] = "IMMEDIATE_WITH_TIME_PRORATION";
	/**
	* Replacement takes effect immediately, and the billing cycle remains the
	* same. The price for the remaining period will be charged. This option is
	* only available for subscription upgrade.
	*/
	PRORATION_MODE[PRORATION_MODE["IMMEDIATE_AND_CHARGE_PRORATED_PRICE"] = 2] = "IMMEDIATE_AND_CHARGE_PRORATED_PRICE";
	/**
	* Replacement takes effect immediately, and the new price will be charged on
	* next recurrence time. The billing cycle stays the same.
	*
	* This is the current default behavior.
	*/
	PRORATION_MODE[PRORATION_MODE["IMMEDIATE_WITHOUT_PRORATION"] = 3] = "IMMEDIATE_WITHOUT_PRORATION";
	/**
	* Replacement takes effect when the old plan expires, and the new price will
	* be charged at the same time.
	*/
	PRORATION_MODE[PRORATION_MODE["DEFERRED"] = 6] = "DEFERRED";
	/**
	* Replacement takes effect immediately, and the user is charged full price
	* of new plan and is given a full billing cycle of subscription,
	* plus remaining prorated time from the old plan.
	*/
	PRORATION_MODE[PRORATION_MODE["IMMEDIATE_AND_CHARGE_FULL_PRICE"] = 5] = "IMMEDIATE_AND_CHARGE_FULL_PRICE";
})(PRORATION_MODE || (PRORATION_MODE = {}));
/**
* Enum with possible proration modes in a subscription upgrade or downgrade in the Play Store or Galaxy Store. Used only on Android.
* @public
*/
var STORE_REPLACEMENT_MODE;
(function(STORE_REPLACEMENT_MODE) {
	/**
	* Old subscription is cancelled, and new subscription takes effect immediately.
	* User is charged for the full price of the new subscription on the old subscription's expiration date.
	*
	* This is the default behavior for the Galaxy and Play stores.
	*/
	STORE_REPLACEMENT_MODE["WITHOUT_PRORATION"] = "WITHOUT_PRORATION";
	/**
	* Replacement takes effect immediately, and the remaining time will be
	* prorated and credited to the user. This is the current default behavior.
	*/
	STORE_REPLACEMENT_MODE["WITH_TIME_PRORATION"] = "WITH_TIME_PRORATION";
	/**
	* Replacement takes effect immediately, and the user is charged full price of new plan and is
	* given a full billing cycle of subscription, plus remaining prorated time from the old plan.
	*
	* This mode is not supported by the Galaxy Store. If it is passed to the Galaxy Store, an error will be thrown.
	*/
	STORE_REPLACEMENT_MODE["CHARGE_FULL_PRICE"] = "CHARGE_FULL_PRICE";
	/**
	* Replacement takes effect immediately, and the billing cycle remains the
	* same. The price for the remaining period will be charged. This option is
	* only available for subscription upgrade.
	*/
	STORE_REPLACEMENT_MODE["CHARGE_PRORATED_PRICE"] = "CHARGE_PRORATED_PRICE";
	/**
	* Replacement takes effect when the old plan expires, and the new price will be charged at the same time.
	*/
	STORE_REPLACEMENT_MODE["DEFERRED"] = "DEFERRED";
})(STORE_REPLACEMENT_MODE || (STORE_REPLACEMENT_MODE = {}));
/**
* Enum indicating the billing plan type of an installment subscription. iOS only.
* @public
*/
var BILLING_PLAN_TYPE;
(function(BILLING_PLAN_TYPE) {
	/**
	* The customer pays in full when purchasing the product.
	*/
	BILLING_PLAN_TYPE["UP_FRONT"] = "UP_FRONT";
	/**
	* The customer pays in monthly installments.
	*/
	BILLING_PLAN_TYPE["MONTHLY"] = "MONTHLY";
	/**
	* Unable to determine the billing plan type.
	*/
	BILLING_PLAN_TYPE["UNKNOWN"] = "UNKNOWN";
})(BILLING_PLAN_TYPE || (BILLING_PLAN_TYPE = {}));
/**
* Recurrence mode for a pricing phase
* @public
*/
var RECURRENCE_MODE;
(function(RECURRENCE_MODE) {
	/**
	* Pricing phase repeats infinitely until cancellation
	*/
	RECURRENCE_MODE[RECURRENCE_MODE["INFINITE_RECURRING"] = 1] = "INFINITE_RECURRING";
	/**
	* Pricing phase repeats for a fixed number of billing periods
	*/
	RECURRENCE_MODE[RECURRENCE_MODE["FINITE_RECURRING"] = 2] = "FINITE_RECURRING";
	/**
	* Pricing phase does not repeat
	*/
	RECURRENCE_MODE[RECURRENCE_MODE["NON_RECURRING"] = 3] = "NON_RECURRING";
})(RECURRENCE_MODE || (RECURRENCE_MODE = {}));
/**
* Payment mode for offer pricing phases. Google Play only.
* @public
*/
var OFFER_PAYMENT_MODE;
(function(OFFER_PAYMENT_MODE) {
	/**
	* Subscribers don't pay until the specified period ends
	*/
	OFFER_PAYMENT_MODE["FREE_TRIAL"] = "FREE_TRIAL";
	/**
	* Subscribers pay up front for a specified period
	*/
	OFFER_PAYMENT_MODE["SINGLE_PAYMENT"] = "SINGLE_PAYMENT";
	/**
	* Subscribers pay a discounted amount for a specified number of periods
	*/
	OFFER_PAYMENT_MODE["DISCOUNTED_RECURRING_PAYMENT"] = "DISCOUNTED_RECURRING_PAYMENT";
})(OFFER_PAYMENT_MODE || (OFFER_PAYMENT_MODE = {}));
/**
* Time duration unit for Period.
* @public
*/
var PERIOD_UNIT;
(function(PERIOD_UNIT) {
	PERIOD_UNIT["DAY"] = "DAY";
	PERIOD_UNIT["WEEK"] = "WEEK";
	PERIOD_UNIT["MONTH"] = "MONTH";
	PERIOD_UNIT["YEAR"] = "YEAR";
	PERIOD_UNIT["UNKNOWN"] = "UNKNOWN";
})(PERIOD_UNIT || (PERIOD_UNIT = {}));
//#endregion
//#region node_modules/@revenuecat/purchases-typescript-internal-esm/dist/enums.js
/**
* @deprecated Use PRODUCT_CATEGORY
* @public
*/
var PURCHASE_TYPE;
(function(PURCHASE_TYPE) {
	/**
	* A type of SKU for in-app products.
	*/
	PURCHASE_TYPE["INAPP"] = "inapp";
	/**
	* A type of SKU for subscriptions.
	*/
	PURCHASE_TYPE["SUBS"] = "subs";
})(PURCHASE_TYPE || (PURCHASE_TYPE = {}));
/**
* Enum for billing features.
* Currently, these are only relevant for Google Play Android users:
* https://developer.android.com/reference/com/android/billingclient/api/BillingClient.FeatureType
* @public
*/
var BILLING_FEATURE;
(function(BILLING_FEATURE) {
	/**
	* Purchase/query for subscriptions.
	*/
	BILLING_FEATURE[BILLING_FEATURE["SUBSCRIPTIONS"] = 0] = "SUBSCRIPTIONS";
	/**
	* Subscriptions update/replace.
	*/
	BILLING_FEATURE[BILLING_FEATURE["SUBSCRIPTIONS_UPDATE"] = 1] = "SUBSCRIPTIONS_UPDATE";
	/**
	* Purchase/query for in-app items on VR.
	*/
	BILLING_FEATURE[BILLING_FEATURE["IN_APP_ITEMS_ON_VR"] = 2] = "IN_APP_ITEMS_ON_VR";
	/**
	* Purchase/query for subscriptions on VR.
	*/
	BILLING_FEATURE[BILLING_FEATURE["SUBSCRIPTIONS_ON_VR"] = 3] = "SUBSCRIPTIONS_ON_VR";
	/**
	* Launch a price change confirmation flow.
	*/
	BILLING_FEATURE[BILLING_FEATURE["PRICE_CHANGE_CONFIRMATION"] = 4] = "PRICE_CHANGE_CONFIRMATION";
})(BILLING_FEATURE || (BILLING_FEATURE = {}));
/**
* Enum for possible refund request results.
* @public
*/
var REFUND_REQUEST_STATUS;
(function(REFUND_REQUEST_STATUS) {
	/**
	* Apple has received the refund request.
	*/
	REFUND_REQUEST_STATUS[REFUND_REQUEST_STATUS["SUCCESS"] = 0] = "SUCCESS";
	/**
	* User canceled submission of the refund request.
	*/
	REFUND_REQUEST_STATUS[REFUND_REQUEST_STATUS["USER_CANCELLED"] = 1] = "USER_CANCELLED";
	/**
	* There was an error with the request. See message for more details.
	*/
	REFUND_REQUEST_STATUS[REFUND_REQUEST_STATUS["ERROR"] = 2] = "ERROR";
})(REFUND_REQUEST_STATUS || (REFUND_REQUEST_STATUS = {}));
/**
* Enum for possible log levels to print.
* @public
*/
var LOG_LEVEL;
(function(LOG_LEVEL) {
	LOG_LEVEL["VERBOSE"] = "VERBOSE";
	LOG_LEVEL["DEBUG"] = "DEBUG";
	LOG_LEVEL["INFO"] = "INFO";
	LOG_LEVEL["WARN"] = "WARN";
	LOG_LEVEL["ERROR"] = "ERROR";
})(LOG_LEVEL || (LOG_LEVEL = {}));
/**
* Enum for in-app message types.
* This can be used if you disable automatic in-app message from showing automatically.
* Then, you can pass what type of messages you want to show in the `showInAppMessages`
* method in Purchases.
* @public
*/
var IN_APP_MESSAGE_TYPE;
(function(IN_APP_MESSAGE_TYPE) {
	/**
	* In-app messages to indicate there has been a billing issue charging the user.
	*/
	IN_APP_MESSAGE_TYPE[IN_APP_MESSAGE_TYPE["BILLING_ISSUE"] = 0] = "BILLING_ISSUE";
	/**
	* iOS-only. This message will show if you increase the price of a subscription and
	* the user needs to opt-in to the increase.
	*/
	IN_APP_MESSAGE_TYPE[IN_APP_MESSAGE_TYPE["PRICE_INCREASE_CONSENT"] = 1] = "PRICE_INCREASE_CONSENT";
	/**
	* iOS-only. StoreKit generic messages.
	*/
	IN_APP_MESSAGE_TYPE[IN_APP_MESSAGE_TYPE["GENERIC"] = 2] = "GENERIC";
	/**
	* iOS-only. This message will show if the subscriber is eligible for an iOS win-back
	* offer and will allow the subscriber to redeem the offer.
	*/
	IN_APP_MESSAGE_TYPE[IN_APP_MESSAGE_TYPE["WIN_BACK_OFFER"] = 3] = "WIN_BACK_OFFER";
})(IN_APP_MESSAGE_TYPE || (IN_APP_MESSAGE_TYPE = {}));
/**
* Enum of entitlement verification modes.
* @public
*/
var ENTITLEMENT_VERIFICATION_MODE;
(function(ENTITLEMENT_VERIFICATION_MODE) {
	/**
	* The SDK will not perform any entitlement verification.
	*/
	ENTITLEMENT_VERIFICATION_MODE["DISABLED"] = "DISABLED";
	/**
	* Enable entitlement verification.
	*
	* If verification fails, this will be indicated with [VerificationResult.FAILED] in
	* the [EntitlementInfos.verification] and [EntitlementInfo.verification] properties but parsing will not fail
	* (i.e. Entitlements will still be granted).
	*
	* This can be useful if you want to handle verification failures to display an error/warning to the user
	* or to track this situation but still grant access.
	*/
	ENTITLEMENT_VERIFICATION_MODE["INFORMATIONAL"] = "INFORMATIONAL";
})(ENTITLEMENT_VERIFICATION_MODE || (ENTITLEMENT_VERIFICATION_MODE = {}));
/**
* The result of the verification process. For more details check: http://rev.cat/trusted-entitlements
*
* This is accomplished by preventing MiTM attacks between the SDK and the RevenueCat server.
* With verification enabled, the SDK ensures that the response created by the server was not
* modified by a third-party, and the response received is exactly what was sent.
*
* - Note: Verification is only performed if enabled using PurchasesConfiguration's
* entitlementVerificationMode property. This is disabled by default.
*
* @public
*/
var VERIFICATION_RESULT;
(function(VERIFICATION_RESULT) {
	/**
	* No verification was done.
	*
	* This value is returned when verification is not enabled in PurchasesConfiguration
	*/
	VERIFICATION_RESULT["NOT_REQUESTED"] = "NOT_REQUESTED";
	/**
	* Verification with our server was performed successfully.
	*/
	VERIFICATION_RESULT["VERIFIED"] = "VERIFIED";
	/**
	* Verification failed, possibly due to a MiTM attack.
	*/
	VERIFICATION_RESULT["FAILED"] = "FAILED";
	/**
	* Verification was performed on device.
	*/
	VERIFICATION_RESULT["VERIFIED_ON_DEVICE"] = "VERIFIED_ON_DEVICE";
})(VERIFICATION_RESULT || (VERIFICATION_RESULT = {}));
/**
* The result of presenting a paywall. This will be the last situation the user experienced before the
* paywall closed.
*
* @public
*/
var PAYWALL_RESULT;
(function(PAYWALL_RESULT) {
	/**
	* If the paywall wasn't presented. Only returned when using "presentPaywallIfNeeded"
	*/
	PAYWALL_RESULT["NOT_PRESENTED"] = "NOT_PRESENTED";
	/**
	* If an error happened during purchase/restoration.
	*/
	PAYWALL_RESULT["ERROR"] = "ERROR";
	/**
	* If the paywall was closed without performing an operation
	*/
	PAYWALL_RESULT["CANCELLED"] = "CANCELLED";
	/**
	* If a successful purchase happened inside the paywall
	*/
	PAYWALL_RESULT["PURCHASED"] = "PURCHASED";
	/**
	* If a successful restore happened inside the paywall
	*/
	PAYWALL_RESULT["RESTORED"] = "RESTORED";
})(PAYWALL_RESULT || (PAYWALL_RESULT = {}));
/**
* Defines which version of StoreKit may be used
* @public
*/
var STOREKIT_VERSION;
(function(STOREKIT_VERSION) {
	/**
	* Always use StoreKit 1.
	*/
	STOREKIT_VERSION["STOREKIT_1"] = "STOREKIT_1";
	/**
	* Always use StoreKit 2 (StoreKit 1 will be used if StoreKit 2 is not available in the current device.)
	* - Warning: Make sure you have an In-App Purchase Key configured in your app.
	* Please see https://rev.cat/in-app-purchase-key-configuration for more info.
	*/
	STOREKIT_VERSION["STOREKIT_2"] = "STOREKIT_2";
	/**
	* Let RevenueCat use the most appropriate version of StoreKit
	*/
	STOREKIT_VERSION["DEFAULT"] = "DEFAULT";
})(STOREKIT_VERSION || (STOREKIT_VERSION = {}));
/**
* Modes for completing the purchase process.
* @public
*/
var PURCHASES_ARE_COMPLETED_BY_TYPE;
(function(PURCHASES_ARE_COMPLETED_BY_TYPE) {
	/**
	* RevenueCat will **not** automatically acknowledge any purchases. You will have to do so manually.
	*
	* **Note:** failing to acknowledge a purchase within 3 days will lead to Google Play automatically issuing a
	* refund to the user.
	*
	* For more info, see [revenuecat.com](https://docs.revenuecat.com/docs/observer-mode#option-2-client-side).
	*/
	PURCHASES_ARE_COMPLETED_BY_TYPE["MY_APP"] = "MY_APP";
	/**
	* RevenueCat will automatically acknowledge verified purchases. No action is required by you.
	*/
	PURCHASES_ARE_COMPLETED_BY_TYPE["REVENUECAT"] = "REVENUECAT";
})(PURCHASES_ARE_COMPLETED_BY_TYPE || (PURCHASES_ARE_COMPLETED_BY_TYPE = {}));
//#endregion
//#region node_modules/@revenuecat/purchases-typescript-internal-esm/dist/webRedemption.js
/**
* The result type of a Redemption Link redemption attempt.
* @public
*/
var WebPurchaseRedemptionResultType;
(function(WebPurchaseRedemptionResultType) {
	/**
	* The redemption was successful.
	*/
	WebPurchaseRedemptionResultType["SUCCESS"] = "SUCCESS";
	/**
	* The redemption failed.
	*/
	WebPurchaseRedemptionResultType["ERROR"] = "ERROR";
	/**
	* The purchase associated to the link belongs to another user.
	*/
	WebPurchaseRedemptionResultType["PURCHASE_BELONGS_TO_OTHER_USER"] = "PURCHASE_BELONGS_TO_OTHER_USER";
	/**
	* The token is invalid.
	*/
	WebPurchaseRedemptionResultType["INVALID_TOKEN"] = "INVALID_TOKEN";
	/**
	* The token has expired. A new Redemption Link will be sent to the email used during purchase.
	*/
	WebPurchaseRedemptionResultType["EXPIRED"] = "EXPIRED";
})(WebPurchaseRedemptionResultType || (WebPurchaseRedemptionResultType = {}));
//#endregion
//#region node_modules/@revenuecat/purchases-capacitor/dist/esm/index.js
var esm_exports = /* @__PURE__ */ __exportAll({
	BILLING_FEATURE: () => BILLING_FEATURE,
	BILLING_PLAN_TYPE: () => BILLING_PLAN_TYPE,
	ENTITLEMENT_VERIFICATION_MODE: () => ENTITLEMENT_VERIFICATION_MODE,
	INTRO_ELIGIBILITY_STATUS: () => INTRO_ELIGIBILITY_STATUS,
	IN_APP_MESSAGE_TYPE: () => IN_APP_MESSAGE_TYPE,
	LOG_LEVEL: () => LOG_LEVEL,
	OFFER_PAYMENT_MODE: () => OFFER_PAYMENT_MODE,
	PACKAGE_TYPE: () => PACKAGE_TYPE,
	PAYWALL_RESULT: () => PAYWALL_RESULT,
	PERIOD_UNIT: () => PERIOD_UNIT,
	PRODUCT_CATEGORY: () => PRODUCT_CATEGORY,
	PRODUCT_TYPE: () => PRODUCT_TYPE,
	PRORATION_MODE: () => PRORATION_MODE,
	PURCHASES_ARE_COMPLETED_BY_TYPE: () => PURCHASES_ARE_COMPLETED_BY_TYPE,
	PURCHASE_TYPE: () => PURCHASE_TYPE,
	Purchases: () => Purchases,
	RECURRENCE_MODE: () => RECURRENCE_MODE,
	REFUND_REQUEST_STATUS: () => REFUND_REQUEST_STATUS,
	STOREKIT_VERSION: () => STOREKIT_VERSION,
	STORE_REPLACEMENT_MODE: () => STORE_REPLACEMENT_MODE,
	VERIFICATION_RESULT: () => VERIFICATION_RESULT,
	WebPurchaseRedemptionResultType: () => WebPurchaseRedemptionResultType,
	normalizePurchasesError: () => normalizePurchasesError
});
var nativePlugin = registerPlugin("Purchases", { web: () => Promise.resolve().then(() => web_exports).then((m) => new m.PurchasesWeb()) });
function normalizeRejection(result) {
	if (!(result instanceof Promise)) return result;
	const normalized = result.then(void 0, (error) => {
		throw normalizePurchasesError(error);
	});
	const remove = result.remove;
	if (typeof remove === "function") normalized.remove = remove;
	return normalized;
}
function normalizeRedemptionError(result) {
	if (!(result instanceof Promise)) return result;
	return result.then((redemption) => {
		normalizePurchasesError(redemption === null || redemption === void 0 ? void 0 : redemption.error);
		return redemption;
	});
}
function getNativeTrackCustomPaywallImpressionOptions(options) {
	var _a;
	const offering = options === null || options === void 0 ? void 0 : options.offering;
	const nativeOptions = {};
	if ((options === null || options === void 0 ? void 0 : options.paywallId) != null) nativeOptions.paywallId = options.paywallId;
	if (offering != null) {
		nativeOptions.offeringId = offering.identifier;
		const presentedOfferingContext = (_a = offering.availablePackages[0]) === null || _a === void 0 ? void 0 : _a.presentedOfferingContext;
		if (presentedOfferingContext != null) nativeOptions.presentedOfferingContext = presentedOfferingContext;
	} else if ((options === null || options === void 0 ? void 0 : options.offeringId) != null) nativeOptions.offeringId = options.offeringId;
	return nativeOptions;
}
function toNativeArgs(prop, args) {
	if (prop !== "trackCustomPaywallImpression") return args;
	return [getNativeTrackCustomPaywallImpressionOptions(args[0])];
}
var Purchases = new Proxy(nativePlugin, { get(target, prop, receiver) {
	const value = Reflect.get(target, prop, receiver);
	if (typeof value !== "function") return value;
	return new Proxy(value, { apply: (method, _thisArg, args) => {
		const result = normalizeRejection(Reflect.apply(method, target, toNativeArgs(prop, args)));
		return prop === "redeemWebPurchase" ? normalizeRedemptionError(result) : result;
	} });
} });
//#endregion
//#region node_modules/@revenuecat/purchases-capacitor/dist/esm/web.js
var web_exports = /* @__PURE__ */ __exportAll({ PurchasesWeb: () => PurchasesWeb });
var PurchasesWeb = class extends WebPlugin {
	constructor() {
		super(...arguments);
		this.shouldMockWebResults = false;
		this.webNotSupportedErrorMessage = "Web not supported in this plugin.";
		this.mockEmptyCustomerInfo = {
			entitlements: {
				all: {},
				active: {},
				verification: VERIFICATION_RESULT.NOT_REQUESTED
			},
			activeSubscriptions: [],
			allPurchasedProductIdentifiers: [],
			latestExpirationDate: null,
			firstSeen: "2023-08-31T15:11:21.445Z",
			originalAppUserId: "mock-web-user-id",
			requestDate: "2023-08-31T15:11:21.445Z",
			allExpirationDates: {},
			allPurchaseDates: {},
			originalApplicationVersion: null,
			originalPurchaseDate: null,
			managementURL: null,
			nonSubscriptionTransactions: [],
			subscriptionsByProductIdentifier: {}
		};
		this.mockEmptyVirtualCurrencies = { all: {} };
	}
	configure(_configuration) {
		return this.mockNonReturningFunctionIfEnabled("configure");
	}
	parseAsWebPurchaseRedemption(_options) {
		return this.mockReturningFunctionIfEnabled("parseAsWebPurchaseRedemption", { webPurchaseRedemption: null });
	}
	redeemWebPurchase(_options) {
		return this.mockReturningFunctionIfEnabled("redeemWebPurchase", { result: WebPurchaseRedemptionResultType.INVALID_TOKEN });
	}
	setMockWebResults(options) {
		this.shouldMockWebResults = options.shouldMockWebResults;
		return Promise.resolve();
	}
	setSimulatesAskToBuyInSandbox(_simulatesAskToBuyInSandbox) {
		return this.mockNonReturningFunctionIfEnabled("setSimulatesAskToBuyInSandbox");
	}
	addCustomerInfoUpdateListener(_customerInfoUpdateListener) {
		return this.mockReturningFunctionIfEnabled("addCustomerInfoUpdateListener", "mock-callback-id");
	}
	removeCustomerInfoUpdateListener(_options) {
		return this.mockReturningFunctionIfEnabled("removeCustomerInfoUpdateListener", { wasRemoved: false });
	}
	addShouldPurchasePromoProductListener(_shouldPurchasePromoProductListener) {
		return this.mockReturningFunctionIfEnabled("addShouldPurchasePromoProductListener", "mock-callback-id");
	}
	removeShouldPurchasePromoProductListener(_listenerToRemove) {
		return this.mockReturningFunctionIfEnabled("removeShouldPurchasePromoProductListener", { wasRemoved: false });
	}
	getOfferings() {
		return this.mockReturningFunctionIfEnabled("getOfferings", {
			all: {},
			current: null
		});
	}
	getCurrentOfferingForPlacement(_options) {
		return this.mockReturningFunctionIfEnabled("getCurrentOfferingForPlacement", null);
	}
	syncAttributesAndOfferingsIfNeeded() {
		return this.mockReturningFunctionIfEnabled("syncAttributesAndOfferingsIfNeeded", {
			all: {},
			current: null
		});
	}
	getProducts(_options) {
		return this.mockReturningFunctionIfEnabled("getProducts", { products: [] });
	}
	purchaseStoreProduct(_options) {
		const mockPurchaseResult = {
			productIdentifier: _options.product.identifier,
			customerInfo: this.mockEmptyCustomerInfo,
			transaction: this.mockTransaction(_options.product.identifier)
		};
		return this.mockReturningFunctionIfEnabled("purchaseStoreProduct", mockPurchaseResult);
	}
	purchaseDiscountedProduct(_options) {
		const mockPurchaseResult = {
			productIdentifier: _options.product.identifier,
			customerInfo: this.mockEmptyCustomerInfo,
			transaction: this.mockTransaction(_options.product.identifier)
		};
		return this.mockReturningFunctionIfEnabled("purchaseDiscountedProduct", mockPurchaseResult);
	}
	purchasePackage(_options) {
		const mockPurchaseResult = {
			productIdentifier: _options.aPackage.product.identifier,
			customerInfo: this.mockEmptyCustomerInfo,
			transaction: this.mockTransaction(_options.aPackage.product.identifier)
		};
		return this.mockReturningFunctionIfEnabled("purchasePackage", mockPurchaseResult);
	}
	purchaseSubscriptionOption(_options) {
		const mockPurchaseResult = {
			productIdentifier: _options.subscriptionOption.productId,
			customerInfo: this.mockEmptyCustomerInfo,
			transaction: this.mockTransaction(_options.subscriptionOption.productId)
		};
		return this.mockReturningFunctionIfEnabled("purchaseSubscriptionOption", mockPurchaseResult);
	}
	purchaseDiscountedPackage(_options) {
		const mockPurchaseResult = {
			productIdentifier: _options.aPackage.product.identifier,
			customerInfo: this.mockEmptyCustomerInfo,
			transaction: this.mockTransaction(_options.aPackage.product.identifier)
		};
		return this.mockReturningFunctionIfEnabled("purchaseDiscountedPackage", mockPurchaseResult);
	}
	restorePurchases() {
		const mockResponse = { customerInfo: this.mockEmptyCustomerInfo };
		return this.mockReturningFunctionIfEnabled("restorePurchases", mockResponse);
	}
	recordPurchase(options) {
		const mockResponse = { transaction: this.mockTransaction(options.productID) };
		return this.mockReturningFunctionIfEnabled("recordPurchase", mockResponse);
	}
	getAppUserID() {
		return this.mockReturningFunctionIfEnabled("getAppUserID", { appUserID: "test-web-user-id" });
	}
	getStorefront() {
		return this.mockReturningFunctionIfEnabled("getStorefront", { countryCode: "USA" });
	}
	logIn(_appUserID) {
		const mockLogInResult = {
			customerInfo: this.mockEmptyCustomerInfo,
			created: false
		};
		return this.mockReturningFunctionIfEnabled("logIn", mockLogInResult);
	}
	logOut() {
		const mockResponse = { customerInfo: this.mockEmptyCustomerInfo };
		return this.mockReturningFunctionIfEnabled("logOut", mockResponse);
	}
	setLogLevel(_level) {
		return this.mockNonReturningFunctionIfEnabled("setLogLevel");
	}
	setLogHandler(_logHandler) {
		return this.mockNonReturningFunctionIfEnabled("setLogHandler");
	}
	getCustomerInfo() {
		const mockResponse = { customerInfo: this.mockEmptyCustomerInfo };
		return this.mockReturningFunctionIfEnabled("getCustomerInfo", mockResponse);
	}
	syncPurchases() {
		return this.mockNonReturningFunctionIfEnabled("syncPurchases");
	}
	syncObserverModeAmazonPurchase(_options) {
		return this.mockNonReturningFunctionIfEnabled("syncObserverModeAmazonPurchase");
	}
	syncAmazonPurchase(_options) {
		return this.mockNonReturningFunctionIfEnabled("syncAmazonPurchase");
	}
	enableAdServicesAttributionTokenCollection() {
		return this.mockNonReturningFunctionIfEnabled("enableAdServicesAttributionTokenCollection");
	}
	isAnonymous() {
		return this.mockReturningFunctionIfEnabled("isAnonymous", { isAnonymous: false });
	}
	checkTrialOrIntroductoryPriceEligibility(_productIdentifiers) {
		return this.mockReturningFunctionIfEnabled("checkTrialOrIntroductoryPriceEligibility", {});
	}
	getPromotionalOffer(_options) {
		return this.mockReturningFunctionIfEnabled("getPromotionalOffer", void 0);
	}
	getEligibleWinBackOffersForProduct(_options) {
		return this.mockReturningFunctionIfEnabled("getEligibleWinBackOffersForProduct", { eligibleWinBackOffers: [] });
	}
	getEligibleWinBackOffersForPackage(_options) {
		return this.mockReturningFunctionIfEnabled("getEligibleWinBackOffersForPackage", { eligibleWinBackOffers: [] });
	}
	purchaseProductWithWinBackOffer(_options) {
		return this.mockReturningFunctionIfEnabled("purchaseProductWithWinBackOffer", void 0);
	}
	purchasePackageWithWinBackOffer(_options) {
		return this.mockReturningFunctionIfEnabled("purchasePackageWithWinBackOffer", void 0);
	}
	invalidateCustomerInfoCache() {
		return this.mockNonReturningFunctionIfEnabled("invalidateCustomerInfoCache");
	}
	presentCodeRedemptionSheet() {
		return this.mockNonReturningFunctionIfEnabled("presentCodeRedemptionSheet");
	}
	setAttributes(_attributes) {
		return this.mockNonReturningFunctionIfEnabled("setAttributes");
	}
	setEmail(_email) {
		return this.mockNonReturningFunctionIfEnabled("setEmail");
	}
	setPhoneNumber(_phoneNumber) {
		return this.mockNonReturningFunctionIfEnabled("setPhoneNumber");
	}
	setDisplayName(_displayName) {
		return this.mockNonReturningFunctionIfEnabled("setDisplayName");
	}
	setPushToken(_pushToken) {
		return this.mockNonReturningFunctionIfEnabled("setPushToken");
	}
	setProxyURL(_url) {
		return this.mockNonReturningFunctionIfEnabled("setProxyURL");
	}
	collectDeviceIdentifiers() {
		return this.mockNonReturningFunctionIfEnabled("collectDeviceIdentifiers");
	}
	setAdjustID(_adjustID) {
		return this.mockNonReturningFunctionIfEnabled("setAdjustID");
	}
	setAppsflyerID(_appsflyerID) {
		return this.mockNonReturningFunctionIfEnabled("setAppsflyerID");
	}
	setFBAnonymousID(_fbAnonymousID) {
		return this.mockNonReturningFunctionIfEnabled("setFBAnonymousID");
	}
	setMparticleID(_mparticleID) {
		return this.mockNonReturningFunctionIfEnabled("setMparticleID");
	}
	setCleverTapID(_cleverTapID) {
		return this.mockNonReturningFunctionIfEnabled("setCleverTapID");
	}
	setMixpanelDistinctID(_mixpanelDistinctID) {
		return this.mockNonReturningFunctionIfEnabled("setMixpanelDistinctID");
	}
	setFirebaseAppInstanceID(_firebaseAppInstanceID) {
		return this.mockNonReturningFunctionIfEnabled("setFirebaseAppInstanceID");
	}
	setOnesignalID(_onesignalID) {
		return this.mockNonReturningFunctionIfEnabled("setOnesignalID");
	}
	setOnesignalUserID(_onesignalUserID) {
		return this.mockNonReturningFunctionIfEnabled("setOnesignalUserID");
	}
	setSingularDeviceID(_singularDeviceID) {
		return this.mockNonReturningFunctionIfEnabled("setSingularDeviceID");
	}
	setAirshipChannelID(_airshipChannelID) {
		return this.mockNonReturningFunctionIfEnabled("setAirshipChannelID");
	}
	setMediaSource(_mediaSource) {
		return this.mockNonReturningFunctionIfEnabled("setMediaSource");
	}
	setCampaign(_campaign) {
		return this.mockNonReturningFunctionIfEnabled("setCampaign");
	}
	setAdGroup(_adGroup) {
		return this.mockNonReturningFunctionIfEnabled("setAdGroup");
	}
	setAd(_ad) {
		return this.mockNonReturningFunctionIfEnabled("setAd");
	}
	setKeyword(_keyword) {
		return this.mockNonReturningFunctionIfEnabled("setKeyword");
	}
	setCreative(_creative) {
		return this.mockNonReturningFunctionIfEnabled("setCreative");
	}
	canMakePayments(_features) {
		return this.mockReturningFunctionIfEnabled("canMakePayments", { canMakePayments: true });
	}
	beginRefundRequestForActiveEntitlement() {
		const mockResult = { refundRequestStatus: REFUND_REQUEST_STATUS.USER_CANCELLED };
		return this.mockReturningFunctionIfEnabled("beginRefundRequestForActiveEntitlement", mockResult);
	}
	beginRefundRequestForEntitlement(_entitlementInfo) {
		const mockResult = { refundRequestStatus: REFUND_REQUEST_STATUS.USER_CANCELLED };
		return this.mockReturningFunctionIfEnabled("beginRefundRequestForEntitlement", mockResult);
	}
	beginRefundRequestForProduct(_storeProduct) {
		const mockResult = { refundRequestStatus: REFUND_REQUEST_STATUS.USER_CANCELLED };
		return this.mockReturningFunctionIfEnabled("beginRefundRequestForProduct", mockResult);
	}
	showInAppMessages(_options) {
		return this.mockNonReturningFunctionIfEnabled("showInAppMessages");
	}
	isConfigured() {
		return this.mockReturningFunctionIfEnabled("isConfigured", { isConfigured: true });
	}
	overridePreferredUILocale(_options) {
		return this.mockNonReturningFunctionIfEnabled("overridePreferredUILocale");
	}
	getVirtualCurrencies() {
		return this.mockReturningFunctionIfEnabled("getVirtualCurrencies", { virtualCurrencies: this.mockEmptyVirtualCurrencies });
	}
	invalidateVirtualCurrenciesCache() {
		return this.mockNonReturningFunctionIfEnabled("invalidateVirtualCurrenciesCache");
	}
	getCachedVirtualCurrencies() {
		return this.mockReturningFunctionIfEnabled("getCachedVirtualCurrencies", { cachedVirtualCurrencies: this.mockEmptyVirtualCurrencies });
	}
	trackCustomPaywallImpression(_options) {
		return this.mockNonReturningFunctionIfEnabled("trackCustomPaywallImpression");
	}
	mockTransaction(productIdentifier) {
		return {
			productIdentifier,
			purchaseDate: (/* @__PURE__ */ new Date()).toISOString(),
			transactionIdentifier: "",
			purchaseToken: null,
			originalJson: null,
			signature: null
		};
	}
	mockNonReturningFunctionIfEnabled(functionName) {
		if (!this.shouldMockWebResults) return Promise.reject(this.webNotSupportedErrorMessage);
		console.log(`${functionName} called on web with mocking enabled. No-op`);
		return Promise.resolve();
	}
	mockReturningFunctionIfEnabled(functionName, returnValue) {
		if (!this.shouldMockWebResults) return Promise.reject(this.webNotSupportedErrorMessage);
		console.log(`${functionName} called on web with mocking enabled. Returning mocked value`);
		return Promise.resolve(returnValue);
	}
};
//#endregion
export { esm_exports as t };
