import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { GradleTaskGroup } from '../src/shared/protocol.ts'
import { buildProjectTree, moduleNameOf, projectMatches, taskMatches } from '../src/shared/tree.ts'

/** One task with the fields the tree reads. */
function task(path: string, project: string, description = '', group = ''): { path: string, project: string, group: string, description: string } {
  return { path, project, group, description }
}

test('buildProjectTree keeps a single-project scan at one level', () => {
  const groups: GradleTaskGroup[] = [
    { group: 'build', tasks: [task(':build', ':'), task(':clean', ':')] },
  ]
  const tree = buildProjectTree(groups)
  assert.equal(tree.modules.length, 0)
  assert.deepEqual(tree.aggregate.map(group => group.group), ['build'])
  assert.deepEqual(tree.aggregate[0]?.tasks.map(entry => entry.name), ['build', 'clean'])
  assert.equal(tree.taskCount, 2)
})

test('aggregateGroups collapses one task name declared by several projects', () => {
  // `gradle jar` starts all three jars, so the project level lists `jar` once.
  const groups: GradleTaskGroup[] = [
    {
      group: 'build',
      tasks: [task(':jar', ':'), task(':common:jar', ':common'), task(':fabric:jar', ':fabric'), task(':neoforge:jar', ':neoforge')],
    },
  ]
  const tree = buildProjectTree(groups)
  assert.equal(tree.aggregate[0]?.tasks.length, 1)
  const jar = tree.aggregate[0]?.tasks[0]
  assert.equal(jar?.name, 'jar')
  assert.deepEqual(jar?.projects, [':', ':common', ':fabric', ':neoforge'])
  assert.equal(tree.taskCount, 1)
  // The module rows still show the same task once per project.
  assert.deepEqual(tree.modules.map(module => module.path), [':common', ':fabric', ':neoforge'])
  assert.deepEqual(tree.modules.map(module => module.groups[0]?.tasks[0]?.path), [':common:jar', ':fabric:jar', ':neoforge:jar'])
})

test('aggregateGroups keeps same-named tasks of different groups apart', () => {
  const tree = buildProjectTree([
    { group: 'build', tasks: [task(':app:jar', ':app')] },
    { group: 'publishing', tasks: [task(':app:publishJar', ':app')] },
  ])
  assert.deepEqual(tree.aggregate.map(group => group.group), ['build', 'publishing'])
  assert.deepEqual(tree.aggregate.map(group => group.tasks[0]?.name), ['jar', 'publishJar'])
})

test('aggregateGroups keeps the longest description among the declaring projects', () => {
  const groups: GradleTaskGroup[] = [
    {
      group: 'build',
      tasks: [task(':assemble', ':', 'Assembles everything.'), task(':app:assemble', ':app', 'Assembles the application outputs.')],
    },
  ]
  assert.equal(buildProjectTree(groups).aggregate[0]?.tasks[0]?.description, 'Assembles the application outputs.')
})

test('aggregateGroups records each project once even when it declares one name twice', () => {
  const groups: GradleTaskGroup[] = [
    { group: 'build', tasks: [task(':app:jar', ':app', 'one'), task(':app:jar', ':app', 'two')] },
  ]
  assert.deepEqual(buildProjectTree(groups).aggregate[0]?.tasks[0]?.projects, [':app'])
})

test('buildProjectTree still lists every subproject task under its own module', () => {
  const groups: GradleTaskGroup[] = [
    { group: 'build', tasks: [task(':build', ':'), task(':app:build', ':app'), task(':lib:build', ':lib')] },
  ]
  const tree = buildProjectTree(groups)
  assert.deepEqual(tree.aggregate[0]?.tasks.map(entry => entry.name), ['build'])
  assert.deepEqual(tree.modules.map(module => module.path), [':app', ':lib'])
  assert.deepEqual(tree.modules.map(module => module.name), ['app', 'lib'])
  assert.deepEqual(tree.modules[0]?.groups.map(group => group.group), ['build'])
})

test('buildProjectTree keeps a group that spans several projects whole at the top', () => {
  const groups: GradleTaskGroup[] = [
    {
      group: 'verification',
      tasks: [
        task(':test', ':'),
        task(':app:test', ':app'),
        task(':lib:test', ':lib'),
        task(':app:check', ':app'),
      ],
    },
  ]
  const tree = buildProjectTree(groups)
  assert.deepEqual(tree.aggregate[0]?.tasks.map(entry => entry.name), ['test', 'check'])
  assert.deepEqual(tree.modules.find(module => module.path === ':app')?.groups[0]?.tasks.map(item => item.path),
    [':app:test', ':app:check'])
})

test('buildProjectTree keeps a group with no root-project task at the top', () => {
  // The group still describes one invocation of the build, so dropping it from
  // the project's list would hide tasks the project can actually run.
  const groups: GradleTaskGroup[] = [
    { group: 'build', tasks: [task(':app:build', ':app')] },
    { group: 'run', tasks: [task(':run', ':')] },
  ]
  const tree = buildProjectTree(groups)
  assert.deepEqual(tree.aggregate.map(group => group.group), ['build', 'run'])
  assert.deepEqual(tree.modules[0]?.groups.map(group => group.group), ['build'])
})

test('buildProjectTree orders modules by path and keeps the scan order at the top', () => {
  const groups: GradleTaskGroup[] = [
    { group: '', tasks: [task(':z:build', ':z'), task(':a:build', ':a')] },
    { group: 'help', tasks: [task(':z:help', ':z'), task(':a:help', ':a')] },
  ]
  const tree = buildProjectTree(groups)
  assert.deepEqual(tree.modules.map(module => module.path), [':a', ':z'])
  assert.deepEqual(tree.modules[0]?.groups.map(group => group.group), ['help', ''])
  assert.deepEqual(tree.aggregate.map(group => group.group), ['', 'help'])
})

test('buildProjectTree keeps a nested subproject path whole and names it by its last segment', () => {
  const tree = buildProjectTree([{ group: 'build', tasks: [task(':core:net:build', ':core:net')] }])
  assert.equal(tree.modules[0]?.path, ':core:net')
  assert.equal(tree.modules[0]?.name, 'net')
  assert.equal(moduleNameOf(':core:net'), 'net')
  assert.equal(moduleNameOf(':app'), 'app')
})

test('buildProjectTree reports no tasks for an empty scan', () => {
  const tree = buildProjectTree([])
  assert.deepEqual(tree, { aggregate: [], modules: [], taskCount: 0 })
})

test('projectMatches reads the name, path, and declared modules', () => {
  const entry = {
    rootDir: 'C:\\w\\Alpha',
    relativePath: 'IdeaProjects/Alpha',
    name: 'LaborMarket',
    modules: ['app', 'core'],
    buildFiles: [],
    wrapper: null,
    wrapperDistribution: null,
  }
  assert.equal(projectMatches(entry, 'labor'), true)
  assert.equal(projectMatches(entry, 'ideaprojects'), true)
  assert.equal(projectMatches(entry, 'core'), true)
  assert.equal(projectMatches(entry, 'beta'), false)
  assert.equal(projectMatches(entry, ''), true)
})

test('taskMatches reads the path and the description', () => {
  assert.equal(taskMatches(task(':app:test', ':app', 'Runs the tests.'), 'test'), true)
  assert.equal(taskMatches(task(':app:test', ':app', 'Runs the tests.'), 'tests.'), true)
  assert.equal(taskMatches(task(':app:test', ':app', 'Runs the tests.'), 'build'), false)
  assert.equal(taskMatches(task(':app:test', ':app', ''), ''), true)
})
