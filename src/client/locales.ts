/**
 * This plugin's copy, in both languages the Host ships.
 *
 * Dictionaries are published through the Host locale service when it is
 * mounted, and read directly otherwise, so the panel is never blank because a
 * neighbouring plugin is absent.
 */

/** Copy namespace registered with the locale service. */
export const NAMESPACE = 'gradleTasks'

const zh = {
  'panel.title': 'Gradle 任务',
  'panel.description': '双击左侧任务即可运行，构建输出显示在右侧终端',
  'toolbar.reloadTasks': '重新扫描任务',
  'toolbar.pickDirectory': '选择目录',
  'toolbar.java': 'Java',
  'toolbar.javaMissing': '未发现 JDK',
  'toolbar.javaHint': '运行 Gradle 时使用的 JDK',
  'path.placeholder': '项目目录',
  'status.notGradle': '当前目录不是 Gradle 项目',
  'status.noProject': '尚未选择目录',
  'status.scanning': '正在扫描任务…',
  'status.scanned': '共 {count} 个任务，{groups} 个分组，耗时 {duration}',
  'status.failed': '扫描失败',
  'status.wrapper': 'Wrapper {version}',
  'status.noWrapper': '无 wrapper，使用 PATH 中的 gradle',
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
}

const en: Record<keyof typeof zh, string> = {
  'panel.title': 'Gradle Tasks',
  'panel.description': 'Double-click a task on the left to run it; the build output appears in the terminal on the right',
  'toolbar.reloadTasks': 'Rescan tasks',
  'toolbar.pickDirectory': 'Choose directory',
  'toolbar.java': 'Java',
  'toolbar.javaMissing': 'No JDK found',
  'toolbar.javaHint': 'JDK used to run Gradle',
  'path.placeholder': 'Project directory',
  'status.notGradle': 'This directory is not a Gradle project',
  'status.noProject': 'No directory selected yet',
  'status.scanning': 'Scanning tasks…',
  'status.scanned': '{count} tasks in {groups} groups, took {duration}',
  'status.failed': 'Scan failed',
  'status.wrapper': 'Wrapper {version}',
  'status.noWrapper': 'No wrapper, using gradle from PATH',
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
}

/** Every language this plugin ships, keyed the way the locale service expects. */
export const DICTIONARIES: Record<string, Record<string, string>> = { zh, en }

/** One copy key. */
export type CopyKey = keyof typeof zh

/** Substitute `{name}` placeholders in one template. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = values[name]
    return value === undefined ? whole : String(value)
  })
}
