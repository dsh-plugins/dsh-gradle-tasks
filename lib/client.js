window.__ModuleLoader__.load({
	id: "dsh-gradle-tasks",
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
		* The panel's glyph: a task list with a run mark.
		*
		* Drawn with `currentColor` so the sidebar decides the tone for the active and
		* inactive states, exactly like the shipped panel icons.
		*/
		/**
		* Render the Gradle Tasks panel icon.
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
		// src/client/locales.ts
		/** Copy namespace registered with the locale service. */
		const NAMESPACE = "gradleTasks";
		/** Every language this plugin ships, keyed the way the locale service expects. */
		const DICTIONARIES = {
			zh: {
				"panel.title": "Gradle 任务",
				"panel.description": "浏览并运行当前项目的 Gradle 任务",
				"toolbar.reloadTasks": "重新扫描任务",
				"toolbar.pickDirectory": "选择目录",
				"toolbar.java": "Java",
				"toolbar.javaMissing": "未发现 JDK",
				"toolbar.javaHint": "运行 Gradle 时使用的 JDK",
				"path.placeholder": "项目目录",
				"status.noProject": "尚未选择目录",
				"status.scanning": "正在扫描任务…",
				"status.scanned": "共 {count} 个任务，{groups} 个分组，耗时 {duration}",
				"status.wrapper": "Wrapper {version}",
				"status.noWrapper": "无 wrapper，使用 PATH 中的 gradle",
				"status.cachedAt": "来自缓存 · 扫描于 {time} · 构建脚本未变化",
				"tasks.filter": "过滤任务",
				"tasks.empty": "没有匹配的任务",
				"tasks.ungrouped": "未分组",
				"tasks.runHint": "双击任务运行",
				"run.idle": "尚未运行任务",
				"run.running": "运行中",
				"run.succeeded": "成功",
				"run.failed": "失败（退出码 {code}）",
				"run.stopped": "已终止",
				"run.stop": "停止",
				"run.clear": "清空",
				"fail.no-session": "当前没有可用的会话目录，请手动选择项目目录",
				"fail.session-inactive": "当前会话尚未激活，请手动选择项目目录",
				"fail.directory-missing": "目录不存在：{detail}",
				"fail.directory-relative": "需要绝对路径：{detail}",
				"fail.not-gradle": "当前目录不是 Gradle 项目：{detail}",
				"fail.wrapper-mismatch": "项目 wrapper 与当前平台不匹配：{detail}",
				"fail.gradle-missing": "项目没有 wrapper，PATH 中也找不到 gradle：{detail}",
				"fail.scan-failed": "Gradle 执行失败（退出码 {detail}）",
				"fail.scan-timeout": "扫描超时，已终止 Gradle：\n{detail}",
				"fail.no-report": "Gradle 未产出任务清单",
				"fail.java-invalid": "不是可用的 JDK 目录：{detail}",
				"fail.task-missing": "任务不存在：{detail}",
				"fail.field-missing": "缺少字段：{detail}",
				"fail.body-invalid": "请求体不合法",
				"fail.body-too-large": "请求体过大",
				"fail.run-not-found": "找不到该运行记录",
				"fail.transport": "无法连接本地服务：{detail}"
			},
			en: {
				"panel.title": "Gradle Tasks",
				"panel.description": "Browse and run the current project’s Gradle tasks",
				"toolbar.reloadTasks": "Rescan tasks",
				"toolbar.pickDirectory": "Choose directory",
				"toolbar.java": "Java",
				"toolbar.javaMissing": "No JDK found",
				"toolbar.javaHint": "JDK used to run Gradle",
				"path.placeholder": "Project directory",
				"status.noProject": "No directory selected yet",
				"status.scanning": "Scanning tasks…",
				"status.scanned": "{count} tasks in {groups} groups, took {duration}",
				"status.wrapper": "Wrapper {version}",
				"status.noWrapper": "No wrapper, using gradle from PATH",
				"status.cachedAt": "From cache · scanned {time} · build scripts unchanged",
				"tasks.filter": "Filter tasks",
				"tasks.empty": "No matching task",
				"tasks.ungrouped": "Ungrouped",
				"tasks.runHint": "Double-click a task to run it",
				"run.idle": "No task has run yet",
				"run.running": "Running",
				"run.succeeded": "Succeeded",
				"run.failed": "Failed (exit code {code})",
				"run.stopped": "Stopped",
				"run.stop": "Stop",
				"run.clear": "Clear",
				"fail.no-session": "No Session directory is available; choose a project directory instead",
				"fail.session-inactive": "This Session is not active yet; choose a project directory instead",
				"fail.directory-missing": "Directory not found: {detail}",
				"fail.directory-relative": "An absolute path is required: {detail}",
				"fail.not-gradle": "Not a Gradle project: {detail}",
				"fail.wrapper-mismatch": "The project wrapper does not match this platform: {detail}",
				"fail.gradle-missing": "The project ships no wrapper and PATH has no gradle: {detail}",
				"fail.scan-failed": "Gradle failed (exit code {detail})",
				"fail.scan-timeout": "The scan timed out and Gradle was terminated:\n{detail}",
				"fail.no-report": "Gradle produced no task report",
				"fail.java-invalid": "Not a usable JDK directory: {detail}",
				"fail.task-missing": "No such task: {detail}",
				"fail.field-missing": "Missing field: {detail}",
				"fail.body-invalid": "The request body is not valid JSON",
				"fail.body-too-large": "The request body is too large",
				"fail.run-not-found": "No such run is retained",
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
			"field-missing": "fail.field-missing",
			"body-invalid": "fail.body-invalid",
			"body-too-large": "fail.body-too-large",
			"run-not-found": "fail.run-not-found",
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
		/** Append the locator to a route URL. */
		function locate(route, locator, extra) {
			const query = new URLSearchParams();
			if (locator.sessionId !== void 0 && locator.sessionId !== "") query.set("sessionId", locator.sessionId);
			if (locator.path !== void 0 && locator.path !== "") query.set("path", locator.path);
			for (const [key, value] of Object.entries(extra ?? {})) query.set(key, value);
			const suffix = query.toString();
			return suffix === "" ? `${ROUTE_BASE}${route}` : `${ROUTE_BASE}${route}?${suffix}`;
		}
		/** Detect the project and enumerate JDKs. */
		function fetchState(locator) {
			return readJson(locate("/state", locator));
		}
		/**
		* Run Gradle's task report for the located project.
		* @param locator - Session or directory to inspect.
		* @param javaHome - JDK to configure the build with.
		* @param force - ignore the project's cache and configure the build again.
		*/
		function fetchTasks(locator, javaHome, force) {
			const extra = {};
			if (javaHome !== null) extra.javaHome = javaHome;
			if (force) extra.force = "1";
			return readJson(locate("/tasks", locator, extra));
		}
		/** Start one task run. */
		function startTaskRun(locator, taskPath, javaHome) {
			return readJson(`${ROUTE_BASE}/run`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					taskPath,
					javaHome: javaHome ?? void 0,
					sessionId: locator.sessionId,
					path: locator.path
				})
			});
		}
		/** Ask the Host to terminate a run. */
		async function stopTaskRun(runId) {
			return (await readJson(`${ROUTE_BASE}/run/stop`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ runId })
			})).ok;
		}
		/**
		* Stream one run's events until the Host closes the stream.
		* @param runId - run to follow.
		* @param onEvent - receives each decoded event.
		* @param onError - receives a transport failure after the stream began.
		* @returns an abort function that detaches without stopping the build.
		*/
		function streamTaskRun(runId, onEvent, onError) {
			const abort = new AbortController();
			(async () => {
				try {
					const response = await fetch(`${ROUTE_BASE}/run/stream?id=${encodeURIComponent(runId)}`, {
						signal: abort.signal,
						headers: { accept: "application/x-ndjson" }
					});
					if (!response.ok || response.body === null) throw new TransportFailure(`/run/stream → HTTP ${response.status}`);
					const reader = response.body.getReader();
					const decoder = new TextDecoder();
					let buffer = "";
					for (;;) {
						const { done, value } = await reader.read();
						if (done) break;
						buffer += decoder.decode(value, { stream: true });
						let newline = buffer.indexOf("\n");
						while (newline >= 0) {
							const line = buffer.slice(0, newline);
							buffer = buffer.slice(newline + 1);
							if (line !== "") onEvent(JSON.parse(line));
							newline = buffer.indexOf("\n");
						}
					}
					if (buffer.trim() !== "") onEvent(JSON.parse(buffer));
				} catch (error) {
					if (abort.signal.aborted) return;
					onError(error instanceof Error ? error : new TransportFailure(String(error)));
				}
			})();
			return () => {
				abort.abort();
			};
		}
		// src/client/panel.tsx
		/**
		* The Gradle Tasks page: the project header with the JDK selector, the task
		* folders, and the build terminal, stacked for the right Sidebar's narrow
		* column.
		*
		* The panel owns no Gradle knowledge of its own — it asks the Host what the
		* project is and which tasks it declares, and streams one run at a time.
		*/
		/** Browser storage keys this panel owns. */
		const PATH_KEY = "dsh.gradle-tasks.path";
		const JAVA_KEY = "dsh.gradle-tasks.javaHome";
		const COLLAPSED_KEY = "dsh.gradle-tasks.collapsed";
		/** Longest transcript the panel keeps in memory, in characters. */
		const MAX_OUTPUT_CHARS = 3e5;
		/** How often buffered build output is committed to React state, in milliseconds. */
		const OUTPUT_FLUSH_MS = 90;
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
		/** Read a JSON string array from storage, tolerating absent or broken values. */
		function readStoredList(key) {
			try {
				const raw = globalThis.localStorage?.getItem(key);
				if (raw === null || raw === void 0) return [];
				const parsed = JSON.parse(raw);
				return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
			} catch (error) {
				console.warn(`gradle-tasks: ignoring unreadable ${key}`, error);
				return [];
			}
		}
		/** Read one stored string, tolerating absent or broken values. */
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
			const { sessionId, translator, pickDirectory } = props;
			const t = useCopy(translator);
			const [location, setLocation] = react.useState(null);
			const [groups, setGroups] = react.useState([]);
			const [scanMs, setScanMs] = react.useState(0);
			const [cacheHit, setCacheHit] = react.useState(null);
			const [override, setOverride] = react.useState(() => readStored(PATH_KEY));
			const [draft, setDraft] = react.useState("");
			const [javaHome, setJavaHome] = react.useState(() => readStored(JAVA_KEY));
			const [busy, setBusy] = react.useState(false);
			const [problem, setProblem] = react.useState(null);
			const [filter, setFilter] = react.useState("");
			const [selected, setSelected] = react.useState(null);
			const [collapsed, setCollapsed] = react.useState(() => readStoredList(COLLAPSED_KEY));
			const [run, setRun] = react.useState(null);
			const [output, setOutput] = react.useState("");
			const buffer = react.useRef("");
			const flushTimer = react.useRef(void 0);
			const detach = react.useRef(void 0);
			const runId = react.useRef(null);
			const stopping = react.useRef(false);
			const request = react.useRef(0);
			const terminal = react.useRef(null);
			/** Commit buffered build output to state, keeping the tail only. */
			const flushOutput = react.useCallback(() => {
				flushTimer.current = void 0;
				const text = buffer.current;
				buffer.current = "";
				if (text === "") return;
				setOutput((previous) => {
					const next = previous + text;
					return next.length > MAX_OUTPUT_CHARS ? next.slice(next.length - MAX_OUTPUT_CHARS) : next;
				});
			}, []);
			/** Queue build output for the next commit. */
			const appendOutput = react.useCallback((text) => {
				buffer.current += text;
				flushTimer.current ??= setTimeout(flushOutput, OUTPUT_FLUSH_MS);
			}, [flushOutput]);
			/** Drop every pending timer and stream attachment. */
			const stopStreaming = react.useCallback(() => {
				detach.current?.();
				detach.current = void 0;
				if (flushTimer.current !== void 0) {
					clearTimeout(flushTimer.current);
					flushTimer.current = void 0;
				}
				buffer.current = "";
			}, []);
			react.useEffect(() => () => {
				stopStreaming();
			}, [stopStreaming]);
			react.useEffect(() => {
				const node = terminal.current;
				if (node === null) return;
				node.scrollTop = node.scrollHeight;
			}, [output]);
			/**
			* Read the task report for one location, with a chosen JDK.
			*
			* A scan can take minutes, so the answer is applied only while its ticket is
			* still the newest: a person who switches directory or JDK mid-scan sees the
			* report for the choice they ended on, never an earlier one arriving late.
			* @param path - directory override, or null for the Session's own.
			* @param jdk - JDK to run the report with.
			* @param force - configure the build again instead of reusing the cache.
			* @param ticket - request identity taken before the call.
			*/
			const scan = react.useCallback(async (path, jdk, force, ticket) => {
				const listing = await fetchTasks({
					sessionId,
					path: path ?? void 0
				}, jdk, force);
				if (ticket !== request.current) return;
				if (!listing.ok) {
					setGroups([]);
					setCacheHit(null);
					setProblem({
						code: listing.error,
						detail: listing.detail
					});
					if (listing.output !== void 0) {
						buffer.current = listing.output;
						flushOutput();
					}
					return;
				}
				setProblem(null);
				setGroups(listing.groups);
				setScanMs(listing.durationMs);
				setCacheHit(listing.cached ? listing.scannedAt : null);
			}, [sessionId, flushOutput]);
			/**
			* Ask the Host what this location is, then which tasks it declares.
			* @param nextOverride - directory override, or null for the Session's own.
			* @param force - configure the build again instead of reusing the cache.
			*/
			const load = react.useCallback(async (nextOverride, force) => {
				const ticket = request.current + 1;
				request.current = ticket;
				setBusy(true);
				setProblem(null);
				try {
					const state = await fetchState({
						sessionId,
						path: nextOverride ?? void 0
					});
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
					setLocation(state);
					setDraft(state.path);
					const chosen = resolveJavaHome(javaHome, state.jdks);
					if (chosen !== javaHome) {
						setJavaHome(chosen);
						writeStored(JAVA_KEY, chosen);
					}
					if (state.project === null) {
						setGroups([]);
						setCacheHit(null);
						setProblem({
							code: "not-gradle",
							detail: state.path
						});
						return;
					}
					await scan(nextOverride, chosen, force, ticket);
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
				load(readStored(PATH_KEY), false);
			}, [load]);
			/** Apply an explicit directory and remember it. */
			const applyPath = react.useCallback((value) => {
				const trimmed = value.trim();
				const next = trimmed === "" ? null : trimmed;
				setOverride(next);
				writeStored(PATH_KEY, next);
				load(next, true);
			}, [load]);
			/** Choose a directory with the Host picker. */
			const chooseDirectory = react.useCallback(async () => {
				if (pickDirectory === void 0) return;
				try {
					const picked = await pickDirectory();
					if (picked !== null && picked !== "") applyPath(picked);
				} catch (error) {
					setProblem(failureFrom(error));
				}
			}, [pickDirectory, applyPath]);
			/** Change the JDK and rescan, because the task report comes from a Gradle run. */
			const chooseJava = react.useCallback((value) => {
				const next = value === "" ? null : value;
				setJavaHome(next);
				writeStored(JAVA_KEY, next);
				if (location?.project === null || location?.project === void 0) return;
				const ticket = request.current + 1;
				request.current = ticket;
				setBusy(true);
				scan(override, next, true, ticket).catch((error) => {
					if (ticket !== request.current) return;
					setProblem(failureFrom(error));
					setGroups([]);
				}).finally(() => {
					if (ticket === request.current) setBusy(false);
				});
			}, [
				location,
				override,
				scan
			]);
			/** Run one task in the panel's terminal. */
			const runTask = react.useCallback(async (task) => {
				if (run?.phase === "running") return;
				stopStreaming();
				stopping.current = false;
				runId.current = null;
				setOutput("");
				setRun({
					taskPath: task.path,
					command: "",
					phase: "running",
					code: null,
					durationMs: 0
				});
				try {
					const started = await startTaskRun({
						sessionId,
						path: override ?? void 0
					}, task.path, javaHome);
					if (!started.ok) {
						setRun({
							taskPath: task.path,
							command: "",
							phase: "failed",
							code: null,
							durationMs: 0
						});
						setOutput(describeFailure({
							code: started.error,
							detail: started.detail
						}, t));
						return;
					}
					runId.current = started.runId;
					setRun((current) => current === null ? current : {
						...current,
						command: started.command
					});
					const onEvent = (event) => {
						if (event.type === "chunk") {
							appendOutput(event.text);
							return;
						}
						if (event.type === "error") {
							appendOutput(`\n${event.message}\n`);
							return;
						}
						flushOutput();
						runId.current = null;
						setRun((current) => current === null ? current : {
							...current,
							phase: stopping.current ? "stopped" : event.code === 0 ? "succeeded" : "failed",
							code: event.code,
							durationMs: event.durationMs
						});
						stopping.current = false;
					};
					const onError = (error) => {
						appendOutput(`\n${describeFailure(failureFrom(error), t)}\n`);
					};
					detach.current = streamTaskRun(started.runId, onEvent, onError);
				} catch (error) {
					setRun({
						taskPath: task.path,
						command: "",
						phase: "failed",
						code: null,
						durationMs: 0
					});
					setOutput(describeFailure(failureFrom(error), t));
				}
			}, [
				run,
				stopStreaming,
				sessionId,
				override,
				javaHome,
				t,
				appendOutput,
				flushOutput
			]);
			/** Terminate the running build; its exit event then settles the badge as stopped. */
			const stopRun = react.useCallback(async () => {
				const id = runId.current;
				if (id === null) return;
				stopping.current = true;
				try {
					await stopTaskRun(id);
				} catch (error) {
					stopping.current = false;
					appendOutput(`\n${describeFailure(failureFrom(error), t)}\n`);
				}
			}, [appendOutput, t]);
			const visible = filterGroups(groups, filter);
			const total = groups.reduce((sum, group) => sum + group.tasks.length, 0);
			const statusLine = (() => {
				if (busy) return t("status.scanning");
				if (problem !== null) return describeFailure(problem, t);
				if (location === null) return t("status.noProject");
				if (cacheHit !== null) return t("status.cachedAt", { time: formatTimestamp(cacheHit) });
				return t("status.scanned", {
					count: total,
					groups: groups.length,
					duration: formatDuration(scanMs)
				});
			})();
			const badge = (() => {
				if (run === null) return {
					className: "gt-badge",
					text: t("run.idle")
				};
				if (run.phase === "running") return {
					className: "gt-badge gt-busy",
					text: t("run.running")
				};
				if (run.phase === "succeeded") return {
					className: "gt-badge gt-ok",
					text: `${t("run.succeeded")} · ${formatDuration(run.durationMs)}`
				};
				if (run.phase === "stopped") return {
					className: "gt-badge",
					text: t("run.stopped")
				};
				return {
					className: "gt-badge gt-bad",
					text: t("run.failed", { code: run.code ?? "—" })
				};
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
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: "gt-path",
							value: draft,
							spellCheck: false,
							placeholder: t("path.placeholder"),
							onChange: (event) => {
								setDraft(event.target.value);
							},
							onKeyDown: (event) => {
								if (event.key !== "Enter") return;
								applyPath(event.currentTarget.value);
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gt-actions",
							children: [
								pickDirectory === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "gt-button",
									type: "button",
									onClick: () => {
										chooseDirectory();
									},
									disabled: busy,
									children: t("toolbar.pickDirectory")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "gt-button gt-primary",
									type: "button",
									onClick: () => {
										applyPath(draft);
									},
									disabled: busy,
									children: busy ? t("status.scanning") : t("toolbar.reloadTasks")
								}),
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
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gt-hint",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: statusLine }), location?.project == null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "gt-hint-detail",
							children: location.project.wrapper === null ? t("status.noWrapper") : t("status.wrapper", { version: location.project.wrapperDistribution ?? location.project.wrapper })
						})]
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
								onClick: () => {
									setSelected(task.path);
								},
								onDoubleClick: () => {
									runTask(task);
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "gt-task-name",
									children: taskLabel(task)
								}), task.description === "" ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "gt-task-desc",
									children: task.description
								})]
							}, task.path)) : null] }, group.group);
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "gt-terminal",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "gt-term-head",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: badge.className,
									children: badge.text
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "gt-command",
									title: run?.command ?? "",
									children: run === null ? t("tasks.runHint") : run.taskPath
								}),
								run?.phase === "running" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "gt-button",
									type: "button",
									onClick: () => {
										stopRun();
									},
									children: t("run.stop")
								}) : null,
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "gt-button",
									type: "button",
									onClick: () => {
										buffer.current = "";
										setOutput("");
									},
									disabled: output === "",
									children: t("run.clear")
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
							className: "gt-term-body",
							ref: terminal,
							children: output === "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "gt-term-muted",
								children: run === null ? t("run.idle") : ""
							}) : output
						})]
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
		* the aliases. The output area is deliberately dark in both themes: build logs
		* are terminal output and read better on a terminal ground.
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
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px 8px;
}
.gt-path {
  width: 100%;
  box-sizing: border-box;
  padding: 5px 9px;
  border: 1px solid var(--dsw-alias-border-l2, #d0d7de);
  border-radius: 6px;
  background: var(--dsw-alias-bg-base, #ffffff);
  color: inherit;
  font: inherit;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
}
.gt-path:focus {
  outline: 2px solid var(--dsw-alias-brand-primary, #2563eb);
  outline-offset: -1px;
}
.gt-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.gt-button {
  padding: 4px 10px;
  border: 1px solid var(--dsw-alias-border-l2, #d0d7de);
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  color: inherit;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.gt-button:hover:not(:disabled) {
  background: var(--dsw-alias-bg-layer-2, #f3f4f6);
}
.gt-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.gt-button.gt-primary {
  border-color: var(--dsw-alias-brand-primary, #2563eb);
  color: var(--dsw-alias-brand-primary, #2563eb);
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
.gt-hint {
  padding: 0 12px 8px;
  color: var(--dsw-alias-label-secondary, #6b7280);
  font-size: 11.5px;
  word-break: break-word;
}
.gt-hint-detail {
  opacity: 0.8;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
}
.gt-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
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
  min-height: 90px;
  overflow: auto;
  padding: 2px 8px 10px;
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
.gt-task:hover {
  background: var(--dsw-alias-bg-layer-2, #f3f4f6);
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
.gt-terminal {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  height: 42%;
  min-height: 150px;
  border-top: 1px solid var(--dsw-alias-border-l1, #e5e7eb);
  background: #0b1020;
}
.gt-term-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-bottom: 1px solid #1f2937;
}
.gt-badge {
  padding: 1px 8px;
  border: 1px solid #4b5563;
  border-radius: 999px;
  color: #d1d5db;
  font-size: 11px;
  white-space: nowrap;
}
.gt-badge.gt-ok {
  border-color: #15803d;
  color: #4ade80;
}
.gt-badge.gt-bad {
  border-color: #b91c1c;
  color: #f87171;
}
.gt-badge.gt-busy {
  border-color: #2563eb;
  color: #93c5fd;
}
.gt-command {
  overflow: hidden;
  flex: 1 1 120px;
  min-width: 0;
  color: #9ca3af;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gt-terminal .gt-button {
  border-color: #374151;
  background: transparent;
  color: #d1d5db;
  font-size: 11.5px;
}
.gt-terminal .gt-button:hover:not(:disabled) {
  background: #1f2937;
}
.gt-term-body {
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  overflow: auto;
  padding: 8px 10px 12px;
  color: #e5e7eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}
.gt-term-muted {
  color: #9ca3af;
}
`;
		// src/client/index.tsx
		const name = "dsh-gradle-tasks";
		/** Browser services this plugin needs: the slot registry and the tab-type registry. */
		const inject = ["slots", "sidebarRightTabs"];
		/** Identity of this tab type in the Sidebar's registry, and the key its body registers under. */
		const TAB_ID = "dsh-gradle-tasks";
		/** The tab kind callers name when opening the page. */
		const TAB_KIND = "gradle-tasks";
		/** The guide card that opens this page. */
		const GUIDE_ENTRY_ID = "gradle-tasks";
		/**
		* Mount the page: its tab type, its body, and its copy.
		* @param ctx - browser Context with the slot and tab-type registries.
		*/
		function apply(ctx) {
			ctx.effect(() => installStyles(), "gradle-tasks: styles");
			registerDictionaries(ctx);
			const translator = createTranslator(ctx);
			const workspace = ctx.get("uiWorkspace");
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
					...workspace === void 0 ? {} : { pickDirectory: () => workspace.pickDirectory() }
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