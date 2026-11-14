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
  'panel.description': '浏览并运行当前会话项目的 Gradle 任务',
  'toolbar.java': 'Java',
  'toolbar.javaMissing': '未发现 JDK',
  'toolbar.javaHint': '运行 Gradle 时使用的 JDK',
  'toolbar.rescan': '重新扫描任务',
  'toolbar.offlineOn': '离线模式已开启，点击关闭（运行时不访问网络）',
  'toolbar.offlineOff': '离线模式已关闭，点击开启（运行时加 --offline）',
  'status.noSession': '正在读取当前会话目录…',
  'status.scanning': '正在扫描任务…',
  'status.scanned': '共 {count} 个任务，{groups} 个分组，耗时 {duration}',
  'status.wrapper': 'Wrapper {version}',
  'status.noWrapper': '无 wrapper，使用 PATH 中的 gradle',
  'status.cachedAt': '来自缓存 · 扫描于 {time} · 构建脚本未变化',
  'tasks.filter': '过滤任务',
  'tasks.empty': '没有匹配的任务',
  'tasks.ungrouped': '未分组',
  'tasks.runHint': '双击任务，在终端里运行',
  'run.starting': '正在启动终端…',
  'run.launched': '已在「{terminal}」运行 {task}',
  'fail.no-session': '缺少会话标识',
  'fail.session-inactive': '当前会话尚未激活，请先打开一次对话',
  'fail.directory-missing': '目录不存在：{detail}',
  'fail.directory-relative': '需要绝对路径：{detail}',
  'fail.not-gradle': '当前目录不是 Gradle 项目：{detail}',
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
  'panel.description': 'Browse and run the Gradle tasks of this Session’s project',
  'toolbar.java': 'Java',
  'toolbar.javaMissing': 'No JDK found',
  'toolbar.javaHint': 'JDK used to run Gradle',
  'toolbar.rescan': 'Rescan tasks',
  'toolbar.offlineOn': 'Offline mode is on; click to turn it off (no network during runs)',
  'toolbar.offlineOff': 'Offline mode is off; click to turn it on (runs pass --offline)',
  'status.noSession': 'Reading this Session’s directory…',
  'status.scanning': 'Scanning tasks…',
  'status.scanned': '{count} tasks in {groups} groups, took {duration}',
  'status.wrapper': 'Wrapper {version}',
  'status.noWrapper': 'No wrapper, using gradle from PATH',
  'status.cachedAt': 'From cache · scanned {time} · build scripts unchanged',
  'tasks.filter': 'Filter tasks',
  'tasks.empty': 'No matching task',
  'tasks.ungrouped': 'Ungrouped',
  'tasks.runHint': 'Double-click a task to run it in a terminal',
  'run.starting': 'Starting the terminal…',
  'run.launched': '{task} is running in “{terminal}”',
  'fail.no-session': 'The request named no Session',
  'fail.session-inactive': 'This Session is not active yet; open the conversation once first',
  'fail.directory-missing': 'Directory not found: {detail}',
  'fail.directory-relative': 'An absolute path is required: {detail}',
  'fail.not-gradle': 'Not a Gradle project: {detail}',
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
