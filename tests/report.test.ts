import assert from 'node:assert/strict'
import { test } from 'node:test'
import { groupTasks, parseTaskReport } from '../src/gradle.ts'

/**
 * A report shaped the way Gradle prints `tasks --all`, trimmed to the parts the
 * parser has to survive: the banner, two headings, a task without a description,
 * a subproject task, and the trailing ungrouped bucket.
 */
const REPORT = `
------------------------------------------------------------
Tasks runnable from root project 'acceleratedmapcodec'
------------------------------------------------------------

Build tasks
-----------
common:assemble - Assembles the outputs of this project.
common:build - Assembles and tests this project.
neoforge:nestedClasses - Assembles nested classes.
assemble - Assembles the outputs of this project.

Help tasks
----------
buildEnvironment - Displays all buildscript dependencies declared in root project 'x'.
common:tasks - Displays the tasks runnable from project ':common'.

Other tasks
-----------
neoforge:modJar
common:prepareArchitecturyTransformer
`

test('parseTaskReport reads headings as groups and rows as tasks', () => {
  const tasks = parseTaskReport(REPORT)
  assert.deepEqual(tasks.slice(0, 2), [
    { path: ':common:assemble', project: ':common', group: 'Build', description: 'Assembles the outputs of this project.' },
    { path: ':common:build', project: ':common', group: 'Build', description: 'Assembles and tests this project.' },
  ])
  assert.equal(tasks.find(task => task.path === ':assemble')?.project, ':')
  assert.equal(tasks.find(task => task.path === ':buildEnvironment')?.group, 'Help')
  assert.equal(tasks.find(task => task.path === ':neoforge:modJar')?.group, '')
  assert.equal(tasks.find(task => task.path === ':neoforge:modJar')?.description, '')
})

test('parseTaskReport keeps every task of the sample and drops no row', () => {
  assert.equal(parseTaskReport(REPORT).length, 8)
})

test('parseTaskReport ignores the banner and anything before the first heading', () => {
  const tasks = parseTaskReport(`Tasks runnable from root project 'x'\n------------------\n\nBuild tasks\n-----------\n:build - Builds.\n`)
  assert.deepEqual(tasks.map(task => task.path), [':build'])
})

test('parseTaskReport ignores prose, rule patterns, and wrapped description lines', () => {
  const tasks = parseTaskReport([
    'Rules',
    '-----',
    'Pattern: clean<TaskName>: Cleans the output files of a task.',
    'Pattern: build<ConfigurationName>: Assembles the artifacts of a configuration.',
    'Build tasks',
    '-----------',
    ':clean - Deletes the build directory.',
    '  continued text that belongs to nothing',
  ].join('\n'))
  assert.deepEqual(tasks.map(task => task.path), [':clean'])
})

test('parseTaskReport handles a report that lists nothing', () => {
  assert.deepEqual(parseTaskReport(''), [])
  assert.deepEqual(parseTaskReport("Tasks runnable from root project 'x'\n"), [])
})

test('parseTaskReport output groups the way a dump does', () => {
  const groups = groupTasks(parseTaskReport(REPORT))
  assert.deepEqual(groups.map(group => group.group), ['Build', 'Help', ''])
  const build = groups[0]
  // Inside a group the catalogue order wins: described tasks by description,
  // then the undescribed ones by path.
  assert.deepEqual(build?.tasks.map(task => task.path), [
    ':common:build', ':neoforge:nestedClasses', ':assemble', ':common:assemble',
  ])
})
