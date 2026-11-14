/**
 * This plugin's copy, in both languages the Host ships.
 *
 * Dictionaries are published through the Host locale service when it is
 * mounted, and read directly otherwise, so the panel is never blank because a
 * neighbouring plugin is absent.
 */

import type { FailureCode } from '../shared/protocol.ts'

/** Copy namespace registered with the locale service. */
export const NAMESPACE = 'gradleTasks'

const zh = {
  'panel.title': 'Gradle 任务',
  'panel.description': '浏览并运行工作区各 Gradle 项目的任务',
  'toolbar.java': 'Java',
  'toolbar.javaMissing': '未发现 JDK',
  'toolbar.javaHint': '选择运行 Gradle 的 JDK',
  'toolbar.rescan': '重新扫描任务',
  'toolbar.offlineOn': '离线模式已开启，点击关闭（运行时不访问网络）',
  'toolbar.offlineOff': '离线模式已关闭，点击开启（运行时加 --offline）',
  'status.noSession': '正在读取当前会话目录…',
  'status.scanningWorkspace': '正在查找 Gradle 项目…',
  'status.projects': '{projects} 个项目 · 已扫描 {scanned} · 共 {tasks} 个任务',
  'status.noProjects': '当前工作区未发现 Gradle 项目：{path}',
  'status.truncated': '项目数量已达上限，扫描未覆盖全部目录',
  'status.wrapper': 'Wrapper {version}',
  'status.noWrapper': '无 wrapper，使用 PATH 中的 gradle',
  'status.cachedAt': '来自缓存 · 扫描于 {time} · 构建脚本未变化',
  'status.scannedAt': '扫描于 {time}，耗时 {duration}',
  'status.failedAt': '扫描失败',
  'tasks.filter': '过滤任务',
  'tasks.empty': '没有匹配的任务',
  'tasks.noProjects': '当前工作区未发现 Gradle 项目',
  'tasks.ungrouped': '未分组',
  'tasks.expandHint': '展开项目以扫描任务（只有展开的项目才会执行 Gradle）',
  'tasks.loadHint': '展开后扫描任务',
  'tasks.runHint': '双击任务，在终端里运行',
  'project.scanning': '扫描中',
  'project.failed': '扫描失败',
  'project.failureHint': '点击查看构建日志',
  'project.subprojects': '子项目',
  'project.aggregate': '全部任务（gradle build 会跑遍全部子项目）',
  'project.rescan': '重新扫描该项目',
  'project.modules': '{count} 个模块',
  'project.tasks': '{count} 个任务',
  'project.expand': '展开项目',
  'project.collapse': '收起项目',
  'run.starting': '正在启动终端…',
  'run.launched': '已在「{terminal}」运行 {task}',
  'fail.no-session': '缺少会话标识',
  'fail.session-inactive': '当前会话尚未激活，请先打开一次对话',
  'fail.directory-missing': '目录不存在：{detail}',
  'fail.directory-relative': '需要绝对路径：{detail}',
  'fail.not-gradle': '当前工作区不是 Gradle 项目：{detail}',
  'fail.project-not-found': '未找到该 Gradle 项目（可能需要指定项目）：{detail}',
  'fail.wrapper-mismatch': '项目 wrapper 与当前平台不匹配：{detail}',
  'fail.gradle-missing': '项目没有 wrapper，PATH 中也找不到 gradle：{detail}',
  'fail.scan-failed': 'Gradle 执行失败（退出码 {detail}）',
  'fail.scan-timeout': '扫描超时，已终止 Gradle：\n{detail}',
  'fail.no-report': 'Gradle 未产出任务清单',
  'fail.java-invalid': '不是可用的 JDK 目录：{detail}',
  'fail.task-missing': '任务不存在或不是合法任务路径：{detail}',
  'fail.terminal-failed': '无法打开终端：{detail}',
  'fail.field-missing': '缺少字段：{detail}',
  'fail.body-invalid': '请求体不合法',
  'fail.body-too-large': '请求体过大',
  'fail.transport': '无法连接本地服务：{detail}',
}

