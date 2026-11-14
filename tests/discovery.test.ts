import assert from 'node:assert/strict'
import { basename, dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import {
  baseNameOf,
  describeProjectEntry,
  discoverProjects,
  pathKey,
  readDeclaredModules,
  readRootProjectName,
  relativePathOf,
  selectProject,
  type ProjectIo,
} from '../src/gradle.ts'

/** The workspace the fixtures live under, in the host platform's own form. */
const ROOT = resolve('/w')

/** Join fixture path segments under {@link ROOT}. */
function at(...segments: readonly string[]): string {
  return join(ROOT, ...segments)
}

/**
 * A fake filesystem.
 *
 * Directories are derived from the files they contain, plus any empty ones the
 * caller names, so a fixture lists exactly what the walk can see.
 */
function ioOf(files: Record<string, string> = {}, directories: readonly string[] = []): ProjectIo {
  const entries = new Map<string, { name: string, isDirectory: boolean }[]>()
  const add = (path: string, entry: { name: string, isDirectory: boolean }): void => {
    entries.set(dirname(path), [...entries.get(dirname(path)) ?? [], entry])
  }
  for (const path of Object.keys(files)) add(path, { name: basename(path), isDirectory: false })
  for (const path of directories) {
    add(path, { name: basename(path), isDirectory: true })
    if (!entries.has(path)) entries.set(path, [])
  }
  return {
    isFile: path => Object.hasOwn(files, path),
    readText: path => files[path],
    listDirectory: path => entries.get(path) ?? [],
  }
}

test('discoverProjects reports the enclosing build when the Session sits inside one', () => {
  const io = ioOf({
    [at('settings.gradle.kts')]: '',
    [at('build.gradle.kts')]: '',
  }, [at('src'), at('src', 'main'), at('src', 'main', 'java')])
  const discovery = discoverProjects(at('src', 'main', 'java'), io)
  assert.equal(discovery.truncated, false)
  assert.deepEqual(discovery.projects.map(project => project.rootDir), [ROOT])
  assert.deepEqual(discovery.projects.map(project => project.relativePath), ['../../..'])
})

test('discoverProjects walks a plain workspace folder and lists each repository', () => {
  const io = ioOf({
    [at('Alpha', 'settings.gradle')]: '',
    [at('Beta', 'build.gradle.kts')]: '',
  }, [at('Alpha'), at('Beta')])
  const discovery = discoverProjects(ROOT, io)
  assert.deepEqual(discovery.projects.map(project => project.relativePath), ['Alpha', 'Beta'])
})

test('discoverProjects reaches a build one directory deeper, as an IDE layout nests them', () => {
  const io = ioOf({
    [at('IdeaProjects', 'Alpha', 'settings.gradle')]: '',
    [at('IdeaProjects', 'Beta', 'settings.gradle.kts')]: '',
  }, [at('IdeaProjects'), at('IdeaProjects', 'Alpha'), at('IdeaProjects', 'Beta')])
  assert.deepEqual(discoverProjects(ROOT, io).projects.map(project => project.relativePath),
    ['IdeaProjects/Alpha', 'IdeaProjects/Beta'])
})

test('discoverProjects stops at a build root instead of reporting its subprojects', () => {
  const io = ioOf({
    [at('Alpha', 'settings.gradle')]: 'include(":app")',
    [at('Alpha', 'app', 'build.gradle')]: '',
  }, [at('Alpha'), at('Alpha', 'app')])
  assert.deepEqual(discoverProjects(ROOT, io).projects.map(project => project.relativePath), ['Alpha'])
})

test('discoverProjects prunes build output, dependencies, and editor state', () => {
  const io = ioOf({
    [at('Alpha', 'settings.gradle')]: '',
    [at('node_modules', 'dep', 'build.gradle')]: '',
    [at('Alpha', 'build', 'generated', 'settings.gradle')]: '',
    [at('.gradle', 'caches', 'build.gradle')]: '',
    [at('.idea', 'scratches', 'build.gradle')]: '',
    [at('dist', 'bundle', 'build.gradle')]: '',
  }, [
    at('Alpha'), at('node_modules'), at('node_modules', 'dep'),
    at('Alpha', 'build'), at('Alpha', 'build', 'generated'),
    at('.gradle'), at('.gradle', 'caches'),
    at('.idea'), at('.idea', 'scratches'),
    at('dist'), at('dist', 'bundle'),
  ])
  assert.deepEqual(discoverProjects(ROOT, io).projects.map(project => project.relativePath), ['Alpha'])
})

test('discoverProjects ignores a directory that only holds nested unknown folders', () => {
  const io = ioOf({ [at('plain', 'readme.md')]: 'hi' }, [at('plain')])
  assert.deepEqual(discoverProjects(ROOT, io), { projects: [], truncated: false })
})

test('discoverProjects reports an empty workspace without claiming truncation', () => {
  assert.deepEqual(discoverProjects(ROOT, ioOf()), { projects: [], truncated: false })
})

test('relativePathOf walks up from a nested start and keeps forward slashes', () => {
  assert.equal(relativePathOf(at('a', 'b'), at('a', 'b', 'c')), 'c')
  assert.equal(relativePathOf(at('a', 'b'), at('a', 'x', 'y')), '../x/y')
  assert.equal(relativePathOf(at('a'), at('a')), '.')
})

test('pathKey folds case and separators so one directory has one identity', () => {
  assert.equal(pathKey('C:\\Tools\\Proj\\'), pathKey('c:/tools/proj'))
})

test('readRootProjectName reads either DSL and either quote style', () => {
  assert.equal(readRootProjectName("rootProject.name = 'LaborMarket'\n"), 'LaborMarket')
  assert.equal(readRootProjectName('rootProject.name = "AnvilCraft"\n'), 'AnvilCraft')
  assert.equal(readRootProjectName('  rootProject.name = "Spaced"'), 'Spaced')
  assert.equal(readRootProjectName('rootProject.name = computeName()'), null)
  assert.equal(readRootProjectName(''), null)
})

test('readRootProjectName ignores a name left as a template placeholder', () => {
  // Multi-loader mod builds commonly write the literal '${mod_id}' and assign
  // the real name later; showing that placeholder would name every such project
  // the same, so the directory name is the better answer.
  assert.equal(readRootProjectName('rootProject.name = "${mod_id}"\n'), null)
  assert.equal(readRootProjectName("rootProject.name = '$modId'\n"), null)
  assert.equal(readRootProjectName('rootProject.name = "Cost$"\n'), 'Cost$')
})

test('readDeclaredModules reads single, list, and multi-argument includes', () => {
  assert.deepEqual(readDeclaredModules('include(":app")'), ['app'])
  assert.deepEqual(readDeclaredModules("include ':core', ':data'"), ['core', 'data'])
  assert.deepEqual(readDeclaredModules('include(":a", ":b")\ninclude(":c")'), ['a', 'b', 'c'])
})

test('readDeclaredModules drops repeats, leading colons, and computed arguments', () => {
  assert.deepEqual(readDeclaredModules('include(":app")\ninclude(":app")'), ['app'])
  assert.deepEqual(readDeclaredModules('include("::deep::path")'), ['deep::path'])
  assert.deepEqual(readDeclaredModules('include(moduleName)'), [])
})

test('readDeclaredModules ignores repository filters and included builds', () => {
  // `includeGroup` and `includeBuild` share the prefix but declare no subproject;
  // a settings file that filters a Maven repository must not grow phantom modules.
  const settings = [
    'pluginManagement {',
    '    repositories {',
    '        maven {',
    '            mavenContent {',
    '                includeGroup("com.gtnewhorizons")',
    '                includeGroupByRegex("com\\\\.gtnewhorizons\\\\..+")',
    '            }',
    '        }',
    '    }',
    '}',
    'include(":app")',
    'includeBuild("../other")',
  ].join('\n')
  assert.deepEqual(readDeclaredModules(settings), ['app'])
})

test('describeProjectEntry prefers the declared name and keeps the directory name as the fallback', () => {
  const withName = ioOf({ [at('Alpha', 'settings.gradle.kts')]: 'rootProject.name = "Market"' })
  const declared = describeProjectEntry(at('Alpha'), 'Alpha', withName)
  assert.equal(declared.name, 'Market')
  assert.equal(declared.relativePath, 'Alpha')

  const withoutName = ioOf({ [at('Beta', 'settings.gradle')]: '' })
  assert.equal(describeProjectEntry(at('Beta'), 'Beta', withoutName).name, 'Beta')
})

test('baseNameOf reads the last segment of a Windows or POSIX path without folding its case', () => {
  assert.equal(baseNameOf('C:\\Tools\\LaborMarket'), 'LaborMarket')
  assert.equal(baseNameOf('/home/me/Proj/'), 'Proj')
  assert.equal(baseNameOf('C:\\'), 'C:')
})

test('selectProject resolves a named root and refuses to guess between several', () => {
  const io = ioOf({
    [at('Alpha', 'settings.gradle')]: '',
    [at('Beta', 'settings.gradle')]: '',
  }, [at('Alpha'), at('Beta')])
  const entries = discoverProjects(ROOT, io).projects
    .map(project => describeProjectEntry(project.rootDir, project.relativePath, io))
  assert.equal(selectProject(entries, at('Beta'))?.name, 'Beta')
  assert.equal(selectProject(entries, 'c:/tools/elsewhere'), null)
  assert.equal(selectProject(entries, null), null)
  assert.equal(selectProject([entries[0]!], null)?.name, 'Alpha')
})

test('discoverProjects truncates rather than reporting an unbounded workspace', () => {
  const files: Record<string, string> = {}
  const directories: string[] = []
  for (let index = 0; index < 240; index += 1) {
    const name = `p${String(index).padStart(3, '0')}`
    files[at(name, 'settings.gradle')] = ''
    directories.push(at(name))
  }
  const discovery = discoverProjects(ROOT, ioOf(files, directories))
  assert.equal(discovery.truncated, true)
  assert.equal(discovery.projects.length, 200)
  assert.equal(discovery.projects[0]?.relativePath, 'p000')
})

test('discoverProjects deduplicates one root reached twice through its own scripts', () => {
  const io = ioOf({
    [at('Alpha', 'settings.gradle')]: '',
    [at('Alpha', 'build.gradle')]: '',
  }, [at('Alpha')])
  assert.equal(discoverProjects(ROOT, io).projects.length, 1)
})
