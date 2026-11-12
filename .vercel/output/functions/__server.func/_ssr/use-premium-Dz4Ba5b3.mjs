import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as useSession } from "./use-session-DD4jPZEV.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { o as verifyMyPremium } from "./billing2.functions-CEnn8pYc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-premium-Dz4Ba5b3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function usePremium() {
	const { user } = useSession();
	const [now, setNow] = (0, import_react.useState)(Date.now);
	(0, import_react.useEffect)(() => {
		const timer = window.setInterval(() => setNow(Date.now()), 1e3);
		return () => window.clearInterval(timer);
	}, []);
	const query = useQuery({
		queryKey: ["entitlement", user?.id ?? "anon"],
		queryFn: () => verifyMyPremium(),
		enabled: !!user,
		staleTime: 0,
		refetchInterval: 6e4,
		refetchOnWindowFocus: "always",
		retry: false
	});
	return {
		isPremium: !!user && !query.isError && !!query.data?.isPremium && query.data.verifiedUntil > Math.max(now, Date.now()),
		tier: query.data?.tier ?? "free",
		trialActive: query.data?.trialActive ?? false,
		entitlement: query.data,
		loading: !!user && query.isPending,
		error: query.error,
		retry: query.refetch
	};
}
//#endregion
export { usePremium as t };
