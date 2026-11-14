import assert from 'node:assert/strict'
import { dirname, join, resolve, basename } from 'node:path'
import { test } from 'node:test'
import {
  collectConfigurationInputs,
  describeProject,
  findProjectRoot,
  fingerprintConfiguration,
  gradleArgv,
  groupTasks,
  isTaskPath,
  parseTaskDump,
  powerShellArgv,
  projectPathOf,
  quoteCmd,
  quotePosix,
  quotePowerShell,
  shellCommandLine,
  shellKindOf,
  tailOf,
  type ProjectIo,
} from '../src/gradle.ts'

/** The build root the fixtures live under, in the host platform's own form. */
const ROOT = resolve('/p')

/** Join fixture path segments under {@link ROOT}. */
function at(...segments: readonly string[]): string {
  return join(ROOT, ...segments)
}

/** A fake filesystem: existing files keyed by exact path. */
function ioOf(files: Record<string, string> = {}, directories: readonly string[] = []): ProjectIo {
  const entries = new Map<string, { name: string, isDirectory: boolean }[]>()
  for (const path of Object.keys(files)) {
    const parent = dirname(path)
    const name = basename(path)
    entries.set(parent, [...entries.get(parent) ?? [], { name, isDirectory: false }])
  }
  for (const path of directories) {
    const parent = dirname(path)
    const name = basename(path)
    entries.set(parent, [...entries.get(parent) ?? [], { name, isDirectory: true }])
    if (!entries.has(path)) entries.set(path, [])
  }
  return {
    isFile: path => Object.hasOwn(files, path),
    readText: path => files[path],
    listDirectory: path => entries.get(path) ?? [],
  }
}

test('findProjectRoot climbs to the directory that owns the build', () => {
  const io = ioOf({ [at('settings.gradle.kts')]: '', [at('build.gradle.kts')]: '' })
  assert.equal(findProjectRoot(at('src', 'main', 'java'), io), ROOT)
})

test('findProjectRoot reports absence when no ancestor holds a script', () => {
  assert.equal(findProjectRoot(at('src'), ioOf()), null)
})

test('findProjectRoot stops at the first ancestor holding a build script', () => {
  const io = ioOf({ [at('build.gradle')]: '' })
  assert.equal(findProjectRoot(at('app'), io), ROOT)
})

