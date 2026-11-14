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
		// src/client/locales.ts
		/** Copy namespace registered with the locale service. */
		const NAMESPACE = "gradleTasks";
		/** Every language this plugin ships, keyed the way the locale service expects. */
		const DICTIONARIES = {
			zh: {
				"panel.title": "Gradle 任务",
				"panel.description": "浏览并运行当前会话项目的 Gradle 任务",
				"toolbar.java": "Java",
				"toolbar.javaMissing": "未发现 JDK",
				"toolbar.javaHint": "运行 Gradle 时使用的 JDK",
				"toolbar.rescan": "重新扫描任务",
				"toolbar.offlineOn": "离线模式已开启，点击关闭（运行时不访问网络）",
				"toolbar.offlineOff": "离线模式已关闭，点击开启（运行时加 --offline）",
				"status.noSession": "正在读取当前会话目录…",
				"status.scanning": "正在扫描任务…",
				"status.scanned": "共 {count} 个任务，{groups} 个分组，耗时 {duration}",
				"status.wrapper": "Wrapper {version}",
				"status.noWrapper": "无 wrapper，使用 PATH 中的 gradle",
				"status.cachedAt": "来自缓存 · 扫描于 {time} · 构建脚本未变化",
				"tasks.filter": "过滤任务",
				"tasks.empty": "没有匹配的任务",
				"tasks.ungrouped": "未分组",
				"tasks.runHint": "双击任务，在终端里运行",
				"run.starting": "正在启动终端…",
				"run.launched": "已在「{terminal}」运行 {task}",
				"fail.no-session": "缺少会话标识",
				"fail.session-inactive": "当前会话尚未激活，请先打开一次对话",
				"fail.directory-missing": "目录不存在：{detail}",
				"fail.directory-relative": "需要绝对路径：{detail}",
				"fail.not-gradle": "当前目录不是 Gradle 项目：{detail}",
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
				"panel.description": "Browse and run the Gradle tasks of this Session’s project",
				"toolbar.java": "Java",
				"toolbar.javaMissing": "No JDK found",
				"toolbar.javaHint": "JDK used to run Gradle",
				"toolbar.rescan": "Rescan tasks",
				"toolbar.offlineOn": "Offline mode is on; click to turn it off (no network during runs)",
				"toolbar.offlineOff": "Offline mode is off; click to turn it on (runs pass --offline)",
				"status.noSession": "Reading this Session’s directory…",
				"status.scanning": "Scanning tasks…",
				"status.scanned": "{count} tasks in {groups} groups, took {duration}",
				"status.wrapper": "Wrapper {version}",
				"status.noWrapper": "No wrapper, using gradle from PATH",
				"status.cachedAt": "From cache · scanned {time} · build scripts unchanged",
				"tasks.filter": "Filter tasks",
				"tasks.empty": "No matching task",
				"tasks.ungrouped": "Ungrouped",
				"tasks.runHint": "Double-click a task to run it in a terminal",
				"run.starting": "Starting the terminal…",
				"run.launched": "{task} is running in “{terminal}”",
				"fail.no-session": "The request named no Session",
				"fail.session-inactive": "This Session is not active yet; open the conversation once first",
				"fail.directory-missing": "Directory not found: {detail}",
				"fail.directory-relative": "An absolute path is required: {detail}",
				"fail.not-gradle": "Not a Gradle project: {detail}",
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
		* @param query - the Session, the JDK, and the offline choice.
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
					taskPath,
					javaHome: query.javaHome ?? void 0,
					offline: query.offline === true,
					openTerminalIds: [...openTerminalIds]
				})
			});
		}
		// src/client/panel.tsx
		/**
		* The Gradle Tasks page: the JDK selector and two icon controls, the task
		* folders, and one line describing what the last run did.
		*
		* The panel shows no build output of its own: a task runs in a real Session
		* terminal, which the Sidebar shows as its own tab, so the person keeps the
		* scrollback, the colours, and the ability to interrupt the build.
		*/
		/** Browser storage keys this panel owns. */
		const JAVA_KEY = "dsh.gradle-tasks.javaHome";
		const OFFLINE_KEY = "dsh.gradle-tasks.offline";
		const COLLAPSED_KEY = "dsh.gradle-tasks.collapsed";
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
		/** Read the stored collapsed-group list. */
		function readCollapsed() {
			const raw = readStored(COLLAPSED_KEY);
			if (raw === null) return [];
			try {
				const parsed = JSON.parse(raw);
				return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
			} catch (error) {
				console.warn(`gradle-tasks: ignoring unreadable ${COLLAPSED_KEY}`, error);
				return [];
			}
		}
		/** Pick the JDK to use: the remembered one when it still exists, else the default. */
		function resolveJavaHome(preferred, jdks) {
			if (preferred !== null && jdks.some((candidate) => candidate.home === preferred)) return preferred;
			return jdks.find((candidate) => candidate.isDefault)?.home ?? jdks[0]?.home ?? null;
		}
		/** The task path without its Gradle path prefix, for display. */
		function taskLabel(task) {
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
		/** Filter tasks by a case-insensitive substring of path or description. */
		function filterGroups(groups, filter) {
			const needle = filter.trim().toLowerCase();
			if (needle === "") return [...groups];
			return groups.map((group) => ({
				group: group.group,
				tasks: group.tasks.filter((task) => task.path.toLowerCase().includes(needle) || task.description.toLowerCase().includes(needle))
			})).filter((group) => group.tasks.length > 0);
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
			const [groups, setGroups] = react.useState([]);
			const [scanMs, setScanMs] = react.useState(0);
			const [cacheHit, setCacheHit] = react.useState(null);
			const [javaHome, setJavaHome] = react.useState(() => readStored(JAVA_KEY));
			const [offline, setOffline] = react.useState(() => readStored(OFFLINE_KEY) === "1");
			const [busy, setBusy] = react.useState(false);
			const [problem, setProblem] = react.useState(null);
			const [filter, setFilter] = react.useState("");
			const [selected, setSelected] = react.useState(null);
			const [collapsed, setCollapsed] = react.useState(readCollapsed);
			const [launch, setLaunch] = react.useState(null);
			const [launching, setLaunching] = react.useState(null);
			const request = react.useRef(0);
			/**
			* Read the task report for this Session.
			*
			* A scan can take minutes, so the answer is applied only while its ticket is
			* still the newest: a person who switches JDK or offline mode mid-scan sees
			* the report for the choice they ended on, never an earlier one arriving late.
			* @param jdk - JDK to configure the build with.
			* @param force - configure the build again instead of reusing the cache.
			* @param ticket - request identity taken before the call.
			* @param state - the location this scan belongs to.
			*/
			const scan = react.useCallback(async (jdk, force, ticket, state) => {
				const listing = await fetchTasks({
					sessionId,
					javaHome: jdk,
					offline,
					force
				});
				if (ticket !== request.current) return;
				if (!listing.ok) {
					setGroups([]);
					setCacheHit(null);
					setProblem({
						code: listing.error,
						detail: listing.detail ?? listing.output
					});
					return;
				}
				setProblem(null);
				setLocation(state);
				setGroups(listing.groups);
				setScanMs(listing.durationMs);
				setCacheHit(listing.cached ? listing.scannedAt : null);
			}, [sessionId, offline]);
			/**
			* Ask the Host what this Session's directory is, then which tasks it declares.
			* @param force - configure the build again instead of reusing the cache.
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
						setGroups([]);
						setCacheHit(null);
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
						project: state.project,
						jdks: state.jdks
					};
					if (state.project === null) {
						setLocation(located);
						setGroups([]);
						setCacheHit(null);
						setProblem({
							code: "not-gradle",
							detail: state.path
						});
						return;
					}
					await scan(chosen, force, ticket, located);
				} catch (error) {
					if (ticket !== request.current) return;
					setProblem(failureFrom(error));
					setGroups([]);
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
			/** Change the JDK and rescan, because the task report comes from a Gradle run. */
			const chooseJava = react.useCallback((value) => {
				const next = value === "" ? null : value;
				setJavaHome(next);
				writeStored(JAVA_KEY, next);
				if (location?.project == null) return;
				load(true, next);
			}, [location, load]);
			/**
			* Toggle offline mode.
			*
			* The report a build configures can differ offline — a plugin that resolves a
			* dependency during configuration registers fewer tasks — so the list is
			* rescanned rather than reused.
			*/
			const toggleOffline = react.useCallback(() => {
				const next = !offline;
				setOffline(next);
				writeStored(OFFLINE_KEY, next ? "1" : "0");
				if (location?.project == null) return;
				load(true);
			}, [
				offline,
				location,
				load
			]);
			/** Run one task in a Session terminal, reusing the one already open. */
			const runTask = react.useCallback(async (task) => {
				if (launching !== null) return;
				setLaunching(task.path);
				setSelected(task.path);
				try {
					const answer = await startTaskRun({
						sessionId,
						javaHome,
						offline,
						force: true
					}, task.path, openTerminalIds());
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
			const visible = filterGroups(groups, filter);
			const total = groups.reduce((sum, group) => sum + group.tasks.length, 0);
			const statusLine = (() => {
				if (busy) return t("status.scanning");
				if (problem !== null) return describeFailure(problem, t);
				if (location === null) return t("status.noSession");
				if (cacheHit !== null) return t("status.cachedAt", { time: formatTimestamp(cacheHit) });
				return t("status.scanned", {
					count: total,
					groups: groups.length,
					duration: formatDuration(scanMs)
				});
			})();
			const toggleGroup = (name) => {
				const next = collapsed.includes(name) ? collapsed.filter((item) => item !== name) : [...collapsed, name];
				setCollapsed(next);
				writeStored(COLLAPSED_KEY, JSON.stringify(next));
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "gt-root",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gt-header",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "gt-java",
								title: t("toolbar.javaHint"),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-java-label",
									children: t("toolbar.java")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									className: "gt-select",
									value: javaHome ?? "",
									onChange: (event) => {
										chooseJava(event.target.value);
									},
									children: [location !== null && location.jdks.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: "",
										children: t("toolbar.javaMissing")
									}) : null, location?.jdks.map((candidate) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
										value: candidate.home,
										title: candidate.home,
										children: [candidate.variable, candidate.version === null ? "" : ` (${candidate.version})`]
									}, candidate.home))]
								})]
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
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: statusLine }),
							location?.project == null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "gt-hint-detail",
								children: location.project.wrapper === null ? t("status.noWrapper") : t("status.wrapper", { version: location.project.wrapperDistribution ?? location.project.wrapper })
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
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "gt-filter",
							value: filter,
							placeholder: t("tasks.filter"),
							onChange: (event) => {
								setFilter(event.target.value);
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "gt-count",
							children: total
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "gt-scroll",
						children: visible.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gt-empty",
							children: groups.length > 0 ? t("tasks.empty") : t("tasks.runHint")
						}) : visible.map((group) => {
							const name = group.group === "" ? t("tasks.ungrouped") : group.group;
							const open = !collapsed.includes(group.group);
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								className: "gt-group-head",
								type: "button",
								"aria-expanded": open,
								onClick: () => {
									toggleGroup(group.group);
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: open ? "gt-caret gt-open" : "gt-caret",
										children: "▶"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gt-group-name",
										children: name
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "gt-count",
										children: group.tasks.length
									})
								]
							}), open ? group.tasks.map((task) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								className: selected === task.path ? "gt-task gt-selected" : "gt-task",
								type: "button",
								title: task.path,
								disabled: launching !== null,
								onClick: () => {
									setSelected(task.path);
								},
								onDoubleClick: () => {
									runTask(task);
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "gt-task-name",
									children: launching === task.path ? t("run.starting") : taskLabel(task)
								}), task.description === "" ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "gt-task-desc",
									children: task.description
								})]
							}, task.path)) : null] }, group.group);
						})
					})
				]
			});
		}
		// src/client/styles.ts
		/**
		* Panel styles for the right Sidebar's narrow column.
		*
		* Every token read carries the Host name first and a neutral fallback second,
		* so the panel keeps its layout and stays legible even before a theme defines
		* the aliases.
		*/
		/** The stylesheet this plugin installs for the lifetime of its Client run. */
		const STYLES = `
.gt-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--dsw-alias-bg-base, #ffffff);
  color: var(--dsw-alias-label-primary, #1f2328);
  font-size: 13px;
  line-height: 1.5;
}
.gt-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px 6px;
}
.gt-java {
  display: inline-flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 3px 8px;
  border: 1px solid var(--dsw-alias-border-l2, #d0d7de);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.gt-java-label {
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 12px;
}
.gt-select {
  flex: 1 1 auto;
  min-width: 0;
  padding: 2px 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.gt-select:focus {
  outline: none;
}
.gt-icon-button {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid var(--dsw-alias-border-l2, #d0d7de);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: var(--dsw-alias-label-secondary, #6b7280);
  cursor: pointer;
}
.gt-icon-button:hover:not(:disabled) {
  background: var(--dsw-alias-bg-layer-2, #f3f4f6);
  color: var(--dsw-alias-label-primary, #1f2328);
}
.gt-icon-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.gt-icon-button.gt-icon-button-on {
  border-color: var(--dsw-alias-brand-primary, #2563eb);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #2563eb) 16%, transparent);
  color: var(--dsw-alias-brand-primary, #2563eb);
}
.gt-hint {
  padding: 0 10px 8px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 11.5px;
  word-break: break-word;
}
.gt-hint-detail {
  opacity: 0.8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
}
.gt-hint-launch {
  margin-top: 4px;
  color: var(--dsw-alias-state-success-primary, #15803d);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gt-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-top: 1px solid var(--dsw-alias-border-l1, #e5e7eb);
}
.gt-filter {
  flex: 1 1 auto;
  min-width: 0;
  padding: 4px 8px;
  border: 1px solid var(--dsw-alias-border-l2, #d0d7de);
  border-radius: 6px;
  background: var(--dsw-alias-bg-base, #ffffff);
  color: inherit;
  font: inherit;
  font-size: 12px;
}
.gt-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding: 2px 6px 12px;
}
.gt-group-head {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 4px 6px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}
.gt-group-head:hover {
  background: var(--dsw-alias-bg-layer-2, #f3f4f6);
}
.gt-group-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gt-caret {
  display: inline-block;
  width: 10px;
  transition: transform 0.12s ease;
}
.gt-caret.gt-open {
  transform: rotate(90deg);
}
.gt-count {
  margin-left: auto;
  font-weight: 400;
  opacity: 0.75;
}
.gt-task {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 4px 8px 4px 22px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.gt-task:hover:not(:disabled) {
  background: var(--dsw-alias-bg-layer-2, #f3f4f6);
}
.gt-task:disabled {
  cursor: progress;
  opacity: 0.6;
}
.gt-task.gt-selected {
  background: var(--dsw-alias-bg-layer-2, #eef2ff);
  box-shadow: inset 2px 0 0 var(--dsw-alias-brand-primary, #2563eb);
}
.gt-task-name {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  word-break: break-word;
}
.gt-task-desc {
  overflow: hidden;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 11.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gt-empty {
  padding: 20px 12px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 12px;
  text-align: center;
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