const en: Record<keyof typeof zh, string> = {
  'panel.title': 'Gradle Tasks',
  'panel.description': 'Browse and run the Gradle tasks of every project in the workspace',
  'toolbar.java': 'Java',
  'toolbar.javaMissing': 'No JDK found',
  'toolbar.javaHint': 'Choose the JDK used to run Gradle',
  'toolbar.rescan': 'Rescan tasks',
  'toolbar.offlineOn': 'Offline mode is on; click to turn it off (no network during runs)',
  'toolbar.offlineOff': 'Offline mode is off; click to turn it on (runs pass --offline)',
  'status.noSession': 'Reading this Session’s directory…',
  'status.scanningWorkspace': 'Looking for Gradle projects…',
  'status.projects': '{projects} projects · {scanned} scanned · {tasks} tasks',
  'status.noProjects': 'No Gradle project in this workspace: {path}',
  'status.truncated': 'The project limit was reached; not every directory was searched',
  'status.wrapper': 'Wrapper {version}',
  'status.noWrapper': 'No wrapper, using gradle from PATH',
  'status.cachedAt': 'From cache · scanned {time} · build scripts unchanged',
  'status.scannedAt': 'Scanned {time} in {duration}',
  'status.failedAt': 'Scan failed',
  'tasks.filter': 'Filter tasks',
  'tasks.empty': 'No matching task',
  'tasks.noProjects': 'No Gradle project in this workspace',
  'tasks.ungrouped': 'Ungrouped',
  'tasks.expandHint': 'Open a project to scan its tasks; only opened projects run Gradle',
  'tasks.loadHint': 'Open this project to scan its tasks',
  'tasks.runHint': 'Double-click a task to run it in a terminal',
  'project.scanning': 'Scanning',
  'project.failed': 'Scan failed',
  'project.failureHint': 'Click to show the build log',
  'project.subprojects': 'Subprojects',
  'project.aggregate': 'Every task of the build (gradle build reaches all subprojects)',
  'project.rescan': 'Rescan this project',
  'project.modules': '{count} modules',
  'project.tasks': '{count} tasks',
  'project.expand': 'Expand project',
  'project.collapse': 'Collapse project',
  'run.starting': 'Starting the terminal…',
  'run.launched': '{task} is running in “{terminal}”',
  'fail.no-session': 'The request named no Session',
  'fail.session-inactive': 'This Session is not active yet; open the conversation once first',
  'fail.directory-missing': 'Directory not found: {detail}',
  'fail.directory-relative': 'An absolute path is required: {detail}',
  'fail.not-gradle': 'Not a Gradle workspace: {detail}',
  'fail.project-not-found': 'No such Gradle project here, or the request named none: {detail}',
  'fail.wrapper-mismatch': 'The project wrapper does not match this platform: {detail}',
  'fail.gradle-missing': 'The project ships no wrapper and PATH has no gradle: {detail}',
  'fail.scan-failed': 'Gradle failed (exit code {detail})',
  'fail.scan-timeout': 'The scan timed out and Gradle was terminated:\n{detail}',
  'fail.no-report': 'Gradle produced no task report',
  'fail.java-invalid': 'Not a usable JDK directory: {detail}',
  'fail.task-missing': 'No such task, or not a valid task path: {detail}',
  'fail.terminal-failed': 'Cannot open a terminal: {detail}',
  'fail.field-missing': 'Missing field: {detail}',
  'fail.body-invalid': 'The request body is not valid JSON',
  'fail.body-too-large': 'The request body is too large',
  'fail.transport': 'Cannot reach the local service: {detail}',
}

/** Every language this plugin ships, keyed the way the locale service expects. */
export const DICTIONARIES: Record<string, Record<string, string>> = { zh, en }

/** One copy key. */
export type CopyKey = keyof typeof zh

/**
 * Copy key for each failure code the Host can report.
 *
 * Spelled out rather than built as `` `fail.${code}` `` so a code added to the
 * protocol without copy is a type error instead of a panel showing a raw key.
 */
export const FAILURE_COPY: Record<FailureCode, CopyKey> = {
  'no-session': 'fail.no-session',
  'session-inactive': 'fail.session-inactive',
  'directory-missing': 'fail.directory-missing',
  'directory-relative': 'fail.directory-relative',
  'not-gradle': 'fail.not-gradle',
  'project-not-found': 'fail.project-not-found',
  'wrapper-mismatch': 'fail.wrapper-mismatch',
  'gradle-missing': 'fail.gradle-missing',
  'scan-failed': 'fail.scan-failed',
  'scan-timeout': 'fail.scan-timeout',
  'no-report': 'fail.no-report',
  'java-invalid': 'fail.java-invalid',
  'task-missing': 'fail.task-missing',
  'terminal-failed': 'fail.terminal-failed',
  'field-missing': 'fail.field-missing',
  'body-invalid': 'fail.body-invalid',
  'body-too-large': 'fail.body-too-large',
  transport: 'fail.transport',
}

/** Substitute `{name}` placeholders in one template. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = values[name]
    return value === undefined ? whole : String(value)
  })
}
