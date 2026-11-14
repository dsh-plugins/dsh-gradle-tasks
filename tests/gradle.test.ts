import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  describeProject,
  findProjectRoot,
  gradleArgv,
  groupTasks,
  isTaskPath,
  parseTaskDump,
  powerShellArgv,
  projectPathOf,
  quotePowerShell,
  tailOf,
  type ProjectIo,
} from '../src/gradle.ts'

/** A fake filesystem: existing files keyed by exact path. */
function ioOf(files: Record<string, string> = {}): ProjectIo {
  return {
    isFile: path => Object.hasOwn(files, path),
    readText: path => files[path],
  }
}

test('findProjectRoot climbs to the directory that owns the build', () => {
  const io = ioOf({ 'C:\\p\\settings.gradle.kts': '', 'C:\\p\\build.gradle.kts': '' })
  assert.equal(findProjectRoot('C:\\p\\src\\main\\java', io), 'C:\\p')
})

test('findProjectRoot reports absence when no ancestor holds a script', () => {
  assert.equal(findProjectRoot('C:\\p\\src', ioOf()), null)
})

test('findProjectRoot stops at the first ancestor holding a build script', () => {
  const io = ioOf({ 'C:\\p\\build.gradle': '' })
  assert.equal(findProjectRoot('C:\\p\\app', io), 'C:\\p')
})

test('describeProject reads the declared wrapper distribution', () => {
  const io = ioOf({
    'C:\\p\\build.gradle.kts': '',
    'C:\\p\\gradlew.bat': '',
    'C:\\p\\gradle\\wrapper\\gradle-wrapper.properties': 'distributionUrl=https\\://example.test/gradle-9.1.0-bin.zip\n',
  })
  assert.equal(describeProject('C:\\p', io).wrapperDistribution, 'https\\://example.test/gradle-9.1.0-bin.zip')
})

test('parseTaskDump reads path, group, and description, keeping tabs inside a description', () => {
  const tasks = parseTaskDump(':\t\t\n:build\tbuild\tAssembles and tests.\n:app:run\trun\tRuns\t the app.\r\n')
  assert.deepEqual(tasks, [
    { path: ':build', project: ':', group: 'build', description: 'Assembles and tests.' },
    { path: ':app:run', project: ':app', group: 'run', description: 'Runs\t the app.' },
  ])
})

test('parseTaskDump ignores lines that are not three-field task rows', () => {
  assert.deepEqual(parseTaskDump('not a row\n\n:only\tone\n'), [])
})

test('projectPathOf separates a root task from a subproject task', () => {
  assert.equal(projectPathOf(':build'), ':')
  assert.equal(projectPathOf(':app:test'), ':app')
})

test('groupTasks orders groups by name with the ungrouped bucket last', () => {
  const groups = groupTasks(parseTaskDump([
    ':a\tzeta\tZ task',
    ':b\t\tNo group task',
    ':c\talpha\tAlpha task',
  ].join('\n')))
  assert.deepEqual(groups.map(group => group.group), ['alpha', 'zeta', ''])
})

test('groupTasks orders tasks inside a group by description with undescribed tasks last', () => {
  const groups = groupTasks([
    { path: ':c', project: ':', group: 'build', description: '' },
    { path: ':b', project: ':', group: 'build', description: 'Beta' },
    { path: ':a', project: ':', group: 'build', description: 'Alpha' },
  ])
  assert.deepEqual(groups[0]?.tasks.map(task => task.path), [':a', ':b', ':c'])
})

test('isTaskPath accepts project-qualified tasks and rejects option-shaped input', () => {
  for (const accepted of ['build', ':build', ':app:test', ':a-b.c:d_e']) {
    assert.equal(isTaskPath(accepted), true, accepted)
  }
  for (const rejected of ['', '--init-script=/tmp/x.gradle', ':app:test --info', 'build; rm -rf /', ':a b']) {
    assert.equal(isTaskPath(rejected), false, rejected)
  }
})

test('quotePowerShell escapes embedded quotes by doubling them', () => {
  assert.equal(quotePowerShell("C:\\o'neil\\gradlew.bat"), "'C:\\o''neil\\gradlew.bat'")
})

test('powerShellArgv passes every argument as a literal after the call operator', () => {
  const argv = powerShellArgv('C:\\a b\\gradlew.bat', ['--quiet', 'help'])
  assert.equal(argv.at(-1), "& 'C:\\a b\\gradlew.bat' '--quiet' 'help'")
})

test('gradleArgv runs a POSIX wrapper directly and a Windows batch script through PowerShell', () => {
  assert.deepEqual(gradleArgv({ path: '/p/gradlew' }, ['build'], 'posix'), ['/p/gradlew', 'build'])
  assert.deepEqual(gradleArgv({ path: 'C:\\p\\gradlew.bat' }, ['build'], 'windows').slice(0, 2),
    ['powershell.exe', '-NoProfile'])
})

test('gradleArgv also routes a PATH gradle.bat through PowerShell on Windows', () => {
  const argv = gradleArgv({ path: 'C:\\gradle\\bin\\gradle.bat' }, ['build'], 'windows')
  assert.equal(argv.at(-1), "& 'C:\\gradle\\bin\\gradle.bat' 'build'")
})

test('gradleArgv starts a native executable directly on Windows', () => {
  assert.deepEqual(gradleArgv({ path: 'C:\\gradle\\bin\\gradle.exe' }, ['build'], 'windows'),
    ['C:\\gradle\\bin\\gradle.exe', 'build'])
})

test('tailOf keeps the recent part of a long log and marks the omission', () => {
  const text = 'a'.repeat(10) + 'TAIL'
  assert.match(tailOf(text, 4), /earlier characters omitted …\nTAIL$/)
  assert.equal(tailOf('short', 10), 'short')
})
