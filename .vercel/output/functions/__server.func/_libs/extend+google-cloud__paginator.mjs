import { i as __require, t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/extend/index.js
var require_extend = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var hasOwn = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	var defineProperty = Object.defineProperty;
	var gOPD = Object.getOwnPropertyDescriptor;
	var isArray = function isArray(arr) {
		if (typeof Array.isArray === "function") return Array.isArray(arr);
		return toStr.call(arr) === "[object Array]";
	};
	var isPlainObject = function isPlainObject(obj) {
		if (!obj || toStr.call(obj) !== "[object Object]") return false;
		var hasOwnConstructor = hasOwn.call(obj, "constructor");
		var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
		if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) return false;
		var key;
		for (key in obj);
		return typeof key === "undefined" || hasOwn.call(obj, key);
	};
	var setProperty = function setProperty(target, options) {
		if (defineProperty && options.name === "__proto__") defineProperty(target, options.name, {
			enumerable: true,
			configurable: true,
			value: options.newValue,
			writable: true
		});
		else target[options.name] = options.newValue;
	};
	var getProperty = function getProperty(obj, name) {
		if (name === "__proto__") {
			if (!hasOwn.call(obj, name)) return;
			else if (gOPD) return gOPD(obj, name).value;
		}
		return obj[name];
	};
	module.exports = function extend() {
		var options, name, src, copy, copyIsArray, clone;
		var target = arguments[0];
		var i = 1;
		var length = arguments.length;
		var deep = false;
		if (typeof target === "boolean") {
			deep = target;
			target = arguments[1] || {};
			i = 2;
		}
		if (target == null || typeof target !== "object" && typeof target !== "function") target = {};
		for (; i < length; ++i) {
			options = arguments[i];
			if (options != null) for (name in options) {
				src = getProperty(target, name);
				copy = getProperty(options, name);
				if (target !== copy) {
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else clone = src && isPlainObject(src) ? src : {};
						setProperty(target, {
							name,
							newValue: extend(deep, clone, copy)
						});
					} else if (typeof copy !== "undefined") setProperty(target, {
						name,
						newValue: copy
					});
				}
			}
		}
		return target;
	};
}));
//#endregion
//#region node_modules/@google-cloud/storage/node_modules/@google-cloud/paginator/build/src/resource-stream.js
var require_resource_stream = /* @__PURE__ */ __commonJSMin(((exports) => {
	/*!
	* Copyright 2019 Google Inc. All Rights Reserved.
	*
	* Licensed under the Apache License, Version 2.0 (the "License");
	* you may not use this file except in compliance with the License.
	* You may obtain a copy of the License at
	*
	*      http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing, software
	* distributed under the License is distributed on an "AS IS" BASIS,
	* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	* See the License for the specific language governing permissions and
	* limitations under the License.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ResourceStream = void 0;
	var stream_1 = __require("stream");
	var ResourceStream = class extends stream_1.Transform {
		_ended;
		_maxApiCalls;
		_nextQuery;
		_otherArgs;
		_reading;
		_requestFn;
		_requestsMade;
		_resultsToSend;
		constructor(args, requestFn) {
			const options = Object.assign({ objectMode: true }, args.streamOptions);
			super(options);
			this._ended = false;
			this._maxApiCalls = args.maxApiCalls === -1 ? Infinity : args.maxApiCalls;
			this._nextQuery = args.query;
			this._reading = false;
			this._requestFn = requestFn;
			this._requestsMade = 0;
			this._resultsToSend = args.maxResults === -1 ? Infinity : args.maxResults;
			this._otherArgs = [];
		}
		end(...args) {
			this._ended = true;
			return super.end(...args);
		}
		_read() {
			if (this._reading) return;
			this._reading = true;
			try {
				this._requestFn(this._nextQuery, (err, results, nextQuery, ...otherArgs) => {
					if (err) {
						this.destroy(err);
						return;
					}
					this._otherArgs = otherArgs;
					this._nextQuery = nextQuery;
					if (this._resultsToSend !== Infinity) {
						results = results.splice(0, this._resultsToSend);
						this._resultsToSend -= results.length;
					}
					let more = true;
					for (const result of results) {
						if (this._ended) break;
						more = this.push(result);
					}
					const isFinished = !this._nextQuery || this._resultsToSend < 1;
					const madeMaxCalls = ++this._requestsMade >= this._maxApiCalls;
					if (isFinished || madeMaxCalls) this.end();
					if (more && !this._ended) setImmediate(() => this._read());
					this._reading = false;
				});
			} catch (e) {
				this.destroy(e);
			}
		}
	};
	exports.ResourceStream = ResourceStream;
}));
//#endregion
//#region node_modules/@google-cloud/storage/node_modules/@google-cloud/paginator/build/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports) => {
	/*!
	* Copyright 2015 Google Inc. All Rights Reserved.
	*
	* Licensed under the Apache License, Version 2.0 (the "License");
	* you may not use this file except in compliance with the License.
	* You may obtain a copy of the License at
	*
	*      http://www.apache.org/licenses/LICENSE-2.0
	*
	* Unless required by applicable law or agreed to in writing, software
	* distributed under the License is distributed on an "AS IS" BASIS,
	* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	* See the License for the specific language governing permissions and
	* limitations under the License.
	*/
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ResourceStream = exports.paginator = exports.Paginator = void 0;
	/*!
	* @module common/paginator
	*/
	var extend = require_extend();
	var resource_stream_1 = require_resource_stream();
	Object.defineProperty(exports, "ResourceStream", {
		enumerable: true,
		get: function() {
			return resource_stream_1.ResourceStream;
		}
	});
	/*! Developer Documentation
	*
	* paginator is used to auto-paginate `nextQuery` methods as well as
	* streamifying them.
	*
	* Before:
	*
	*   search.query('done=true', function(err, results, nextQuery) {
	*     search.query(nextQuery, function(err, results, nextQuery) {});
	*   });
	*
	* After:
	*
	*   search.query('done=true', function(err, results) {});
	*
	* Methods to extend should be written to accept callbacks and return a
	* `nextQuery`.
	*/
	var Paginator = class {
		/**
		* Cache the original method, then overwrite it on the Class's prototype.
		*
		* @param {function} Class - The parent class of the methods to extend.
		* @param {string|string[]} methodNames - Name(s) of the methods to extend.
		*/
		extend(Class, methodNames) {
			if (typeof methodNames === "string") methodNames = [methodNames];
			methodNames.forEach((methodName) => {
				const originalMethod = Class.prototype[methodName];
				Class.prototype[methodName + "_"] = originalMethod;
				Class.prototype[methodName] = function(...args) {
					const parsedArguments = paginator.parseArguments_(args);
					return paginator.run_(parsedArguments, originalMethod.bind(this));
				};
			});
		}
		/**
		* Wraps paginated API calls in a readable object stream.
		*
		* This method simply calls the nextQuery recursively, emitting results to a
		* stream. The stream ends when `nextQuery` is null.
		*
		* `maxResults` will act as a cap for how many results are fetched and emitted
		* to the stream.
		*
		* @param {string} methodName - Name of the method to streamify.
		* @return {function} - Wrapped function.
		*/
		streamify(methodName) {
			return function(...args) {
				const parsedArguments = paginator.parseArguments_(args);
				const originalMethod = this[methodName + "_"] || this[methodName];
				return paginator.runAsStream_(parsedArguments, originalMethod.bind(this));
			};
		}
		/**
		* Parse a pseudo-array `arguments` for a query and callback.
		*
		* @param {array} args - The original `arguments` pseduo-array that the original
		*     method received.
		*/
		parseArguments_(args) {
			let query;
			let autoPaginate = true;
			let maxApiCalls = -1;
			let maxResults = -1;
			let callback;
			const firstArgument = args[0];
			const lastArgument = args[args.length - 1];
			if (typeof firstArgument === "function") callback = firstArgument;
			else query = firstArgument;
			if (typeof lastArgument === "function") callback = lastArgument;
			if (typeof query === "object") {
				query = extend(true, {}, query);
				if (query.maxResults && typeof query.maxResults === "number") maxResults = query.maxResults;
				else if (typeof query.pageSize === "number") maxResults = query.pageSize;
				if (query.maxApiCalls && typeof query.maxApiCalls === "number") {
					maxApiCalls = query.maxApiCalls;
					delete query.maxApiCalls;
				}
				if (maxResults !== -1 || query.autoPaginate === false) autoPaginate = false;
			}
			const parsedArguments = {
				query: query || {},
				autoPaginate,
				maxApiCalls,
				maxResults,
				callback
			};
			parsedArguments.streamOptions = extend(true, {}, parsedArguments.query);
			delete parsedArguments.streamOptions.autoPaginate;
			delete parsedArguments.streamOptions.maxResults;
			delete parsedArguments.streamOptions.pageSize;
			return parsedArguments;
		}
		/**
		* This simply checks to see if `autoPaginate` is set or not, if it's true
		* then we buffer all results, otherwise simply call the original method.
		*
		* @param {array} parsedArguments - Parsed arguments from the original method
		*     call.
		* @param {object=|string=} parsedArguments.query - Query object. This is most
		*     commonly an object, but to make the API more simple, it can also be a
		*     string in some places.
		* @param {function=} parsedArguments.callback - Callback function.
		* @param {boolean} parsedArguments.autoPaginate - Auto-pagination enabled.
		* @param {boolean} parsedArguments.maxApiCalls - Maximum API calls to make.
		* @param {number} parsedArguments.maxResults - Maximum results to return.
		* @param {function} originalMethod - The cached method that accepts a callback
		*     and returns `nextQuery` to receive more results.
		*/
		run_(parsedArguments, originalMethod) {
			const query = parsedArguments.query;
			const callback = parsedArguments.callback;
			if (!parsedArguments.autoPaginate) return originalMethod(query, callback);
			const results = new Array();
			let otherArgs = [];
			const promise = new Promise((resolve, reject) => {
				const stream = paginator.runAsStream_(parsedArguments, originalMethod);
				stream.on("error", reject).on("data", (data) => results.push(data)).on("end", () => {
					otherArgs = stream._otherArgs || [];
					resolve(results);
				});
			});
			if (!callback) return promise.then((results) => [
				results,
				query,
				...otherArgs
			]);
			promise.then((results) => callback(null, results, query, ...otherArgs), (err) => callback(err));
		}
		/**
		* This method simply calls the nextQuery recursively, emitting results to a
		* stream. The stream ends when `nextQuery` is null.
		*
		* `maxResults` will act as a cap for how many results are fetched and emitted
		* to the stream.
		*
		* @param {object=|string=} parsedArguments.query - Query object. This is most
		*     commonly an object, but to make the API more simple, it can also be a
		*     string in some places.
		* @param {function=} parsedArguments.callback - Callback function.
		* @param {boolean} parsedArguments.autoPaginate - Auto-pagination enabled.
		* @param {boolean} parsedArguments.maxApiCalls - Maximum API calls to make.
		* @param {number} parsedArguments.maxResults - Maximum results to return.
		* @param {function} originalMethod - The cached method that accepts a callback
		*     and returns `nextQuery` to receive more results.
		* @return {stream} - Readable object stream.
		*/
		runAsStream_(parsedArguments, originalMethod) {
			return new resource_stream_1.ResourceStream(parsedArguments, originalMethod);
		}
	};
	exports.Paginator = Paginator;
	var paginator = new Paginator();
	exports.paginator = paginator;
}));
//#endregion
export { require_extend as n, require_src as t };
