//#region node_modules/.nitro/vite/services/ssr/assets/xp-CfZ9EY1i.js
/** Client-safe XP config: actions, levels and helpers. No server imports. */
var XP_ACTIONS = {
	planned_meal_completed: {
		points: 25,
		label: "Completed a planned meal"
	},
	recipe_cooked: {
		points: 30,
		label: "Cooked a recipe"
	},
	grocery_list_completed: {
		points: 40,
		label: "Completed a grocery list"
	},
	full_day_tracked: {
		points: 50,
		label: "Tracked a full day"
	},
	weekly_plan_completed: {
		points: 150,
		label: "Built a weekly plan"
	},
	streak_7: {
		points: 200,
		label: "7-day streak"
	},
	weekly_challenge: {
		points: 250,
		label: "Weekly challenge"
	},
	monthly_challenge: {
		points: 750,
		label: "Monthly challenge"
	},
	premium_purchase: {
		points: 500,
		label: "Went Premium"
	}
};
var LEVELS = [
	{
		min: 0,
		name: "Beginner",
		emoji: "🌱"
	},
	{
		min: 5e3,
		name: "Food Explorer",
		emoji: "🧭"
	},
	{
		min: 15e3,
		name: "Home Chef",
		emoji: "🍳"
	},
	{
		min: 3e4,
		name: "MealMaster",
		emoji: "👨‍🍳"
	},
	{
		min: 5e4,
		name: "MealMate Elite",
		emoji: "💎"
	}
];
var ELITE_XP = 5e4;
function levelFor(totalXp) {
	let index = 0;
	for (let i = 0; i < LEVELS.length; i++) if (totalXp >= LEVELS[i].min) index = i;
	const current = LEVELS[index];
	const next = LEVELS[index + 1] ?? null;
	const span = next ? next.min - current.min : 1;
	const into = totalXp - current.min;
	return {
		index,
		level: index + 1,
		name: current.name,
		emoji: current.emoji,
		currentMin: current.min,
		nextMin: next?.min ?? null,
		nextName: next?.name ?? null,
		progress: next ? Math.min(1, into / span) : 1,
		xpToNext: next ? Math.max(0, next.min - totalXp) : 0
	};
}
var ACHIEVEMENTS = [
	{
		code: "first_xp",
		title: "First bite",
		description: "Earn your first XP",
		emoji: "🥄"
	},
	{
		code: "cook_1",
		title: "Fired up",
		description: "Cook your first recipe",
		emoji: "🔥"
	},
	{
		code: "cook_10",
		title: "Regular in the kitchen",
		description: "Cook 10 recipes",
		emoji: "🍲"
	},
	{
		code: "streak_7",
		title: "One week strong",
		description: "Keep a 7-day streak",
		emoji: "📆"
	},
	{
		code: "streak_30",
		title: "Unbreakable",
		description: "Keep a 30-day streak",
		emoji: "🛡️"
	},
	{
		code: "plan_1",
		title: "Planner",
		description: "Complete a weekly plan",
		emoji: "🗓️"
	},
	{
		code: "grocery_5",
		title: "Stock keeper",
		description: "Finish 5 grocery lists",
		emoji: "🛒"
	},
	{
		code: "level_explorer",
		title: "Food Explorer",
		description: "Reach 5,000 XP",
		emoji: "🧭"
	},
	{
		code: "level_home_chef",
		title: "Home Chef",
		description: "Reach 15,000 XP",
		emoji: "🍳"
	},
	{
		code: "level_mealmaster",
		title: "MealMaster",
		description: "Reach 30,000 XP",
		emoji: "👨‍🍳"
	},
	{
		code: "level_elite",
		title: "MealMate Elite",
		description: "Reach 50,000 XP",
		emoji: "💎"
	}
];
function formatXp(n) {
	return n >= 1e3 ? `${(n / 1e3).toFixed(n % 1e3 === 0 ? 0 : 1)}K` : String(n);
}
//#endregion
export { levelFor as a, formatXp as i, ELITE_XP as n, XP_ACTIONS as r, ACHIEVEMENTS as t };
