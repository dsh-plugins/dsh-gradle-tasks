window.__ModuleLoader__.load({
	id: "@dsh-plugin/dsh-gradle-tasks",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		// \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		let react = require("react");
		react = __toESM(react, 1);
		let react_jsx_runtime = require("react/jsx-runtime");
		// src/client/icon.tsx
		/**
		* The panel's glyphs: the guide card's artwork, and the two icon controls for
		* rescan and the offline toggle.
		*
		* All of them draw with `currentColor` so the surrounding control decides the
		* tone for the active and inactive states.
		*/
		/**
		* Render the Gradle Tasks artwork used by the guide card.
		* @param props - the requested glyph size.
		* @returns the icon element.
		*/
		function GradleTasksIcon({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.6,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				focusable: "false",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "3",
						y: "4",
						width: "18",
						height: "16",
						rx: "3"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M7 9.5l1.4 1.4L11 8.3" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13.5 9.5H17" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M7 15.5l1.4 1.4L11 14.3" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M13.5 15.5H17" })
				]
			});
		}
		/**
		* Render the rescan glyph.
		* @param props - the requested size.
		* @returns the icon element.
		*/
		function RefreshIcon({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.8,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M20 11a8 8 0 1 0-2.3 5.7" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M20 4v7h-7" })]
			});
		}
		/**
		* Render the offline glyph: a cloud with a slash through it.
		* @param props - the requested size.
		* @returns the icon element.
		*/
		function OfflineIcon({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.8,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M17.5 18H7a4 4 0 0 1-.6-7.95A6 6 0 0 1 17.7 8.6a3.7 3.7 0 0 1-.2 9.4Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 4l16 16" })]
			});
		}
		/**
		* Render the caret a picker trigger shows.
		* @param props - the requested size.
		* @returns the icon element.
		*/
		function ChevronDownIcon({ size = 12 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 2.2,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				focusable: "false",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 9l6 6 6-6" })
			});
		}
		/**
		* Render the tick a chosen listbox option shows.
		* @param props - the requested size.
		* @returns the icon element.
		*/
		function CheckIcon({ size = 13 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 2.4,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				focusable: "false",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 12.5l4.5 4.5L19 7.5" })
			});
		}
		/**
		* Render the folder a collapsed group or an unloaded project shows.
		*
		* The open and closed variants differ only in the lid, so a tree that expands
		* reads as movement rather than as a swap of unrelated glyphs.
		* @param props - the requested size and whether the folder is open.
		* @returns the icon element.
		*/
		function FolderIcon({ size = 14, open = false }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.7,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				focusable: "false",
				children: open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 9.5A2 2 0 0 1 5 7.5h3.6l1.7 1.8H19a2 2 0 0 1 2 2v5.2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 7.5a2 2 0 0 1 2-2h3.6l1.7 1.8H19a2 2 0 0 1 2 2v7.2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" })
			});
		}
		/**
		* Render the glyph a build root shows: the stacked modules of a Gradle build.
		* @param props - the requested size.
		* @returns the icon element.
		*/
		function ProjectIcon({ size = 15 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.6,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				focusable: "false",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 3.2 20.4 7.6 12 12 3.6 7.6Z" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3.6 12 12 16.4 20.4 12" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3.6 16.4 12 20.8l8.4-4.4" })
				]
			});
		}
		/**
		* Render the glyph a subproject shows: one module box inside the build.
		* @param props - the requested size.
		* @returns the icon element.
		*/
		function ModuleIcon({ size = 14 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.7,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				focusable: "false",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "3.5",
						y: "3.5",
						width: "8",
						height: "8",
						rx: "1.6"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "12.5",
						y: "12.5",
						width: "8",
						height: "8",
						rx: "1.6"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12.5 7.5h4.5a2 2 0 0 1 2 2v3" })
				]
			});
		}
		/**
		* Render the glyph one task shows: a cog, because a task is one unit of build
		* work rather than a thing that plays.
		*
		* The outline is the eight-toothed cog that still reads as a gear at 12px. A
		* photographic gear — curved flanks, a long tooth silhouette — collapses into a
		* smudge at this size, and a plain ring with detached ticks reads as a sun, so
		* the teeth are drawn as part of the rim.
		* @param props - the requested size.
		* @returns the icon element.
		*/
		function TaskIcon({ size = 13 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.7,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "12",
					cy: "12",
					r: "3"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.08A1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" })]
			});
		}
		/**
		* Render the magnifier the filter box shows.
		* @param props - the requested size.
		* @returns the icon element.
		*/
		function SearchIcon({ size = 12 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 2,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				focusable: "false",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "10.5",
					cy: "10.5",
					r: "6.5"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M15.5 15.5 20 20" })]
			});
		}
		/**
		* Render the spinner a scanning project row shows.
		* @param props - the requested size.
		* @returns the icon element.
		*/
		function SpinnerIcon({ size = 12 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: "gt-spinner",
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 2.6,
				strokeLinecap: "round",
				"aria-hidden": "true",
				focusable: "false",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 3.5a8.5 8.5 0 1 0 8.5 8.5" })
			});
		}
		// src/client/locales.ts
		/** Copy namespace registered with the locale service. */
		const NAMESPACE = "gradleTasks";
		/** Every language this plugin ships, keyed the way the locale service expects. */
		const DICTIONARIES = {
			zh: {
				"panel.title": "Gradle 任务",
				"panel.description": "浏览并运行工作区各 Gradle 项目的任务",
				"toolbar.java": "Java",
				"toolbar.javaMissing": "未发现 JDK",
				"toolbar.javaHint": "选择运行 Gradle 的 JDK",
				"toolbar.rescan": "重新扫描任务",
				"toolbar.offlineOn": "离线模式已开启，点击关闭（运行时不访问网络）",
				"toolbar.offlineOff": "离线模式已关闭，点击开启（运行时加 --offline）",
				"status.noSession": "正在读取当前会话目录…",
				"status.scanningWorkspace": "正在查找 Gradle 项目…",
				"status.projects": "{projects} 个项目 · 已扫描 {scanned} · 共 {tasks} 个任务",
				"status.noProjects": "当前工作区未发现 Gradle 项目：{path}",
				"status.truncated": "项目数量已达上限，扫描未覆盖全部目录",
				"status.wrapper": "Wrapper {version}",
				"status.noWrapper": "无 wrapper，使用 PATH 中的 gradle",
				"status.cachedAt": "来自缓存 · 扫描于 {time} · 构建脚本未变化",
				"status.scannedAt": "扫描于 {time}，耗时 {duration}",
				"status.failedAt": "扫描失败",
				"tasks.filter": "过滤任务",
				"tasks.empty": "没有匹配的任务",
				"tasks.noProjects": "当前工作区未发现 Gradle 项目",
				"tasks.ungrouped": "未分组",
				"tasks.expandHint": "展开项目以扫描任务（只有展开的项目才会执行 Gradle）",
				"tasks.loadHint": "展开后扫描任务",
				"tasks.runHint": "双击任务，在终端里运行",
				"project.scanning": "扫描中",
				"project.failed": "扫描失败",
				"project.failureHint": "点击查看构建日志",
				"project.subprojects": "子项目",
				"project.aggregate": "全部任务（gradle build 会跑遍全部子项目）",
				"project.rescan": "重新扫描该项目",
				"project.modules": "{count} 个模块",
				"project.tasks": "{count} 个任务",
				"project.expand": "展开项目",
				"project.collapse": "收起项目",
				"run.starting": "正在启动终端…",
				"run.launched": "已在「{terminal}」运行 {task}",
				"fail.no-session": "缺少会话标识",
				"fail.session-inactive": "当前会话尚未激活，请先打开一次对话",
				"fail.directory-missing": "目录不存在：{detail}",
				"fail.directory-relative": "需要绝对路径：{detail}",
				"fail.not-gradle": "当前工作区不是 Gradle 项目：{detail}",
				"fail.project-not-found": "未找到该 Gradle 项目（可能需要指定项目）：{detail}",
				"fail.wrapper-mismatch": "项目 wrapper 与当前平台不匹配：{detail}",
				"fail.gradle-missing": "项目没有 wrapper，PATH 中也找不到 gradle：{detail}",
				"fail.scan-failed": "Gradle 执行失败（退出码 {detail}）",
				"fail.scan-timeout": "扫描超时，已终止 Gradle：\n{detail}",
				"fail.no-report": "Gradle 未产出任务清单",
				"fail.java-invalid": "不是可用的 JDK 目录：{detail}",
				"fail.task-missing": "任务不存在或不是合法任务路径：{detail}",
				"fail.terminal-failed": "无法打开终端：{detail}",
				"fail.field-missing": "缺少字段：{detail}",
				"fail.body-invalid": "请求体不合法",
				"fail.body-too-large": "请求体过大",
				"fail.transport": "无法连接本地服务：{detail}"
			},
			en: {
				"panel.title": "Gradle Tasks",
				"panel.description": "Browse and run the Gradle tasks of every project in the workspace",
				"toolbar.java": "Java",
				"toolbar.javaMissing": "No JDK found",
				"toolbar.javaHint": "Choose the JDK used to run Gradle",
				"toolbar.rescan": "Rescan tasks",
				"toolbar.offlineOn": "Offline mode is on; click to turn it off (no network during runs)",
				"toolbar.offlineOff": "Offline mode is off; click to turn it on (runs pass --offline)",
				"status.noSession": "Reading this Session’s directory…",
				"status.scanningWorkspace": "Looking for Gradle projects…",
				"status.projects": "{projects} projects · {scanned} scanned · {tasks} tasks",
				"status.noProjects": "No Gradle project in this workspace: {path}",
				"status.truncated": "The project limit was reached; not every directory was searched",
				"status.wrapper": "Wrapper {version}",
				"status.noWrapper": "No wrapper, using gradle from PATH",
				"status.cachedAt": "From cache · scanned {time} · build scripts unchanged",
				"status.scannedAt": "Scanned {time} in {duration}",
				"status.failedAt": "Scan failed",
				"tasks.filter": "Filter tasks",
				"tasks.empty": "No matching task",
				"tasks.noProjects": "No Gradle project in this workspace",
				"tasks.ungrouped": "Ungrouped",
				"tasks.expandHint": "Open a project to scan its tasks; only opened projects run Gradle",
				"tasks.loadHint": "Open this project to scan its tasks",
				"tasks.runHint": "Double-click a task to run it in a terminal",
				"project.scanning": "Scanning",
				"project.failed": "Scan failed",
				"project.failureHint": "Click to show the build log",
				"project.subprojects": "Subprojects",
				"project.aggregate": "Every task of the build (gradle build reaches all subprojects)",
				"project.rescan": "Rescan this project",
				"project.modules": "{count} modules",
				"project.tasks": "{count} tasks",
				"project.expand": "Expand project",
				"project.collapse": "Collapse project",
				"run.starting": "Starting the terminal…",
				"run.launched": "{task} is running in “{terminal}”",
				"fail.no-session": "The request named no Session",
				"fail.session-inactive": "This Session is not active yet; open the conversation once first",
				"fail.directory-missing": "Directory not found: {detail}",
				"fail.directory-relative": "An absolute path is required: {detail}",
				"fail.not-gradle": "Not a Gradle workspace: {detail}",
				"fail.project-not-found": "No such Gradle project here, or the request named none: {detail}",
				"fail.wrapper-mismatch": "The project wrapper does not match this platform: {detail}",
				"fail.gradle-missing": "The project ships no wrapper and PATH has no gradle: {detail}",
				"fail.scan-failed": "Gradle failed (exit code {detail})",
				"fail.scan-timeout": "The scan timed out and Gradle was terminated:\n{detail}",
				"fail.no-report": "Gradle produced no task report",
				"fail.java-invalid": "Not a usable JDK directory: {detail}",
				"fail.task-missing": "No such task, or not a valid task path: {detail}",
				"fail.terminal-failed": "Cannot open a terminal: {detail}",
				"fail.field-missing": "Missing field: {detail}",
				"fail.body-invalid": "The request body is not valid JSON",
				"fail.body-too-large": "The request body is too large",
				"fail.transport": "Cannot reach the local service: {detail}"
			}
		};
		/**
		* Copy key for each failure code the Host can report.
		*
		* Spelled out rather than built as `` `fail.${code}` `` so a code added to the
		* protocol without copy is a type error instead of a panel showing a raw key.
		*/
		const FAILURE_COPY = {
			"no-session": "fail.no-session",
			"session-inactive": "fail.session-inactive",
			"directory-missing": "fail.directory-missing",
			"directory-relative": "fail.directory-relative",
			"not-gradle": "fail.not-gradle",
			"project-not-found": "fail.project-not-found",
			"wrapper-mismatch": "fail.wrapper-mismatch",
			"gradle-missing": "fail.gradle-missing",
			"scan-failed": "fail.scan-failed",
			"scan-timeout": "fail.scan-timeout",
			"no-report": "fail.no-report",
			"java-invalid": "fail.java-invalid",
			"task-missing": "fail.task-missing",
			"terminal-failed": "fail.terminal-failed",
			"field-missing": "fail.field-missing",
			"body-invalid": "fail.body-invalid",
			"body-too-large": "fail.body-too-large",
			transport: "fail.transport"
		};
		/** Substitute `{name}` placeholders in one template. */
		function format(template, values) {
			return template.replace(/\{(\w+)\}/g, (whole, name) => {
				const value = values[name];
				return value === void 0 ? whole : String(value);
			});
		}
		// src/client/i18n.ts
		/**
		* Copy resolution for this panel.
		*
		* The Host locale service is used when it is mounted, and the dictionary this
		* plugin ships is used otherwise. Either way the active language is read on
		* every lookup, so switching the Host language re-renders the panel without a
		* reload.
		*/
		/** The language to use when no Host choice is available. */
		function documentLanguage() {
			return (typeof navigator === "undefined" ? "" : navigator.language).toLowerCase().startsWith("zh") ? "zh" : "en";
		}
		/** Pick the dictionary for one language, falling back to English, then Chinese. */
		function dictionaryFor(language) {
			const base = language.split("-")[0] ?? language;
			return DICTIONARIES[language] ?? DICTIONARIES[base] ?? DICTIONARIES.en ?? DICTIONARIES.zh ?? {};
		}
		/**
		* Build the translator for this panel.
		* @param ctx - browser context, used to reach the optional locale service.
		* @returns the translator bound to the live locale.
		*/
		function createTranslator(ctx) {
			const locale = ctx.get("locale");
			const active = () => locale?.getSnapshot?.()?.active ?? locale?.getLocale?.()?.active ?? documentLanguage();
			return {
				t: (key, values) => {
					const template = dictionaryFor(active())[key] ?? DICTIONARIES.en?.[key] ?? key;
					return values === void 0 ? template : format(template, values);
				},
				subscribe: (listener) => locale?.subscribe?.(listener) ?? (() => {})
			};
		}
		/**
		* Subscribe a component to locale changes and return the live translate function.
		* @param translator - translator built by {@link createTranslator}.
		* @returns the translate function, re-read on every render.
		*/
		function useCopy(translator) {
			const [, force] = react.useReducer((count) => count + 1, 0);
			react.useEffect(() => translator.subscribe(() => {
				force();
			}), [translator]);
			return translator.t;
		}
		// src/shared/tree.ts
		/**
		* Split one scan's groups into the whole-build list and one bucket per
		* subproject, keeping the grouping and ordering the scan already produced.
		*
		* The whole-build list is the scanned groups unchanged: a group such as `build`
		* already holds the root project's task and every subproject's, which is what
		* one `gradle build` runs. The module buckets are the same tasks seen from the
		* other side, so a person can either run the aggregate or narrow down to one
		* subproject without losing the aggregate's meaning.
		* @param groups - task groups returned by the Host.
		* @param rootPath - the root project's Gradle path, `:` for a single-project build.
		* @returns the tree for one build root.
		*/
		function buildProjectTree(groups, rootPath = ":") {
			const buckets = /* @__PURE__ */ new Map();
			for (const group of groups) {
				const perModule = /* @__PURE__ */ new Map();
				for (const task of group.tasks) {
					if (task.project === rootPath) continue;
					const list = perModule.get(task.project);
					if (list === void 0) perModule.set(task.project, [task]);
					else list.push(task);
				}
				for (const [path, tasks] of perModule) {
					const existing = buckets.get(path);
					const bucket = {
						group: group.group,
						tasks
					};
					if (existing === void 0) buckets.set(path, [bucket]);
					else existing.push(bucket);
				}
			}
			const modules = [...buckets.entries()].map(([path, moduleGroups]) => ({
				path,
				name: moduleNameOf(path),
				groups: moduleGroups.sort(compareGroups)
			})).sort((left, right) => compareText(left.path, right.path));
			const aggregate = aggregateGroups(groups);
			return {
				aggregate,
				modules,
				taskCount: aggregate.reduce((sum, group) => sum + group.tasks.length, 0)
			};
		}
		/**
		* Collapse every project's tasks into one row per task name, keeping the scan's
		* grouping and order.
		*
		* `:common:jar`, `:fabric:jar`, and `:neoforge:jar` are one entry here because
		* Gradle treats the bare name `jar` as "this task in every project that has it":
		* listing the three separately would suggest three separate actions for what is
		* one command. The project list on the entry records where it lands, and the
		* longest description wins because a subproject's description usually says more
		* than the root project's bare default.
		* @param groups - task groups returned by the Host.
		* @returns one group per scanned group, each holding one entry per task name.
		*/
		function aggregateGroups(groups) {
			return groups.map((group) => {
				const byName = /* @__PURE__ */ new Map();
				for (const task of group.tasks) {
					const name = moduleNameOf(task.path);
					const existing = byName.get(name);
					if (existing === void 0) {
						byName.set(name, {
							description: task.description,
							projects: [task.project]
						});
						continue;
					}
					if (!existing.projects.includes(task.project)) existing.projects.push(task.project);
					if (task.description.length > existing.description.length) existing.description = task.description;
				}
				return {
					group: group.group,
					tasks: [...byName.entries()].map(([name, entry]) => ({
						name,
						description: entry.description,
						projects: entry.projects.sort(compareText)
					}))
				};
			});
		}
		/** The display name of a Gradle project path: `:app:core` reads `core`. */
		function moduleNameOf(path) {
			const tail = path.split(":").filter((part) => part !== "").at(-1);
			return tail === void 0 ? path : tail;
		}
		/**
		* Order groups the way a scan orders them: by name, with the bucket for tasks
		* that declared no group last. A stable sort keeps the scan's own order both
		* inside a project and between projects.
		*/
		function compareGroups(left, right) {
			if (left.group === "") return 1;
			if (right.group === "") return -1;
			return compareText(left.group, right.group);
		}
		/** Case-insensitive comparison with a stable code-unit fallback. */
		function compareText(left, right) {
			const folded = left.toLowerCase().localeCompare(right.toLowerCase());
			return folded !== 0 ? folded : left.localeCompare(right);
		}
		/**
		* Whether a build root matches a search term.
		*
		* The panel asks this before it has scanned a project, so a term that names the
		* project still shows its folded row: hiding a node whose tasks were never
		* scanned would make the filter look broken.
		* @param entry - the build root.
		* @param needle - search term, already trimmed and lower-cased.
		* @returns true when the name, path, or a declared module path contains it.
		*/
		function projectMatches(entry, needle) {
			if (needle === "") return true;
			return entry.name.toLowerCase().includes(needle) || entry.relativePath.toLowerCase().includes(needle) || entry.rootDir.toLowerCase().includes(needle) || entry.modules.some((module) => module.toLowerCase().includes(needle));
		}
		/**
		* Whether a task matches a search term.
		* @param task - one Gradle task, or one aggregated row under its `name`.
		* @param needle - search term, already trimmed and lower-cased.
		* @returns true when the task's path (or aggregate name) or its description contains it.
		*/
		function taskMatches(task, needle) {
			if (needle === "") return true;
			return (task.path ?? task.name ?? "").toLowerCase().includes(needle) || task.description.toLowerCase().includes(needle);
		}
		// src/shared/protocol.ts
		/**
		* Wire vocabulary shared by the Host routes and the browser panel: the base
		* path of this plugin's HTTP surface and the JSON shapes both halves agree on.
		* The module holds no runtime behavior beyond constants, so the client bundle
		* inlines it without pulling Host-only code into the browser.
		*/
		/** Prefix every route of this plugin is registered under. */
		const ROUTE_BASE = "/gradle-tasks";
		// src/client/api.ts
		/**
		* The browser end of this plugin's Host routes.
		*
		* Plain `fetch` against the plugin's own path prefix keeps the panel free of
		* generated Remote code; the browser's cookie travels with each same-origin
		* request, which is the same admission the shipped routes rely on.
		*/
		/** A failure that happened before the Host could answer, reported like any other. */
		var TransportFailure = class extends Error {
			detail;
			code = "transport";
			constructor(detail) {
				super(detail);
				this.detail = detail;
				this.name = "TransportFailure";
			}
		};
		/** Read one JSON answer, turning a transport failure into a routable code. */
		async function readJson(url, init) {
			let response;
			try {
				response = await fetch(url, init);
			} catch (error) {
				throw new TransportFailure(error instanceof Error ? error.message : String(error));
			}
			if (!response.ok) throw new TransportFailure(`${url} → HTTP ${response.status}`);
			const text = await response.text();
			try {
				return JSON.parse(text);
			} catch {
				throw new TransportFailure(`${url} → ${text.slice(0, 200)}`);
			}
		}
		/** Build a route URL from the query's present fields. */
		function url(route, query) {
			const params = new URLSearchParams({ sessionId: query.sessionId });
			if (query.project !== null && query.project !== void 0) params.set("project", query.project);
			if (query.javaHome !== null && query.javaHome !== void 0) params.set("javaHome", query.javaHome);
			if (query.offline === true) params.set("offline", "1");
			if (query.force === true) params.set("force", "1");
			return `${ROUTE_BASE}${route}?${params.toString()}`;
		}
		/** Detect the project and enumerate JDKs. */
		function fetchState(sessionId) {
			return readJson(url("/state", { sessionId }));
		}
		/** Run Gradle's task report for the Session's project. */
		function fetchTasks(query) {
			return readJson(url("/tasks", query));
		}
		/**
		* Type one task into the Session's terminal.
		* @param query - the Session, the build root, the JDK, and the offline choice.
		* @param taskPath - fully qualified task to run.
		* @param openTerminalIds - terminals the window currently shows, so a run can
		*   continue in the one this plugin already opened instead of opening another.
		*/
		function startTaskRun(query, taskPath, openTerminalIds) {
			return readJson(`${ROUTE_BASE}/run`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					sessionId: query.sessionId,
					project: query.project ?? void 0,
					taskPath,
					javaHome: query.javaHome ?? void 0,
					offline: query.offline === true,
					openTerminalIds: [...openTerminalIds]
				})
			});
		}
		// src/client/picker.tsx
		/**
		* The JDK selector: a themed listbox instead of a native `<select>`.
		*
		* A native select is drawn by the operating system, so its popup keeps the
		* system palette whatever theme the Host is in — the white list over a dark
		* Sidebar the screenshots showed. This component draws the trigger and the
		* popup itself, from the same `--dsw-alias-*` tokens as the rest of the panel,
		* and behaves like the Host's own pickers: arrows move, Enter chooses, Escape
		* closes and returns focus.
		*/
		/** How much room the popup may take before it scrolls, matching the stylesheet. */
		const MAX_POPUP_HEIGHT = 320;
		/** The text one candidate shows: its variable, then its release version. */
		function candidateText(candidate) {
			return candidate.version === null ? candidate.variable : `${candidate.variable} (${candidate.version})`;
		}
		/**
		* Render the JDK selector.
		* @param props - described by {@link JdkPickerProps}.
		* @returns the trigger and, while open, its popup.
		*/
		function JdkPicker(props) {
			const { candidates, value, label, emptyCopy, ariaLabel, onChoose } = props;
			const [open, setOpen] = react.useState(false);
			const [above, setAbove] = react.useState(false);
			const [activeIndex, setActiveIndex] = react.useState(-1);
			const wrapperRef = react.useRef(null);
			const triggerRef = react.useRef(null);
			const selectedIndex = candidates.findIndex((candidate) => candidate.home === value);
			const selected = selectedIndex >= 0 ? candidates[selectedIndex] : void 0;
			const text = selected === void 0 ? candidates.length === 0 ? emptyCopy : "—" : candidateText(selected);
			/**
			* Decide whether the popup opens downward: a popup taller than the room below
			* the trigger would be clipped by the pane, so it flips when the space above
			* is larger.
			*/
			const updatePlacement = react.useCallback(() => {
				const trigger = triggerRef.current;
				if (trigger === null) return;
				const rect = trigger.getBoundingClientRect();
				const below = window.innerHeight - rect.bottom - 12;
				const roomAbove = rect.top - 12;
				setAbove(below < Math.min(MAX_POPUP_HEIGHT, roomAbove));
			}, []);
			/** Close the popup, optionally handing focus back to the trigger. */
			const close = react.useCallback((refocus) => {
				setOpen(false);
				if (refocus) triggerRef.current?.focus();
			}, []);
			/** Choose one candidate by index. */
			const choose = react.useCallback((index) => {
				const candidate = candidates[index];
				if (candidate === void 0) return;
				onChoose(candidate.home);
				close(true);
			}, [
				candidates,
				close,
				onChoose
			]);
			react.useEffect(() => {
				if (!open) return void 0;
				updatePlacement();
				setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
				window.addEventListener("scroll", updatePlacement, true);
				window.addEventListener("resize", updatePlacement);
				const onPointerDown = (event) => {
					const wrapper = wrapperRef.current;
					if (wrapper !== null && event.target instanceof Node && !wrapper.contains(event.target)) close(false);
				};
				document.addEventListener("pointerdown", onPointerDown);
				return () => {
					window.removeEventListener("scroll", updatePlacement, true);
					window.removeEventListener("resize", updatePlacement);
					document.removeEventListener("pointerdown", onPointerDown);
				};
			}, [
				open,
				selectedIndex,
				updatePlacement,
				close
			]);
			/**
			* Keyboard handling for both the trigger and the popup.
			*
			* The popup keeps focus on the trigger, so one handler serves both states;
			* the highlighted option is announced through `aria-activedescendant`.
			*/
			const onKeyDown = (event) => {
				if (candidates.length === 0) return;
				if (!open) {
					if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						setOpen(true);
					}
					return;
				}
				if (event.key === "Escape") {
					event.preventDefault();
					close(true);
					return;
				}
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					choose(activeIndex);
					return;
				}
				if (event.key === "Tab") {
					close(false);
					return;
				}
				const count = candidates.length;
				let next;
				if (event.key === "ArrowDown") next = (activeIndex + 1) % count;
				else if (event.key === "ArrowUp") next = (activeIndex - 1 + count) % count;
				else if (event.key === "Home") next = 0;
				else if (event.key === "End") next = count - 1;
				if (next === void 0) return;
				event.preventDefault();
				setActiveIndex(next);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: wrapperRef,
				className: "gt-java",
				"data-open": open ? "true" : void 0,
				onKeyDown,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "gt-java-label",
						children: label
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						ref: triggerRef,
						className: "gt-picker-trigger",
						type: "button",
						"aria-haspopup": "listbox",
						"aria-expanded": open,
						"aria-label": `${ariaLabel}: ${text}`,
						disabled: candidates.length === 0,
						title: selected?.home ?? text,
						onClick: () => {
							setOpen((previous) => !previous);
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: selected === void 0 ? "gt-picker-text gt-picker-dim" : "gt-picker-text",
							children: text
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gt-picker-caret",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronDownIcon, { size: 12 })
						})]
					}),
					!open ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: above ? "gt-popup gt-popup-above" : "gt-popup",
						role: "listbox",
						"aria-label": ariaLabel,
						tabIndex: -1,
						children: candidates.map((candidate, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "option",
							"aria-selected": candidate.home === value,
							className: [
								"gt-option",
								candidate.home === value ? "gt-option-selected" : "",
								index === activeIndex ? "gt-option-active" : ""
							].filter(Boolean).join(" "),
							title: candidate.home,
							onMouseEnter: () => {
								setActiveIndex(index);
							},
							onClick: () => {
								choose(index);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "gt-option-main",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-option-name",
									children: candidateText(candidate)
								}), candidate.home === value ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-option-check",
									"aria-hidden": "true",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CheckIcon, { size: 13 })
								}) : null]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gt-option-path",
								children: candidate.home
							})]
						}, candidate.home))
					})
				]
			});
		}
		// src/client/panel.tsx
		/**
		* The Gradle Tasks page: the JDK selector and two icon controls, then the
		* workspace's build roots as a tree — each one's groups, its subprojects, and
		* their tasks — and one line describing what the last run did.
		*
		* The page deliberately scans lazily. A workspace can hold dozens of
		* repositories, and configuring a Gradle build costs seconds to minutes, so
		* opening the page only lists what the filesystem shows; a build is configured
		* the first time its node is opened, and its report is cached per build root
		* from then on.
		*
		* The panel shows no build output of its own: a task runs in a real Session
		* terminal, which the Sidebar shows as its own tab, so the person keeps the
		* scrollback, the colours, and the ability to interrupt the build.
		*/
		/** Browser storage keys this panel owns. */
		const JAVA_KEY = "dsh.gradle-tasks.javaHome";
		const OFFLINE_KEY = "dsh.gradle-tasks.offline";
		/**
		* Browser storage key for the unfolded group and module nodes.
		*
		* Projects are deliberately not stored: a workspace is reopened fully folded,
		* the way an IDE tree is, so the panel never starts a build (or shows one as
		* pending) merely because a project was open the last time the page was seen.
		*/
		const OPEN_NODE_KEY = "dsh.gradle-tasks.openNodes";
		/** The state every build root starts in. */
		const IDLE = {
			tree: null,
			status: "idle",
			failure: null,
			durationMs: 0,
			cachedAt: null
		};
		/**
		* Split a failure into the one line a row shows and the log it holds back.
		*
		* A Gradle failure carries the end of the build log, which is many lines of
		* advice and stack trace. The tree shows the cause and keeps the log one click
		* away, so a failed project stays one row instead of taking over the panel.
		*/
		function splitFailure(failure) {
			const text = failure.detail ?? "";
			const breakAt = text.indexOf("\n");
			return breakAt < 0 ? {
				summary: text,
				detail: ""
			} : {
				summary: text.slice(0, breakAt),
				detail: text.slice(breakAt + 1)
			};
		}
		/** Render one failure code as text in the active language. */
		function describeFailure(failure, t) {
			return t(FAILURE_COPY[failure.code], { detail: failure.detail ?? "" });
		}
		/** Turn any thrown value into the failure the panel renders. */
		function failureFrom(error) {
			if (error instanceof TransportFailure) return {
				code: "transport",
				detail: error.detail
			};
			return {
				code: "transport",
				detail: error instanceof Error ? error.message : String(error)
			};
		}
		/** Read one stored string. */
		function readStored(key) {
			try {
				return globalThis.localStorage?.getItem(key) ?? null;
			} catch (error) {
				console.warn(`gradle-tasks: ignoring unreadable ${key}`, error);
				return null;
			}
		}
		/** Write one stored string, tolerating a storage that refuses writes. */
		function writeStored(key, value) {
			try {
				if (value === null) globalThis.localStorage?.removeItem(key);
				else globalThis.localStorage?.setItem(key, value);
			} catch (error) {
				console.warn(`gradle-tasks: cannot persist ${key}`, error);
			}
		}
		/**
		* Read one stored node-key list.
		*
		* Nodes are keyed by build root as well as by name, because two repositories in
		* one workspace can both have a `build` group; an entry written by the version
		* that had a single project carries no root and simply never matches again.
		*/
		function readKeys(key) {
			const raw = readStored(key);
			if (raw === null) return [];
			try {
				const parsed = JSON.parse(raw);
				return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
			} catch (error) {
				console.warn(`gradle-tasks: ignoring unreadable ${key}`, error);
				return [];
			}
		}
		/** Pick the JDK to use: the remembered one when it still exists, else the default. */
		function resolveJavaHome(preferred, jdks) {
			if (preferred !== null && jdks.some((candidate) => candidate.home === preferred)) return preferred;
			return jdks.find((candidate) => candidate.isDefault)?.home ?? jdks[0]?.home ?? null;
		}
		/**
		* The task path as its row shows it.
		*
		* A task under a module node already says which module it belongs to, so the
		* prefix is dropped there: `common:jar` reads `jar` inside `common`, and the
		* same task reads `common:jar` when its module row is folded away. The full path
		* is always one hover away.
		* @param task - the task.
		* @param scope - Gradle project path of the node the row sits under, `:` for the root project.
		* @returns the label for the row.
		*/
		function taskLabel(task, scope = ":") {
			if (scope !== ":") {
				const prefix = `${scope}:`;
				if (task.path.startsWith(prefix)) return task.path.slice(prefix.length);
				return task.path.replace(/^:/, "");
			}
			return task.path.replace(/^:/, "");
		}
		/** Human-readable duration. */
		function formatDuration(milliseconds) {
			if (milliseconds < 1e3) return `${milliseconds} ms`;
			const seconds = milliseconds / 1e3;
			if (seconds < 60) return `${seconds.toFixed(1)} s`;
			return `${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} s`;
		}
		/** A scan time in the reader's own locale and time zone. */
		function formatTimestamp(epochMilliseconds) {
			return new Date(epochMilliseconds).toLocaleString();
		}
		/** The storage key of one collapsible node. */
		function nodeKey(rootDir, ...parts) {
			return [rootDir, ...parts].join("\0");
		}
		/**
		* The Gradle Tasks page component.
		* @param props - injected services described by {@link GradleTasksPanelProps}.
		* @returns the rendered page.
		*/
		function GradleTasksPanel(props) {
			const { sessionId, translator, openTerminalIds, revealTerminal } = props;
			const t = useCopy(translator);
			const [location, setLocation] = react.useState(null);
			const [states, setStates] = react.useState(() => /* @__PURE__ */ new Map());
			const [javaHome, setJavaHome] = react.useState(() => readStored(JAVA_KEY));
			const [offline, setOffline] = react.useState(() => readStored(OFFLINE_KEY) === "1");
			const [busy, setBusy] = react.useState(false);
			const [problem, setProblem] = react.useState(null);
			const [filter, setFilter] = react.useState("");
			const [selected, setSelected] = react.useState(null);
			const [opened, setOpened] = react.useState([]);
			const [openNodes, setOpenNodes] = react.useState(() => readKeys(OPEN_NODE_KEY));
			const [openErrors, setOpenErrors] = react.useState([]);
			const [launch, setLaunch] = react.useState(null);
			const [launching, setLaunching] = react.useState(null);
			const request = react.useRef(0);
			/** Build roots whose scan this component has already started, so one effect pass cannot start two. */
			const started = react.useRef(/* @__PURE__ */ new Set());
			const javaRef = react.useRef(javaHome);
			javaRef.current = javaHome;
			const offlineRef = react.useRef(offline);
			offlineRef.current = offline;
			/** Replace one build root's state, leaving the others alone. */
			const patchState = react.useCallback((rootDir, patch) => {
				setStates((previous) => {
					const next = new Map(previous);
					next.set(rootDir, {
						...previous.get(rootDir) ?? IDLE,
						...patch
					});
					return next;
				});
			}, []);
			/**
			* Scan one build root.
			*
			* The answer is applied only while its ticket is still the newest: a person
			* who switches JDK or offline mode mid-scan sees the report for the choice
			* they ended on, never an earlier one arriving late.
			* @param project - the build root to scan.
			* @param force - configure the build again instead of reusing the cache.
			* @param ticket - request identity taken before the call.
			*/
			const scan = react.useCallback(async (project, force, ticket) => {
				patchState(project.rootDir, {
					status: "loading",
					failure: null
				});
				const query = {
					sessionId,
					project: project.rootDir,
					javaHome: javaRef.current,
					offline: offlineRef.current,
					force
				};
				try {
					const listing = await fetchTasks(query);
					if (ticket !== request.current) return;
					if (!listing.ok) {
						patchState(project.rootDir, {
							status: "failed",
							failure: {
								code: listing.error,
								detail: listing.detail ?? listing.output
							}
						});
						return;
					}
					patchState(project.rootDir, {
						status: "ready",
						tree: buildProjectTree(listing.groups),
						failure: null,
						durationMs: listing.durationMs,
						cachedAt: listing.cached ? listing.scannedAt : null
					});
				} catch (error) {
					if (ticket !== request.current) return;
					patchState(project.rootDir, {
						status: "failed",
						failure: failureFrom(error)
					});
				}
			}, [sessionId, patchState]);
			/**
			* Ask the Host which build roots this Session's directory holds.
			* @param force - configure every project again instead of reusing caches.
			* @param jdkOverride - JDK chosen right now, before the selector has re-rendered.
			*/
			const load = react.useCallback(async (force, jdkOverride) => {
				const ticket = request.current + 1;
				request.current = ticket;
				setBusy(true);
				setProblem(null);
				try {
					const state = await fetchState(sessionId);
					if (ticket !== request.current) return;
					if (!state.ok) {
						setLocation(null);
						setStates(/* @__PURE__ */ new Map());
						started.current.clear();
						setProblem({
							code: state.error,
							detail: state.detail
						});
						return;
					}
					const chosen = jdkOverride ?? resolveJavaHome(javaHome, state.jdks);
					if (chosen !== javaHome) {
						setJavaHome(chosen);
						writeStored(JAVA_KEY, chosen);
					}
					const located = {
						path: state.path,
						projects: state.projects,
						truncated: state.truncated === true,
						jdks: state.jdks
					};
					setLocation(located);
					setStates((previous) => {
						const keep = new Set(state.projects.map((project) => project.rootDir));
						const next = /* @__PURE__ */ new Map();
						for (const [root, value] of previous) if (keep.has(root)) next.set(root, value);
						return next;
					});
					started.current = new Set([...started.current].filter((root) => state.projects.some((project) => project.rootDir === root)));
					if (force) for (const project of state.projects) {
						if (!started.current.has(project.rootDir)) continue;
						await scan(project, true, ticket);
					}
				} catch (error) {
					if (ticket !== request.current) return;
					setProblem(failureFrom(error));
					setStates(/* @__PURE__ */ new Map());
				} finally {
					if (ticket === request.current) setBusy(false);
				}
			}, [
				sessionId,
				javaHome,
				scan
			]);
			const firstLoad = react.useRef(true);
			react.useEffect(() => {
				if (!firstLoad.current) return;
				firstLoad.current = false;
				load(false);
			}, [load]);
			/** Record that one project node is open. */
			const openProject = react.useCallback((rootDir) => {
				const key = nodeKey(rootDir);
				setOpened((previous) => previous.includes(key) ? previous : [...previous, key]);
			}, []);
			/** Fold or unfold one project's failure log. */
			const toggleError = react.useCallback((rootDir) => {
				setOpenErrors((previous) => previous.includes(rootDir) ? previous.filter((item) => item !== rootDir) : [...previous, rootDir]);
			}, []);
			/** Fold or unfold one project node; these start folded. */
			const toggleProject = react.useCallback((rootDir) => {
				const key = nodeKey(rootDir);
				setOpened((previous) => previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key]);
			}, []);
			/**
			* Scan a build root the first time its node is opened.
			*
			* A single-project workspace is opened for the person instead: the page has
			* nothing else to show, so the ready state it had before is preserved.
			*/
			const expandProject = react.useCallback((project) => {
				openProject(project.rootDir);
				if (started.current.has(project.rootDir)) return;
				started.current.add(project.rootDir);
				scan(project, false, request.current);
			}, [openProject, scan]);
			/**
			* Open the only project of a workspace without being asked.
			*
			* With exactly one candidate, the task list is what a person opening this page
			* came for, and its result is cached on disk, so this costs at most one
			* configuration. A workspace of several repositories stays folded instead,
			* because opening them all would start that many builds.
			*/
			react.useEffect(() => {
				const projects = location?.projects;
				if (projects === void 0 || projects.length !== 1) return;
				const only = projects[0];
				if (only === void 0 || started.current.has(only.rootDir)) return;
				started.current.add(only.rootDir);
				openProject(only.rootDir);
				scan(only, false, request.current);
			}, [location, scan]);
			/** Change the JDK and rescan every configured project, because the report comes from a Gradle run. */
			const chooseJava = react.useCallback((value) => {
				const next = value === "" ? null : value;
				setJavaHome(next);
				writeStored(JAVA_KEY, next);
				const scanned = (location?.projects ?? []).filter((project) => started.current.has(project.rootDir));
				if (scanned.length === 0) return;
				(async () => {
					for (const project of scanned) await scan(project, true, request.current);
				})();
			}, [location, scan]);
			/**
			* Toggle offline mode.
			*
			* The report a build configures can differ offline — a plugin that resolves a
			* dependency during configuration registers fewer tasks — so configured
			* projects are rescanned rather than reused.
			*/
			const toggleOffline = react.useCallback(() => {
				const next = !offline;
				setOffline(next);
				writeStored(OFFLINE_KEY, next ? "1" : "0");
				const scanned = (location?.projects ?? []).filter((project) => started.current.has(project.rootDir));
				if (scanned.length === 0) return;
				(async () => {
					for (const project of scanned) await scan(project, true, request.current);
				})();
			}, [
				offline,
				location,
				scan
			]);
			/** Run one task in a Session terminal, reusing that build root's terminal. */
			const runTask = react.useCallback(async (project, taskPath) => {
				if (launching !== null) return;
				setLaunching(taskPath);
				setSelected(taskPath);
				try {
					const answer = await startTaskRun({
						sessionId,
						project: project.rootDir,
						javaHome,
						offline,
						force: true
					}, taskPath, openTerminalIds());
					if (!answer.ok) {
						setProblem({
							code: answer.error,
							detail: answer.detail
						});
						return;
					}
					setProblem(null);
					setLaunch({
						taskPath: answer.taskPath,
						command: answer.command,
						terminalTitle: answer.terminalTitle
					});
					revealTerminal(answer.terminalId);
				} catch (error) {
					setProblem(failureFrom(error));
				} finally {
					setLaunching(null);
				}
			}, [
				launching,
				sessionId,
				javaHome,
				offline,
				openTerminalIds,
				revealTerminal
			]);
			/** Fold or unfold one group or module node; these start folded. */
			const toggleNode = react.useCallback((key) => {
				setOpenNodes((previous) => {
					const next = previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key];
					writeStored(OPEN_NODE_KEY, JSON.stringify(next));
					return next;
				});
			}, []);
			const needle = filter.trim().toLowerCase();
			const projects = location?.projects ?? [];
			const loaded = projects.filter((project) => states.get(project.rootDir)?.tree != null);
			const taskTotal = loaded.reduce((sum, project) => sum + (states.get(project.rootDir)?.tree?.taskCount ?? 0), 0);
			const statusLine = (() => {
				if (busy) return t("status.scanningWorkspace");
				if (problem !== null) return describeFailure(problem, t);
				if (location === null) return t("status.noSession");
				if (projects.length === 0) return t("status.noProjects", { path: location.path });
				return t("status.projects", {
					projects: projects.length,
					scanned: loaded.length,
					tasks: taskTotal
				});
			})();
			/**
			* The projects the tree shows, each paired with the tree to render.
			*
			* A term matching a project's name keeps the project folded rather than
			* hiding it: its tasks were never scanned, so a filter that dropped it would
			* look like the repository had disappeared. A term matching one of its tasks
			* keeps it as well, and drops the tasks that do not match.
			*/
			const visible = react.useMemo(() => {
				const rows = [];
				for (const project of projects) {
					const tree = states.get(project.rootDir)?.tree ?? null;
					if (needle === "") {
						rows.push({
							project,
							tree
						});
						continue;
					}
					if (projectMatches(project, needle)) {
						rows.push({
							project,
							tree
						});
						continue;
					}
					const narrowed = filterTree(tree, needle);
					if (narrowed !== null && narrowed.taskCount > 0) rows.push({
						project,
						tree: narrowed
					});
				}
				return rows;
			}, [
				projects,
				states,
				needle
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gt-root",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gt-header",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(JdkPicker, {
								candidates: location?.jdks ?? [],
								value: javaHome,
								label: t("toolbar.java"),
								emptyCopy: t("toolbar.javaMissing"),
								ariaLabel: t("toolbar.javaHint"),
								onChoose: chooseJava
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: offline ? "gt-icon-button gt-icon-button-on" : "gt-icon-button",
								type: "button",
								"aria-pressed": offline,
								title: offline ? t("toolbar.offlineOn") : t("toolbar.offlineOff"),
								onClick: toggleOffline,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(OfflineIcon, {})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: "gt-icon-button",
								type: "button",
								title: t("toolbar.rescan"),
								disabled: busy,
								onClick: () => {
									load(true);
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RefreshIcon, {})
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gt-hint",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gt-status",
								children: statusLine
							}),
							location?.truncated !== true || location === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gt-hint-warn",
								children: t("status.truncated")
							}),
							launch === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gt-hint-launch",
								title: launch.command,
								children: t("run.launched", {
									task: launch.taskPath,
									terminal: launch.terminalTitle
								})
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gt-toolbar",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "gt-filter-wrap",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gt-filter-icon",
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SearchIcon, {})
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: "gt-filter",
								value: filter,
								placeholder: t("tasks.filter"),
								onChange: (event) => {
									setFilter(event.target.value);
								}
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gt-count",
							children: taskTotal
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gt-scroll",
						children: [
							visible.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gt-empty",
								children: projects.length === 0 ? location === null ? t("status.noSession") : t("tasks.noProjects") : t("tasks.empty")
							}) : null,
							visible.map(({ project, tree }) => {
								const state = states.get(project.rootDir) ?? IDLE;
								const key = nodeKey(project.rootDir);
								const open = needle !== "" || opened.includes(key);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProjectRow, {
									project,
									state,
									open,
									filterActive: needle !== "",
									openNodes,
									selected,
									launching,
									t,
									tree,
									errorOpen: openErrors.includes(project.rootDir),
									onToggleError: () => {
										toggleError(project.rootDir);
									},
									onToggle: () => {
										if (needle !== "" || !open) {
											expandProject(project);
											return;
										}
										toggleProject(project.rootDir);
									},
									onRescan: () => {
										scan(project, true, request.current);
									},
									onToggleNode: toggleNode,
									onSelect: setSelected,
									onRun: (taskPath) => {
										runTask(project, taskPath);
									}
								}, project.rootDir);
							}),
							projects.length > 0 && loaded.length === 0 && needle === "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gt-hint-foot",
								children: t("tasks.expandHint")
							}) : null
						]
					})
				]
			});
		}
		/**
		* Narrow a tree to what the search term matches.
		*
		* Groups and modules survive only while they hold a match, which is what makes
		* a search read as a result list rather than as a tree with holes in it.
		*/
		function filterTree(tree, needle) {
			if (tree === null || needle === "") return tree;
			const narrow = (groups) => groups.map((group) => ({
				group: group.group,
				tasks: group.tasks.filter((task) => taskMatches(task, needle))
			})).filter((group) => group.tasks.length > 0);
			const aggregate = tree.aggregate.map((group) => ({
				group: group.group,
				tasks: group.tasks.filter((task) => taskMatches(task, needle))
			})).filter((group) => group.tasks.length > 0);
			return {
				aggregate,
				modules: tree.modules.map((module) => ({
					...module,
					groups: narrow(module.groups)
				})).filter((module) => module.groups.length > 0),
				taskCount: aggregate.reduce((sum, group) => sum + group.tasks.length, 0)
			};
		}
		/**
		* One build root: its own groups, then one row per subproject, each with its
		* groups. A subproject row only exists when the build has one, so a plain
		* application reads as project → group → task, exactly as before.
		* @param props - described by {@link ProjectRowProps}.
		* @returns the rows of one project subtree.
		*/
		function ProjectRow(props) {
			const { project, state, open, filterActive, tree, openNodes, selected, launching, t, errorOpen, onToggleError, onToggle, onRescan, onToggleNode, onSelect, onRun } = props;
			const moduleCount = tree === null ? project.modules.length : tree.modules.length;
			const badge = state.status === "loading" ? t("project.scanning") : state.status === "failed" ? t("project.failed") : moduleCount > 0 ? t("project.modules", { count: moduleCount }) : tree === null ? "" : t("project.tasks", { count: tree.taskCount });
			const scanNote = state.status === "failed" ? t("status.failedAt") : state.cachedAt !== null ? t("status.cachedAt", { time: formatTimestamp(state.cachedAt) }) : state.tree === null ? t("tasks.loadHint") : t("status.scannedAt", {
				time: formatTimestamp(Date.now() - state.durationMs),
				duration: formatDuration(state.durationMs)
			});
			const folder = project.relativePath.split("/").at(-1) ?? project.relativePath;
			const showPath = project.relativePath !== "." && !project.relativePath.startsWith("..") && folder.toLowerCase() !== project.name.toLowerCase();
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: open ? "gt-row gt-row-project gt-row-open" : "gt-row gt-row-project",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "gt-twisty",
							type: "button",
							"aria-expanded": open,
							"aria-label": open ? t("project.collapse") : t("project.expand"),
							onClick: onToggle,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: open ? "gt-caret gt-open" : "gt-caret",
								children: "▶"
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							className: "gt-row-body",
							type: "button",
							title: `${project.rootDir}
${t("project.aggregate")}`,
							onClick: onToggle,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-row-icon gt-icon-project",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProjectIcon, {})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-row-name",
									children: project.name
								}),
								showPath ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-row-path",
									children: project.relativePath
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: state.status === "loading" ? "gt-badge gt-badge-busy" : "gt-badge",
									title: scanNote,
									children: [state.status === "loading" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SpinnerIcon, {}) : null, badge]
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "gt-row-action",
							type: "button",
							title: t("project.rescan"),
							onClick: onRescan,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RefreshIcon, { size: 13 })
						})
					]
				}),
				state.status === "failed" && state.failure !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FailureRow, {
					failure: state.failure,
					open: errorOpen,
					onToggle: onToggleError,
					t
				}) : null,
				!open ? null : tree === null ? state.status === "loading" ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "gt-row-note",
					children: t("tasks.loadHint")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AggregateGroupRows, {
						groups: tree.aggregate,
						rootDir: project.rootDir,
						openNodes,
						selected,
						launching,
						t,
						onToggleNode,
						onSelect,
						onRun
					}),
					tree.modules.length === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gt-section",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gt-section-text",
							children: t("project.subprojects")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gt-badge",
							children: tree.modules.length
						})]
					}),
					tree.modules.map((module) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModuleRows, {
						module,
						rootDir: project.rootDir,
						openNodes,
						forceOpen: filterActive,
						selected,
						launching,
						t,
						onToggleNode,
						onSelect,
						onRun
					}, module.path))
				] })
			] });
		}
		/**
		* One project's failure: the cause as a row, the build log behind a toggle.
		* @param props - the failure, its unfold state, and the toggle.
		* @returns the failure row, and its log when unfolded.
		*/
		function FailureRow(props) {
			const { failure, open, onToggle, t } = props;
			const { summary, detail } = splitFailure(failure);
			const message = t(FAILURE_COPY[failure.code], { detail: summary });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gt-row-error-box",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					className: "gt-row-error",
					type: "button",
					"aria-expanded": open && detail !== "",
					disabled: detail === "",
					title: detail === "" ? summary : t("project.failureHint"),
					onClick: onToggle,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gt-row-error-mark",
							"aria-hidden": "true",
							children: "!"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gt-row-error-text",
							children: message
						}),
						detail === "" ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: open ? "gt-caret gt-open" : "gt-caret",
							children: "▶"
						})
					]
				}), open && detail !== "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
					className: "gt-row-error-log",
					children: detail
				}) : null]
			});
		}
		/**
		* The guides that show a row's level.
		*
		* A row indented by padding alone leaves the reader counting pixels to tell a
		* task from its group; a hairline per level makes the nesting readable at a
		* glance, the way an IDE tree does.
		* @param props - how many levels deep the row sits.
		* @returns one spacer per level, or nothing for a top-level row.
		*/
		function Guides({ depth }) {
			if (depth <= 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: Array.from({ length: depth }, (_, level) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: "gt-guide",
				"aria-hidden": "true"
			}, level)) });
		}
		/**
		* The hover text of one aggregated task row.
		*
		* A row that reaches several projects says which ones, because the count in its
		* badge answers "how many" but not "which"; the description follows on its own
		* paragraph so a long list of project paths does not bury it.
		* @param projects - every project declaring the name, or none when only one does.
		* @param description - the description the declaring projects agree on.
		* @returns the text, without a trailing separator.
		*/
		function aggregateTitle(projects, description) {
			const lines = projects.length === 0 ? [] : [projects.join("\n")];
			if (description !== "") lines.push(description);
			return lines.join("\n\n");
		}
		/**
		* The build's groups, one row per task name.
		*
		* A row runs the bare name, which is what Gradle expands across every project
		* that declares it; the badge counts those projects, so a row that starts three
		* builds says so before it is clicked.
		* @param props - described by {@link AggregateGroupRowsProps}.
		* @returns the group rows and their task names.
		*/
		function AggregateGroupRows(props) {
			const { groups, rootDir, openNodes, selected, launching, t, onToggleNode, onSelect, onRun } = props;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: groups.map((group) => {
				const key = nodeKey(rootDir, "aggregate", group.group);
				const open = openNodes.includes(key);
				const name = group.group === "" ? t("tasks.ungrouped") : group.group;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gt-row gt-row-group",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Guides, { depth: 1 }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "gt-twisty",
							type: "button",
							"aria-expanded": open,
							onClick: () => {
								onToggleNode(key);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: open ? "gt-caret gt-open" : "gt-caret",
								children: "▶"
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							className: "gt-row-body",
							type: "button",
							onClick: () => {
								onToggleNode(key);
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-row-icon gt-icon-group",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderIcon, { open })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-row-name",
									children: name
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-badge",
									children: group.tasks.length
								})
							]
						})
					]
				}), !open ? null : group.tasks.map((task) => {
					const shared = task.projects.length > 1;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: selected === task.name ? "gt-row gt-row-task gt-row-selected" : "gt-row gt-row-task",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Guides, { depth: 2 }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							className: "gt-row-body gt-row-task-body",
							type: "button",
							title: aggregateTitle(shared ? task.projects : [], task.description),
							disabled: launching !== null,
							onClick: () => {
								onSelect(task.name);
							},
							onDoubleClick: () => {
								onRun(task.name);
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-row-icon gt-icon-task",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TaskIcon, {})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-row-name gt-row-task-name",
									children: launching === task.name ? t("run.starting") : task.name
								}),
								shared ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-badge",
									children: task.projects.length
								}) : null
							]
						})]
					}, task.name);
				})] }, key);
			}) });
		}
		/**
		* The groups of one project or module.
		* @param props - described by {@link GroupRowsProps}.
		* @returns the group rows and their tasks.
		*/
		function GroupRows(props) {
			const { groups, depth, rootDir, nodePath, scope, openNodes, selected, launching, t, onToggleNode, onSelect, onRun } = props;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: groups.map((group) => {
				const key = nodeKey(rootDir, nodePath, group.group);
				const open = openNodes.includes(key);
				const name = group.group === "" ? t("tasks.ungrouped") : group.group;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "gt-row gt-row-group",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Guides, { depth }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: "gt-twisty",
							type: "button",
							"aria-expanded": open,
							onClick: () => {
								onToggleNode(key);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: open ? "gt-caret gt-open" : "gt-caret",
								children: "▶"
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							className: "gt-row-body",
							type: "button",
							onClick: () => {
								onToggleNode(key);
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-row-icon gt-icon-group",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FolderIcon, { open })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-row-name",
									children: name
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-badge",
									children: group.tasks.length
								})
							]
						})
					]
				}), !open ? null : group.tasks.map((task) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: selected === task.path ? "gt-row gt-row-task gt-row-selected" : "gt-row gt-row-task",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Guides, { depth: depth + 1 }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: "gt-row-body gt-row-task-body",
						type: "button",
						title: task.description === "" ? task.path : `${task.path} — ${task.description}`,
						disabled: launching !== null,
						onClick: () => {
							onSelect(task.path);
						},
						onDoubleClick: () => {
							onRun(task.path);
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gt-row-icon gt-icon-task",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TaskIcon, {})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gt-row-name gt-row-task-name",
							children: launching === task.path ? t("run.starting") : taskLabel(task, scope)
						})]
					})]
				}, task.path))] }, key);
			}) });
		}
		/**
		* One subproject: its own foldable row, then its groups one level deeper.
		* @param props - described by {@link ModuleRowsProps}.
		* @returns the module's rows.
		*/
		function ModuleRows(props) {
			const { module, rootDir, openNodes, forceOpen, selected, launching, t, onToggleNode, onSelect, onRun } = props;
			const key = nodeKey(rootDir, module.path);
			const open = forceOpen || openNodes.includes(key);
			const count = module.groups.reduce((sum, group) => sum + group.tasks.length, 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gt-row gt-row-module",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Guides, { depth: 1 }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: "gt-twisty",
						type: "button",
						"aria-expanded": open,
						onClick: () => {
							onToggleNode(key);
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: open ? "gt-caret gt-open" : "gt-caret",
							children: "▶"
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						className: "gt-row-body",
						type: "button",
						title: module.path,
						onClick: () => {
							onToggleNode(key);
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gt-row-icon gt-icon-module",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ModuleIcon, {})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gt-row-name gt-row-module-name",
								children: module.name
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gt-badge",
								children: count
							})
						]
					})
				]
			}), !open ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GroupRows, {
				groups: module.groups,
				depth: 2,
				rootDir,
				nodePath: module.path,
				scope: module.path,
				openNodes,
				selected,
				launching,
				t,
				onToggleNode,
				onSelect,
				onRun
			})] });
		}
		// src/client/styles.ts
		/**
		* Panel styles for the right Sidebar's narrow column.
		*
		* Every colour comes from a Host `--dsw-alias-*` token. The fallbacks are
		* deliberately neutral — a `color-mix` of `currentColor`, or `transparent` —
		* because a literal light palette would be legible in a light theme and wrong
		* in a dark one, which is exactly the failure a themed selector is here to fix.
		*/
		/** The stylesheet this plugin installs for the lifetime of its Client run. */
		const STYLES = `
.gt-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--dsw-alias-bg-base, transparent);
  color: var(--dsw-alias-label-primary, inherit);
  font-family: var(--dsw-font-family, inherit);
  font-size: 13px;
  line-height: 1.45;
}

/* ── header: the JDK picker and the two icon controls ───────────────────── */

.gt-header {
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 8px 8px 6px;
}

.gt-java {
  position: relative;
  display: inline-flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 3px 6px 3px 8px;
  border: 0.5px solid var(--dsw-alias-border-l4, currentColor);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-layer-1, transparent);
}

.gt-java[data-open='true'] {
  border-color: var(--dsw-alias-state-business-primary, currentColor);
}

.gt-java-label {
  flex: none;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 11.5px;
  letter-spacing: 0.01em;
}

.gt-picker-trigger {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 4px;
  min-width: 0;
  min-height: 20px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--dsw-alias-label-primary, inherit);
  font: inherit;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
}

.gt-picker-trigger:disabled {
  cursor: default;
}

.gt-picker-trigger:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary, currentColor);
  outline-offset: 2px;
  border-radius: 4px;
}

.gt-picker-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-picker-dim {
  color: var(--dsw-alias-label-tertiary, inherit);
}

.gt-picker-caret {
  display: inline-flex;
  flex: none;
  align-items: center;
  color: var(--dsw-alias-label-tertiary, inherit);
}

/* The popup sits inside the page, above the tree and above a floating pane. */
.gt-popup {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 240px;
  max-width: min(420px, calc(100vw - 24px));
  max-height: 320px;
  padding: 4px;
  overflow: auto;
  border: 0.5px solid var(--dsw-alias-border-l4, currentColor);
  border-radius: var(--dsw-radius-md, 12px);
  background: var(--dsw-specific-menu, var(--dsw-alias-bg-layer-2, Canvas));
  box-shadow: var(--dsw-elevation-panel, 0 6px 20px rgb(0 0 0 / 18%));
  backdrop-filter: var(--dsw-menu-backdrop-filter, none);
}

.gt-popup-above {
  top: auto;
  bottom: calc(100% + 4px);
}

.gt-option {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100%;
  box-sizing: border-box;
  padding: 5px 8px;
  border: 0;
  border-radius: var(--dsw-radius-sm, 8px);
  background: none;
  color: var(--dsw-alias-label-primary, inherit);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.gt-option.gt-option-active {
  background: var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, currentColor 8%, transparent));
}

.gt-option.gt-option-selected {
  background: var(--dsw-alias-button-ghost-active-fill, color-mix(in srgb, currentColor 12%, transparent));
}

.gt-option-main {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 12.5px;
}

.gt-option-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-option-check {
  display: inline-flex;
  flex: none;
  margin-left: auto;
  color: var(--dsw-alias-state-business-primary, currentColor);
}

.gt-option-path {
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-family: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-icon-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0.5px solid var(--dsw-alias-border-l4, currentColor);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-secondary, inherit);
  cursor: pointer;
}

.gt-icon-button:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, currentColor 8%, transparent));
  color: var(--dsw-alias-label-primary, inherit);
}

.gt-icon-button:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary, currentColor);
  outline-offset: 1px;
}

.gt-icon-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.gt-icon-button.gt-icon-button-on {
  border-color: var(--dsw-alias-state-business-primary, currentColor);
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, currentColor) 16%, transparent);
  color: var(--dsw-alias-state-business-primary, currentColor);
}

/* ── status lines ───────────────────────────────────────────────────────── */

.gt-hint {
  flex: none;
  padding: 0 10px 6px;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 11.5px;
  word-break: break-word;
}

.gt-status {
  color: var(--dsw-alias-label-secondary, inherit);
}

.gt-hint-warn {
  color: var(--dsw-alias-state-warn-primary, inherit);
}

.gt-hint-launch {
  margin-top: 3px;
  color: var(--dsw-alias-state-success-primary, inherit);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-hint-foot {
  padding: 10px 12px 16px;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 11.5px;
  text-align: center;
}

/* ── filter row ─────────────────────────────────────────────────────────── */

.gt-toolbar {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-top: 0.5px solid var(--dsw-alias-border-l2, currentColor);
}

.gt-filter-wrap {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 5px;
  min-width: 0;
  padding: 3px 8px;
  border: 0.5px solid var(--dsw-alias-border-l4, currentColor);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-layer-1, transparent);
}

.gt-filter-wrap:focus-within {
  border-color: var(--dsw-alias-state-business-primary, currentColor);
}

.gt-filter-icon {
  display: inline-flex;
  flex: none;
  color: var(--dsw-alias-label-tertiary, inherit);
}

.gt-filter {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 12px;
}

.gt-filter::placeholder {
  color: var(--dsw-alias-label-tertiary, inherit);
}

.gt-count {
  flex: none;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}

/* ── the tree ───────────────────────────────────────────────────────────── */

.gt-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 2px 6px 12px;
  scrollbar-color: var(--dsw-alias-scrollbar-bg-l2, transparent) transparent;
  scrollbar-width: thin;
}

.gt-row {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  min-height: 22px;
  padding-right: 4px;
  border-radius: var(--dsw-radius-sm, 8px);
  color: var(--dsw-alias-label-secondary, inherit);
}

/* One hairline per level, drawn on the row's own left edge: a row indented by
   padding alone makes a task and its group hard to tell apart, and the rail is
   what turns the indent into a readable hierarchy. It fades at the row's ends so
   neighbouring rows join into a continuous line. */
.gt-guide {
  flex: none;
  align-self: stretch;
  width: 16px;
  box-sizing: border-box;
  border-left: 0.5px solid var(--dsw-alias-border-l2, color-mix(in srgb, currentColor 22%, transparent));
}

.gt-row:hover {
  background: var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, currentColor 8%, transparent));
}

.gt-twisty {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 20px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--dsw-alias-label-tertiary, inherit);
  cursor: pointer;
}

.gt-caret {
  display: inline-block;
  font-size: 8px;
  line-height: 1;
  transition: transform 0.12s ease;
}

.gt-caret.gt-open {
  transform: rotate(90deg);
}

.gt-row-body {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 5px;
  min-width: 0;
  padding: 2px 2px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.gt-row-body:focus-visible {
  outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-alias-state-business-primary, currentColor);
  outline-offset: -1px;
  border-radius: 4px;
}

.gt-row-icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 16px;
}

.gt-icon-project {
  color: var(--dsw-alias-state-business-primary, currentColor);
}

.gt-icon-module {
  color: var(--dsw-alias-label-secondary, inherit);
}

.gt-icon-group {
  color: var(--dsw-alias-label-tertiary, inherit);
}

.gt-icon-task {
  color: var(--dsw-alias-label-tertiary, inherit);
}

.gt-row-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-row-project .gt-row-name {
  color: var(--dsw-alias-label-primary, inherit);
  font-weight: 600;
}

.gt-row-path {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 10.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-row-module-name {
  color: var(--dsw-alias-label-primary, inherit);
}

.gt-row-group .gt-row-name {
  font-weight: 500;
}

.gt-row-task-name {
  font-size: 12.5px;
}

.gt-badge {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding-left: 6px;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.gt-badge-busy {
  color: var(--dsw-alias-state-business-primary, currentColor);
}

.gt-row-action {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 2px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: none;
  color: var(--dsw-alias-label-tertiary, inherit);
  opacity: 0;
  cursor: pointer;
}

.gt-row:hover .gt-row-action,
.gt-row-action:focus-visible {
  opacity: 1;
}

.gt-row-action:hover {
  color: var(--dsw-alias-label-primary, inherit);
}

.gt-row-task {
  color: var(--dsw-alias-label-secondary, inherit);
}

.gt-row-task:hover .gt-row-task-name {
  color: var(--dsw-alias-label-primary, inherit);
}

.gt-row-task.gt-row-selected {
  background: var(--dsw-alias-interactive-bg-active, color-mix(in srgb, currentColor 14%, transparent));
  box-shadow: inset 2px 0 0 var(--dsw-alias-state-business-primary, currentColor);
}

.gt-row-task.gt-row-selected .gt-row-task-name {
  color: var(--dsw-alias-label-primary, inherit);
}

.gt-row-task-body:disabled {
  cursor: progress;
  opacity: 0.6;
}

/* The heading between the build-wide list and the subproject rows. It is not a
   row: nothing folds here, it only names what follows so the same task appearing
   twice in the tree does not read as a duplicate. */
.gt-section {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 6px 0 2px;
  padding: 2px 4px 2px 8px;
  border-top: 0.5px solid var(--dsw-alias-border-l1, color-mix(in srgb, currentColor 14%, transparent));
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 10.5px;
  letter-spacing: 0.02em;
}

.gt-section-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-row-note {
  padding: 3px 8px 6px 34px;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 11.5px;
  word-break: break-word;
}

/* A failure is one row like any other: the cause, and a caret when the build
   log is worth unfolding underneath it. */
.gt-row-error-box {
  padding: 0 6px 2px 18px;
}

.gt-row-error {
  display: flex;
  align-items: baseline;
  gap: 5px;
  width: 100%;
  box-sizing: border-box;
  padding: 2px 4px;
  border: 0;
  border-radius: var(--dsw-radius-sm, 8px);
  background: none;
  color: var(--dsw-alias-state-error-primary, inherit);
  font: inherit;
  font-size: 11.5px;
  text-align: left;
  cursor: pointer;
}

.gt-row-error:disabled {
  cursor: default;
}

.gt-row-error:hover:not(:disabled) {
  background: var(--dsw-alias-interactive-bg-hover-danger, color-mix(in srgb, currentColor 10%, transparent));
}

.gt-row-error-mark {
  flex: none;
  font-weight: 700;
}

.gt-row-error-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gt-row-error .gt-caret {
  flex: none;
  margin-left: auto;
  color: var(--dsw-alias-label-tertiary, inherit);
}

/* The unfolded log keeps the panel's width: it scrolls in both directions
   rather than pushing the tree sideways. */
.gt-row-error-log {
  max-height: 220px;
  margin: 2px 0 4px;
  padding: 6px 8px;
  overflow: auto;
  border: 0.5px solid var(--dsw-alias-border-l2, currentColor);
  border-radius: var(--dsw-radius-sm, 8px);
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-secondary, inherit);
  font-family: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
  font-size: 10.5px;
  line-height: 1.4;
  white-space: pre;
  tab-size: 2;
}

.gt-spinner {
  animation: gt-spin 0.9s linear infinite;
  transform-origin: 50% 50%;
}

@keyframes gt-spin {
  to { transform: rotate(360deg); }
}

.gt-empty {
  padding: 20px 12px;
  color: var(--dsw-alias-label-tertiary, inherit);
  font-size: 12px;
  text-align: center;
  word-break: break-word;
}

@media (prefers-reduced-motion: reduce) {
  .gt-caret,
  .gt-spinner {
    transition: none;
    animation: none;
  }
}
`;
		// src/client/index.tsx
		const name = "dsh-gradle-tasks";
		/**
		* Browser services this plugin needs.
		*
		* `webTerminals` and `sidebarRight` are what turn a run into a visible terminal
		* tab; they are declared here rather than read optionally because without them
		* a task could run where nobody can see it.
		*/
		const inject = [
			"slots",
			"sidebarRightTabs",
			"sidebarRight",
			"webTerminals"
		];
		/** Identity of this tab type in the Sidebar's registry, and the key its body registers under. */
		const TAB_ID = "dsh-gradle-tasks";
		/** The tab kind callers name when opening the page. */
		const TAB_KIND = "gradle-tasks";
		/** The guide card that opens this page. */
		const GUIDE_ENTRY_ID = "gradle-tasks";
		/**
		* Mount the page: its tab type, its body, and its copy.
		* @param ctx - browser Context with the slot, tab-type, and terminal faces.
		*/
		function apply(ctx) {
			ctx.effect(() => installStyles(), "gradle-tasks: styles");
			registerDictionaries(ctx);
			const translator = createTranslator(ctx);
			const sidebar = ctx.sidebarRight;
			const terminals = ctx.webTerminals;
			/** Terminal identities this Session currently shows as tabs. */
			const openTerminalIds = (sessionId) => sidebar.tabsIn(sessionId).flatMap((tab) => {
				if (tab.kind !== "terminal") return [];
				const id = terminals.boundTerminal(sessionId, tab.contentId);
				return id === void 0 ? [] : [id];
			});
			/**
			* Bring a terminal's tab to the front, opening it when it is not there yet.
			*
			* The terminal panel also opens a tab by itself for a terminal an Agent
			* creates, so the tab this opens is bound to the terminal straight away: an
			* unbound tab is invisible to that check, and the panel would open a second
			* tab for the same terminal.
			* @param sessionId - Session the run belongs to.
			* @param terminalId - the terminal the command went to.
			*/
			const revealTerminal = (sessionId, terminalId) => {
				const shown = sidebar.tabsIn(sessionId).find((tab) => tab.kind === "terminal" && terminals.boundTerminal(sessionId, tab.contentId) === terminalId);
				if (shown !== void 0) {
					sidebar.focus(shown.id);
					return;
				}
				const before = new Set(sidebar.tabsIn(sessionId).map((tab) => tab.id));
				sidebar.openTabIn(sessionId, "terminal", { params: { terminalId } });
				const opened = sidebar.tabsIn(sessionId).find((tab) => tab.kind === "terminal" && !before.has(tab.id));
				if (opened === void 0) {
					console.warn(`gradle-tasks: the terminal tab for ${terminalId} did not open`);
					return;
				}
				terminals.bind(sessionId, opened.contentId, terminalId);
			};
			ctx.effect(() => ctx.sidebarRightTabs.register({
				id: TAB_ID,
				kind: TAB_KIND,
				priority: "extension",
				title: () => translator.t("panel.title"),
				guide: [{
					id: GUIDE_ENTRY_ID,
					order: 30,
					title: () => translator.t("panel.title"),
					description: () => translator.t("panel.description"),
					icon: GradleTasksIcon
				}]
			}), "gradle-tasks: tab type");
			ctx.effect(() => ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
				name: "sidebar.right.pane.tab",
				key: TAB_ID,
				inject: (sessionId) => ({
					sessionId,
					translator,
					openTerminalIds: () => openTerminalIds(sessionId),
					revealTerminal: (terminalId) => {
						revealTerminal(sessionId, terminalId);
					}
				})
			}, GradleTasksPanel)), "gradle-tasks: tab body");
		}
		/**
		* Attach the stylesheet, once per page, tagged so the Host can remove it when
		* this plugin unloads.
		* @returns the disposer removing the tag this call created.
		*/
		function installStyles() {
			const id = `${name}/styles.css`;
			const existing = document.querySelector(`style[data-plugin-css=${JSON.stringify(id)}]`);
			if (existing !== null) return () => {
				existing.remove();
			};
			const tag = document.createElement("style");
			tag.dataset.plugin = name;
			tag.dataset.pluginCss = id;
			tag.textContent = STYLES;
			document.head.appendChild(tag);
			return () => {
				tag.remove();
			};
		}
		/**
		* Publish this plugin's copy through the Host locale service when it is
		* mounted. Without it the panel falls back to its own dictionary lookup.
		* @param ctx - browser Context.
		*/
		function registerDictionaries(ctx) {
			const locale = ctx.get("locale");
			if (locale === void 0) return;
			ctx.effect(() => locale.register(NAMESPACE, DICTIONARIES), "gradle-tasks: dictionaries");
		}
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map