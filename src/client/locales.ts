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
  'panel.description': '浏览并运行当前项目的 Gradle 任务',
  'toolbar.reloadTasks': '重新扫描任务',
  'toolbar.pickDirectory': '选择目录',
  'toolbar.java': 'Java',
  'toolbar.javaMissing': '未发现 JDK',
  'toolbar.javaHint': '运行 Gradle 时使用的 JDK',
  'path.placeholder': '项目目录',
  'status.noProject': '尚未选择目录',
  'status.scanning': '正在扫描任务…',
  'status.scanned': '共 {count} 个任务，{groups} 个分组，耗时 {duration}',
  'status.wrapper': 'Wrapper {version}',
  'status.noWrapper': '无 wrapper，使用 PATH 中的 gradle',
  'status.cachedAt': '来自缓存 · 扫描于 {time} · 构建脚本未变化',
  'tasks.filter': '过滤任务',
  'tasks.empty': '没有匹配的任务',
  'tasks.ungrouped': '未分组',
  'tasks.runHint': '双击任务运行',
  'run.idle': '尚未运行任务',
  'run.running': '运行中',
  'run.succeeded': '成功',
  'run.failed': '失败（退出码 {code}）',
  'run.stopped': '已终止',
  'run.stop': '停止',
  'run.clear': '清空',
  'fail.no-session': '当前没有可用的会话目录，请手动选择项目目录',
  'fail.session-inactive': '当前会话尚未激活，请手动选择项目目录',
  'fail.directory-missing': '目录不存在：{detail}',
  'fail.directory-relative': '需要绝对路径：{detail}',
  'fail.not-gradle': '当前目录不是 Gradle 项目：{detail}',
  'fail.wrapper-mismatch': '项目 wrapper 与当前平台不匹配：{detail}',
  'fail.gradle-missing': '项目没有 wrapper，PATH 中也找不到 gradle：{detail}',
  'fail.scan-failed': 'Gradle 执行失败（退出码 {detail}）',
  'fail.scan-timeout': '扫描超时，已终止 Gradle：\n{detail}',
  'fail.no-report': 'Gradle 未产出任务清单',
  'fail.java-invalid': '不是可用的 JDK 目录：{detail}',
  'fail.task-missing': '任务不存在：{detail}',
  'fail.field-missing': '缺少字段：{detail}',
  'fail.body-invalid': '请求体不合法',
  'fail.body-too-large': '请求体过大',
  'fail.run-not-found': '找不到该运行记录',
  'fail.transport': '无法连接本地服务：{detail}',
}

const en: Record<keyof typeof zh, string> = {
  'panel.title': 'Gradle Tasks',
  'panel.description': 'Browse and run the current project’s Gradle tasks',
  'toolbar.reloadTasks': 'Rescan tasks',
  'toolbar.pickDirectory': 'Choose directory',
  'toolbar.java': 'Java',
  'toolbar.javaMissing': 'No JDK found',
  'toolbar.javaHint': 'JDK used to run Gradle',
  'path.placeholder': 'Project directory',
  'status.noProject': 'No directory selected yet',
  'status.scanning': 'Scanning tasks…',
  'status.scanned': '{count} tasks in {groups} groups, took {duration}',
  'status.wrapper': 'Wrapper {version}',
  'status.noWrapper': 'No wrapper, using gradle from PATH',
  'status.cachedAt': 'From cache · scanned {time} · build scripts unchanged',
  'tasks.filter': 'Filter tasks',
  'tasks.empty': 'No matching task',
  'tasks.ungrouped': 'Ungrouped',
  'tasks.runHint': 'Double-click a task to run it',
  'run.idle': 'No task has run yet',
  'run.running': 'Running',
  'run.succeeded': 'Succeeded',
  'run.failed': 'Failed (exit code {code})',
  'run.stopped': 'Stopped',
  'run.stop': 'Stop',
  'run.clear': 'Clear',
  'fail.no-session': 'No Session directory is available; choose a project directory instead',
  'fail.session-inactive': 'This Session is not active yet; choose a project directory instead',
  'fail.directory-missing': 'Directory not found: {detail}',
  'fail.directory-relative': 'An absolute path is required: {detail}',
  'fail.not-gradle': 'Not a Gradle project: {detail}',
  'fail.wrapper-mismatch': 'The project wrapper does not match this platform: {detail}',
  'fail.gradle-missing': 'The project ships no wrapper and PATH has no gradle: {detail}',
  'fail.scan-failed': 'Gradle failed (exit code {detail})',
  'fail.scan-timeout': 'The scan timed out and Gradle was terminated:\n{detail}',
  'fail.no-report': 'Gradle produced no task report',
  'fail.java-invalid': 'Not a usable JDK directory: {detail}',
  'fail.task-missing': 'No such task: {detail}',
  'fail.field-missing': 'Missing field: {detail}',
  'fail.body-invalid': 'The request body is not valid JSON',
  'fail.body-too-large': 'The request body is too large',
  'fail.run-not-found': 'No such run is retained',
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
  'field-missing': 'fail.field-missing',
  'body-invalid': 'fail.body-invalid',
  'body-too-large': 'fail.body-too-large',
  'run-not-found': 'fail.run-not-found',
  transport: 'fail.transport',
}

/** Substitute `{name}` placeholders in one template. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = values[name]
    return value === undefined ? whole : String(value)
  })
}