test('describeProject reads the declared wrapper distribution', () => {
  const io = ioOf({
    [at('build.gradle.kts')]: '',
    [at('gradlew.bat')]: '',
    [at('gradle', 'wrapper', 'gradle-wrapper.properties')]: 'distributionUrl=https\\://example.test/gradle-9.1.0-bin.zip\n',
  })
  assert.equal(describeProject(ROOT, io).wrapperDistribution, 'https\\://example.test/gradle-9.1.0-bin.zip')
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

test('shellCommandLine quotes every argument for the shell that runs it', () => {
  assert.equal(
    shellCommandLine('C:\\a b\\gradlew.bat', [':build', '--offline'], 'powershell'),
    "& 'C:\\a b\\gradlew.bat' ':build' '--offline'",
  )
  assert.equal(
    shellCommandLine('C:\\a b\\gradlew.bat', [':build', '--offline'], 'cmd'),
    '"C:\\a b\\gradlew.bat" ":build" "--offline"',
  )
  assert.equal(
    shellCommandLine('/p/gradlew', [':build', '--offline'], 'posix'),
    "'/p/gradlew' ':build' '--offline'",
  )
})

test('shellCommandLine never puts a call operator in front of a cmd command', () => {
  // `&` separates commands in cmd.exe, so it would run the wrapper path as one.
  assert.equal(shellCommandLine('gradlew.bat', [':jar'], 'cmd').startsWith('&'), false)
})

test('shellKindOf reads the terminal shell rather than the platform default', () => {
  assert.equal(shellKindOf('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe', 'windows'), 'powershell')
  assert.equal(shellKindOf('C:\\Program Files\\PowerShell\\7\\pwsh.exe', 'windows'), 'powershell')
  assert.equal(shellKindOf('C:\\Windows\\System32\\cmd.exe', 'windows'), 'cmd')
  assert.equal(shellKindOf('C:\\Program Files\\Git\\bin\\bash.exe', 'windows'), 'posix')
  assert.equal(shellKindOf('/bin/bash', 'posix'), 'posix')
  assert.equal(shellKindOf('/usr/bin/fish', 'posix'), 'posix')
})

test('quoteCmd wraps a value in double quotes', () => {
  assert.equal(quoteCmd('C:\\a b\\gradlew.bat'), '"C:\\a b\\gradlew.bat"')
})

test('quotePosix escapes an embedded quote so the argument stays one word', () => {
  assert.equal(quotePosix("it's"), "'it'\\''s'")
})

test('tailOf keeps the recent part of a long log and marks the omission', () => {
  const text = 'a'.repeat(10) + 'TAIL'
  assert.match(tailOf(text, 4), /earlier characters omitted …\nTAIL$/)
  assert.equal(tailOf('short', 10), 'short')
})

test('collectConfigurationInputs finds scripts in subprojects and the version catalogue', () => {
  const io = ioOf({
    [at('settings.gradle.kts')]: 'root',
    [at('build.gradle.kts')]: 'root',
    [at('gradle.properties')]: 'org.gradle.jvmargs=-Xmx1g',
    [at('gradle', 'libs.versions.toml')]: '[versions]',
    [at('app', 'build.gradle.kts')]: 'sub',
    [at('app', 'src', 'main', 'java', 'A.java')]: 'class A {}',
  }, [
    at('app'),
    at('gradle'),
    at('app', 'src'),
    at('app', 'src', 'main'),
    at('app', 'src', 'main', 'java'),
  ])
  assert.deepEqual(collectConfigurationInputs(ROOT, io).map(input => input.path).sort(), [
    'app/build.gradle.kts',
    'build.gradle.kts',
    'gradle.properties',
    'gradle/libs.versions.toml',
    'settings.gradle.kts',
  ])
})

test('collectConfigurationInputs prunes build outputs and editor state', () => {
  const io = ioOf({
    [at('build.gradle.kts')]: 'root',
    [at('build', 'generated', 'build.gradle')]: 'stale output',
    [at('.gradle', 'caches', 'build.gradle')]: 'cache',
    [at('node_modules', 'x', 'build.gradle')]: 'dependency',
  }, [
    at('build'),
    at('build', 'generated'),
    at('.gradle'),
    at('.gradle', 'caches'),
    at('node_modules'),
    at('node_modules', 'x'),
  ])
  assert.deepEqual(collectConfigurationInputs(ROOT, io).map(input => input.path), ['build.gradle.kts'])
})

test('fingerprintConfiguration changes when any input content changes', () => {
  const before = fingerprintConfiguration(1, [{ path: 'build.gradle', digest: 'aaa' }], ['windows', ''])
  const after = fingerprintConfiguration(1, [{ path: 'build.gradle', digest: 'bbb' }], ['windows', ''])
  assert.notEqual(before, after)
})

test('fingerprintConfiguration changes when the platform or JDK changes', () => {
  const inputs = [{ path: 'build.gradle', digest: 'aaa' }]
  const windows = fingerprintConfiguration(1, inputs, ['windows', 'C:\\jdk17'])
  assert.notEqual(windows, fingerprintConfiguration(1, inputs, ['posix', 'C:\\jdk17']))
  assert.notEqual(windows, fingerprintConfiguration(1, inputs, ['windows', 'C:\\jdk21']))
  assert.equal(windows, fingerprintConfiguration(1, inputs, ['windows', 'C:\\jdk17']))
})

test('fingerprintConfiguration ignores directory order and separates paths from digests', () => {
  const ordered = fingerprintConfiguration(1, [
    { path: 'a/build.gradle', digest: '11' },
    { path: 'build.gradle', digest: '22' },
  ], [])
  const shuffled = fingerprintConfiguration(1, [
    { path: 'build.gradle', digest: '22' },
    { path: 'a/build.gradle', digest: '11' },
  ], [])
  assert.equal(ordered, shuffled)
  const ambiguous = fingerprintConfiguration(1, [{ path: 'ab', digest: 'c' }], [])
  const other = fingerprintConfiguration(1, [{ path: 'a', digest: 'bc' }], [])
  assert.notEqual(ambiguous, other)
})

test('fingerprintConfiguration changes with the cache format version', () => {
  const inputs = [{ path: 'build.gradle', digest: 'aaa' }]
  assert.notEqual(fingerprintConfiguration(1, inputs, []), fingerprintConfiguration(2, inputs, []))
})
