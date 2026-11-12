import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { p as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { H as Pause, P as RotateCcw, R as Play, i as Volume2, r as VolumeX, rt as LoaderCircle, ut as Images, wt as Download, yt as Film } from "../_libs/lucide-react.mjs";
import { t as Button } from "./button-BCTXbxsJ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/visual-explainer-Cl_Rav73.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DIMS = {
	"16:9": {
		w: 1280,
		h: 720
	},
	"9:16": {
		w: 720,
		h: 1280
	}
};
function useLoadedImages(urls) {
	const [images, setImages] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		Promise.all(urls.map((u) => new Promise((resolve) => {
			if (!u) return resolve(null);
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = () => resolve(img);
			img.onerror = () => resolve(null);
			img.src = u;
		}))).then((res) => {
			if (!cancelled) setImages(res);
		});
		return () => {
			cancelled = true;
		};
	}, [urls]);
	return images;
}
function wrapText(ctx, text, maxWidth) {
	const words = text.split(/\s+/);
	const lines = [];
	let line = "";
	for (const w of words) {
		const next = line ? `${line} ${w}` : w;
		if (ctx.measureText(next).width > maxWidth && line) {
			lines.push(line);
			line = w;
		} else line = next;
	}
	if (line) lines.push(line);
	return lines;
}
function VisualExplainer({ data }) {
	const [aspect, setAspect] = (0, import_react.useState)("16:9");
	const [index, setIndex] = (0, import_react.useState)(0);
	const [playing, setPlaying] = (0, import_react.useState)(true);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [recording, setRecording] = (0, import_react.useState)(false);
	const canvasRef = (0, import_react.useRef)(null);
	const audioRef = (0, import_react.useRef)(null);
	const startRef = (0, import_react.useRef)(performance.now());
	const scenes = data.scenes;
	const images = useLoadedImages((0, import_react.useMemo)(() => scenes.map((s) => s.imageUrl), [scenes]));
	const timeline = (0, import_react.useMemo)(() => {
		let t = 0;
		return scenes.map((s) => {
			const start = t;
			t += s.durationMs;
			return {
				start,
				end: t
			};
		});
	}, [scenes]);
	const totalMs = timeline.at(-1)?.end ?? 0;
	const draw = (0, import_react.useCallback)((ctx, w, h, sceneIdx, progress, fade) => {
		const scene = scenes[sceneIdx];
		const timing = timeline[sceneIdx];
		if (!scene || !timing) return;
		ctx.fillStyle = "#0d0b09";
		ctx.fillRect(0, 0, w, h);
		const img = images[sceneIdx];
		if (img) {
			const zoom = 1.06 + progress * .1;
			const scale = Math.max(w / img.width, h / img.height) * zoom;
			const dw = img.width * scale;
			const dh = img.height * scale;
			const dx = (w - dw) / 2 - (dw - w) * .12 * (progress - .5);
			const dy = (h - dh) / 2 - (dh - h) * .12 * (progress - .5);
			ctx.globalAlpha = fade;
			ctx.drawImage(img, dx, dy, dw, dh);
			ctx.globalAlpha = 1;
		} else {
			const t = progress * Math.PI * 2;
			const cx = w * (.5 + .18 * Math.cos(t));
			const cy = h * (.42 + .14 * Math.sin(t));
			const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * .7);
			glow.addColorStop(0, "rgba(74,155,47,0.35)");
			glow.addColorStop(.6, "rgba(240,180,0,0.10)");
			glow.addColorStop(1, "rgba(13,11,9,0)");
			ctx.fillStyle = glow;
			ctx.fillRect(0, 0, w, h);
		}
		const grad = ctx.createLinearGradient(0, h * .45, 0, h);
		grad.addColorStop(0, "rgba(0,0,0,0)");
		grad.addColorStop(1, "rgba(0,0,0,0.82)");
		ctx.fillStyle = grad;
		ctx.fillRect(0, h * .45, w, h * .55);
		const pad = w * .06;
		const slide = (1 - Math.min(1, progress * 6)) * w * .04;
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#ffffff";
		const headSize = Math.round(w * (aspect === "9:16" ? .075 : .05));
		ctx.font = `700 ${headSize}px Georgia, 'Times New Roman', serif`;
		const headLines = wrapText(ctx, scene.heading, w - pad * 2);
		let y = h - pad - headLines.length * 0 - 0;
		const subSize = Math.round(w * (aspect === "9:16" ? .042 : .028));
		ctx.font = `400 ${subSize}px Helvetica, Arial, sans-serif`;
		const subLines = wrapText(ctx, scene.subtitle, w - pad * 2);
		const subBlock = subLines.length * subSize * 1.35;
		y = h - pad - subBlock;
		ctx.font = `700 ${headSize}px Georgia, 'Times New Roman', serif`;
		headLines.forEach((l, i) => {
			ctx.fillText(l, pad + slide, y - (headLines.length - i) * headSize * 1.18 - subSize * .6);
		});
		ctx.font = `400 ${subSize}px Helvetica, Arial, sans-serif`;
		ctx.fillStyle = "rgba(255,255,255,0.9)";
		subLines.forEach((l, i) => {
			ctx.fillText(l, pad + slide, y + (i + 1) * subSize * 1.3);
		});
		const overall = (timing.start + progress * scene.durationMs) / (totalMs || 1);
		ctx.fillStyle = "rgba(255,255,255,0.25)";
		ctx.fillRect(pad, h - pad * .45, w - pad * 2, Math.max(3, h * .005));
		ctx.fillStyle = "#f0b400";
		ctx.fillRect(pad, h - pad * .45, (w - pad * 2) * overall, Math.max(3, h * .005));
	}, [
		scenes,
		images,
		aspect,
		timeline,
		totalMs
	]);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const { w, h } = DIMS[aspect];
		canvas.width = w;
		canvas.height = h;
		let raf = 0;
		const loop = () => {
			const elapsed = playing ? performance.now() - startRef.current : 0;
			const scene = timeline[index];
			if (!scene) return;
			const local = playing ? Math.min(scene.end - scene.start, elapsed) : 0;
			const progress = local / (scene.end - scene.start);
			draw(ctx, w, h, index, progress, Math.min(1, local / 500 + .15));
			if (playing && local >= scene.end - scene.start) {
				if (index < scenes.length - 1) setIndex(index + 1);
				else setIndex(0);
				startRef.current = performance.now();
			}
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, [
		aspect,
		draw,
		index,
		playing,
		scenes.length,
		timeline
	]);
	(0, import_react.useEffect)(() => {
		const url = scenes[index]?.audioUrl;
		const el = audioRef.current;
		if (!el) return;
		if (!url || muted || !playing) {
			el.pause();
			return;
		}
		el.src = url;
		el.play().catch(() => void 0);
	}, [
		index,
		muted,
		playing,
		scenes
	]);
	function restart() {
		setIndex(0);
		startRef.current = performance.now();
		setPlaying(true);
	}
	async function downloadImages() {
		scenes.forEach((s, i) => {
			if (!s.imageUrl) return;
			const a = document.createElement("a");
			a.href = s.imageUrl;
			a.download = `${data.title.replace(/\W+/g, "-").toLowerCase()}-scene-${i + 1}.png`;
			a.click();
		});
		toast.success("Images downloaded");
	}
	async function recordVideo() {
		const canvas = canvasRef.current;
		if (!canvas || recording) return;
		const mime = [
			"video/mp4;codecs=avc1",
			"video/webm;codecs=vp9",
			"video/webm"
		].find((m) => MediaRecorder.isTypeSupported(m));
		if (!mime) {
			toast.error("Video export isn't supported in this browser");
			return;
		}
		setRecording(true);
		setPlaying(false);
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			setRecording(false);
			toast.error("Video export isn't supported in this browser");
			return;
		}
		const { w, h } = DIMS[aspect];
		const stream = canvas.captureStream(30);
		const chunks = [];
		const rec = new MediaRecorder(stream, {
			mimeType: mime,
			videoBitsPerSecond: 4e6
		});
		rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
		const done = new Promise((resolve) => {
			rec.onstop = () => resolve();
		});
		rec.start();
		const t0 = performance.now();
		await new Promise((resolve) => {
			const tick = () => {
				const elapsed = performance.now() - t0;
				if (elapsed >= totalMs) return resolve();
				const i = timeline.findIndex((t) => elapsed >= t.start && elapsed < t.end);
				const idx = i === -1 ? scenes.length - 1 : i;
				const timing = timeline[idx];
				if (!timing) return resolve();
				const local = elapsed - timing.start;
				draw(ctx, w, h, idx, local / (timing.end - timing.start), Math.min(1, local / 400 + .15));
				requestAnimationFrame(tick);
			};
			requestAnimationFrame(tick);
		});
		rec.stop();
		await done;
		const blob = new Blob(chunks, { type: mime });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `${data.title.replace(/\W+/g, "-").toLowerCase()}-${aspect.replace(":", "x")}.${mime.startsWith("video/mp4") ? "mp4" : "webm"}`;
		a.click();
		URL.revokeObjectURL(a.href);
		setRecording(false);
		toast.success("Video exported");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rise-in space-y-3 rounded-3xl border border-border bg-card p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 px-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-display text-lg leading-tight",
						children: data.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs capitalize text-muted-foreground",
						children: [
							data.kind,
							" • ",
							scenes.length,
							" scenes • ",
							Math.round(totalMs / 1e3),
							"s"
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-1 rounded-full border border-border p-0.5",
					children: ["16:9", "9:16"].map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setAspect(a),
						className: `rounded-full px-3 py-1 text-xs transition-colors ${aspect === a ? "bg-ink text-background" : "text-muted-foreground hover:bg-muted"}`,
						children: a
					}, a))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				onClick: () => {
					startRef.current = performance.now();
					setPlaying((p) => !p);
				},
				className: `w-full cursor-pointer rounded-2xl bg-ink ${aspect === "9:16" ? "mx-auto max-w-xs" : ""}`,
				"aria-label": `Animated visual explanation: ${data.title}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
				ref: audioRef,
				className: "hidden"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 px-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "secondary",
						onClick: () => {
							startRef.current = performance.now();
							setPlaying((p) => !p);
						},
						children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "mr-1 h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "mr-1 h-4 w-4" }), playing ? "Pause" : "Play"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: restart,
						"aria-label": "Restart",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => setMuted((m) => !m),
						"aria-label": muted ? "Unmute narration" : "Mute narration",
						children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex-1" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: downloadImages,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "mr-1 h-4 w-4" }), " Images"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: recordVideo,
						disabled: recording,
						children: [recording ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-1 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "mr-1 h-4 w-4" }), recording ? "Exporting…" : "Download video"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-1 text-sm text-muted-foreground",
				children: data.summary
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5 px-1 pb-1",
				children: scenes.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setIndex(i);
						startRef.current = performance.now();
						setPlaying(true);
					},
					className: `rounded-full border px-2.5 py-1 text-xs transition-colors ${i === index ? "border-transparent bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`,
					children: [
						i + 1,
						". ",
						s.heading
					]
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-1 px-1 pb-1 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3 w-3" }), " Exports use your current aspect ratio — switch to 9:16 for social."]
			})
		]
	});
}
//#endregion
export { VisualExplainer };
