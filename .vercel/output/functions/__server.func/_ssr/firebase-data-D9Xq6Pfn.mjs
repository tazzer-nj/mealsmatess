import "../_libs/firebase.mjs";
import { c as setDoc, d as collection, f as doc, i as limit, l as updateDoc, n as getDoc, o as orderBy, r as getDocs, s as query, t as deleteDoc, u as where } from "../_libs/@firebase/firestore+[...].mjs";
import { a as db, i as auth } from "./hub-surface-DqCmg7ui.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/firebase-data-D9Xq6Pfn.js
var PERSONAL_PATHS = {
	favorites: "favorites",
	grocery_items: "grocery",
	pantry_items: "pantry",
	meal_plans: "mealPlans",
	nutrition_logs: "nutritionLogs"
};
var PUBLIC_READ = /* @__PURE__ */ new Set([
	"recipes",
	"restaurants",
	"restaurant_locations",
	"menu_items",
	"restaurant_promotions",
	"restaurant_reviews",
	"announcements",
	"ad_placements"
]);
var OWNER_FIELDS = {
	restaurant_orders: "customer_id",
	user_roles: "user_id"
};
function currentUserId() {
	const uid = auth.currentUser?.uid;
	if (!uid) throw new Error("Sign in to access your MealMate data.");
	return uid;
}
function rootCollection(table) {
	return collection(db, table === "profiles" ? "users" : table);
}
function scopedCollection(table) {
	const uid = currentUserId();
	const path = PERSONAL_PATHS[table];
	return path ? collection(db, "users", uid, path) : rootCollection(table);
}
function compare(a, b) {
	if (a instanceof Date) a = a.getTime();
	if (b instanceof Date) b = b.getTime();
	if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
	return Number(a) - Number(b);
}
function applyFilter(row, filter) {
	const value = row[filter.field];
	switch (filter.op) {
		case "eq": return value === filter.value;
		case "neq": return value !== filter.value;
		case "gt": return compare(value, filter.value) > 0;
		case "gte": return compare(value, filter.value) >= 0;
		case "lt": return compare(value, filter.value) < 0;
		case "lte": return compare(value, filter.value) <= 0;
		case "in": return Array.isArray(filter.value) && filter.value.includes(value);
		case "is": return filter.value === null ? value == null : value === filter.value;
		case "ilike":
		case "like": return String(value ?? "").toLowerCase().includes(String(filter.value ?? "").replaceAll("%", "").toLowerCase());
		default: return false;
	}
}
var BrowserFirestoreQuery = class {
	table;
	filters = [];
	orders = [];
	action = "select";
	values = {};
	columns = "*";
	selected = false;
	one = null;
	maxRows = null;
	rowRange = null;
	exactCount = false;
	head = false;
	constructor(table) {
		this.table = table;
	}
	select(columns = "*", options) {
		this.columns = columns;
		this.selected = true;
		this.exactCount = options?.count === "exact";
		this.head = options?.head === true;
		return this;
	}
	eq(field, value) {
		this.filters.push({
			field,
			op: "eq",
			value
		});
		return this;
	}
	neq(field, value) {
		this.filters.push({
			field,
			op: "neq",
			value
		});
		return this;
	}
	gt(field, value) {
		this.filters.push({
			field,
			op: "gt",
			value
		});
		return this;
	}
	gte(field, value) {
		this.filters.push({
			field,
			op: "gte",
			value
		});
		return this;
	}
	lt(field, value) {
		this.filters.push({
			field,
			op: "lt",
			value
		});
		return this;
	}
	lte(field, value) {
		this.filters.push({
			field,
			op: "lte",
			value
		});
		return this;
	}
	in(field, value) {
		this.filters.push({
			field,
			op: "in",
			value
		});
		return this;
	}
	is(field, value) {
		this.filters.push({
			field,
			op: "is",
			value
		});
		return this;
	}
	ilike(field, value) {
		this.filters.push({
			field,
			op: "ilike",
			value
		});
		return this;
	}
	like(field, value) {
		this.filters.push({
			field,
			op: "like",
			value
		});
		return this;
	}
	order(field, options) {
		this.orders.push({
			field,
			ascending: options?.ascending !== false
		});
		return this;
	}
	limit(value) {
		this.maxRows = Math.max(0, value);
		return this;
	}
	range(start, end) {
		this.rowRange = [Math.max(0, start), Math.max(start, end)];
		return this;
	}
	single() {
		this.one = "single";
		return this.execute();
	}
	maybeSingle() {
		this.one = "maybeSingle";
		return this.execute();
	}
	insert(values) {
		this.action = "insert";
		this.values = values;
		return this;
	}
	update(values) {
		this.action = "update";
		this.values = values;
		return this;
	}
	delete() {
		this.action = "delete";
		return this;
	}
	then(onfulfilled, onrejected) {
		return this.execute().then(onfulfilled, onrejected);
	}
	async execute() {
		try {
			const uid = currentUserId();
			const isPersonal = Boolean(PERSONAL_PATHS[this.table]);
			if (this.table !== "profiles" && !isPersonal && !PUBLIC_READ.has(this.table) && !OWNER_FIELDS[this.table]) throw new Error(`Forbidden: browser access to ${this.table} is disabled.`);
			const collectionRef = scopedCollection(this.table);
			if (this.table === "profiles") {
				if (this.action === "select" || this.action === "update") {
					const idFilter = this.filters.find((filter) => filter.field === "id" && filter.op === "eq");
					if (!idFilter || idFilter.value !== uid) throw new Error("Forbidden: profile access must be scoped to the signed-in user.");
					const ref = doc(db, "users", uid);
					if (this.action === "update") {
						await updateDoc(ref, this.values);
						return {
							data: null,
							error: null
						};
					}
					const snapshot = await getDoc(ref);
					const row = snapshot.exists() ? {
						id: snapshot.id,
						...snapshot.data()
					} : null;
					return this.singleResult(row ? [row] : []);
				}
			}
			if (this.action !== "select" && !isPersonal) throw new Error(`Forbidden: direct writes to ${this.table} are disabled.`);
			if (this.action === "insert") return await this.insertRows(collectionRef, uid);
			const queryFilters = [...this.filters];
			const ownerField = OWNER_FIELDS[this.table];
			if (ownerField) {
				const ownerFilter = queryFilters.find((filter) => filter.field === ownerField && filter.op === "eq");
				if (ownerFilter && ownerFilter.value !== uid) throw new Error("Forbidden: records must belong to the signed-in user.");
				if (!ownerFilter) queryFilters.push({
					field: ownerField,
					op: "eq",
					value: uid
				});
			}
			const queryConstraints = [];
			for (const filter of queryFilters) if ([
				"eq",
				"gt",
				"gte",
				"lt",
				"lte",
				"in",
				"is"
			].includes(filter.op)) {
				const operator = filter.op === "is" ? "==" : filter.op;
				queryConstraints.push(where(filter.field, operator, filter.value));
			}
			for (const item of this.orders) queryConstraints.push(orderBy(item.field, item.ascending ? "asc" : "desc"));
			if (this.maxRows != null) queryConstraints.push(limit(this.maxRows + (this.rowRange?.[0] ?? 0)));
			let rows = (await getDocs(query(collectionRef, ...queryConstraints))).docs.map((item) => ({
				id: item.id,
				...item.data()
			}));
			rows = rows.filter((row) => queryFilters.every((filter) => applyFilter(row, filter)));
			if (PERSONAL_PATHS[this.table]) rows = rows.map((row) => ({
				...row,
				user_id: row.user_id ?? uid
			}));
			if (this.rowRange) rows = rows.slice(this.rowRange[0], this.rowRange[1] + 1);
			if (this.maxRows != null) rows = rows.slice(0, this.maxRows);
			const count = rows.length;
			if (this.action === "update" || this.action === "delete") {
				if (this.filters.length === 0) throw new Error(`Refusing an unfiltered ${this.action} on ${this.table}.`);
				const updateValues = this.values;
				if (this.action === "update" && updateValues["user_id"] != null && updateValues["user_id"] !== uid) throw new Error("Forbidden: record ownership cannot be changed.");
				await Promise.all(rows.map((row) => {
					const ref = doc(collectionRef, row.id);
					return this.action === "delete" ? deleteDoc(ref) : updateDoc(ref, updateValues);
				}));
				return {
					data: this.selected ? rows : null,
					error: null,
					...this.exactCount ? { count } : {}
				};
			}
			if (this.columns.includes("(") && !this.head) rows = await this.expandRelations(rows);
			if (this.one === "single" && rows.length !== 1) throw new Error(`Expected one ${this.table} record, found ${rows.length}.`);
			if (this.one === "maybeSingle" && rows.length > 1) throw new Error(`Expected at most one ${this.table} record, found ${rows.length}.`);
			return {
				data: this.head ? null : this.one ? rows[0] ?? null : rows,
				error: null,
				...this.exactCount ? { count } : {}
			};
		} catch (error) {
			return {
				data: null,
				error: error instanceof Error ? error : new Error(String(error)),
				count: null
			};
		}
	}
	singleResult(rows) {
		if (this.one === "single" && rows.length !== 1) return {
			data: null,
			error: /* @__PURE__ */ new Error(`Expected one ${this.table} record.`)
		};
		if (this.one === "maybeSingle" && rows.length > 1) return {
			data: null,
			error: /* @__PURE__ */ new Error(`Expected at most one ${this.table} record.`)
		};
		return {
			data: this.head ? null : this.one ? rows[0] ?? null : rows,
			error: null,
			...this.exactCount ? { count: rows.length } : {}
		};
	}
	async insertRows(collectionRef, uid) {
		const values = Array.isArray(this.values) ? this.values : [this.values];
		const created = [];
		for (const input of values) {
			const ownerField = PERSONAL_PATHS[this.table] ? "user_id" : null;
			if (ownerField && input[ownerField] != null && input[ownerField] !== uid) throw new Error("Forbidden: cannot create a record for another user.");
			const ref = doc(collectionRef);
			const row = {
				...input,
				id: ref.id,
				...ownerField ? { [ownerField]: uid } : {},
				...PERSONAL_PATHS[this.table] ? { created_at: input["created_at"] ?? (/* @__PURE__ */ new Date()).toISOString() } : {},
				...this.table === "grocery_items" ? { checked: input["checked"] ?? false } : {}
			};
			await setDoc(ref, row);
			created.push(row);
		}
		return {
			data: this.selected ? created : null,
			error: null
		};
	}
	async expandRelations(rows) {
		const aliases = [...this.columns.matchAll(/([a-z_]+)\s*\(/g)].map((match) => match[1]);
		return Promise.all(rows.map(async (row) => {
			const expanded = { ...row };
			for (const alias of aliases) {
				if (alias === "recipes" && row.recipe_id) {
					const snapshot = await getDoc(doc(db, "recipes", String(row.recipe_id)));
					expanded[alias] = snapshot.exists() ? {
						id: snapshot.id,
						...snapshot.data()
					} : null;
					continue;
				}
				if (alias === "restaurants" && row.restaurant_id) {
					const snapshot = await getDoc(doc(db, "restaurants", String(row.restaurant_id)));
					expanded[alias] = snapshot.exists() ? {
						id: snapshot.id,
						...snapshot.data()
					} : null;
					continue;
				}
				const relationship = alias === "restaurant_locations" && this.table === "restaurants" ? {
					field: "restaurant_id",
					parent: row.id
				} : alias === "order_items" && this.table === "restaurant_orders" ? {
					field: "order_id",
					parent: row.id
				} : null;
				if (relationship) expanded[alias] = (await getDocs(query(collection(db, alias), where(relationship.field, "==", relationship.parent)))).docs.map((item) => ({
					id: item.id,
					...item.data()
				}));
			}
			return expanded;
		}));
	}
};
var firebaseData = { from(table) {
	return new BrowserFirestoreQuery(table);
} };
//#endregion
export { firebaseData as t };
