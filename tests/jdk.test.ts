import assert from 'node:assert/strict'
import { test } from 'node:test'
import { collectJdkVariables, hasJavaExecutable, markDefault, readReleaseEntry } from '../src/jdk.ts'

test('collectJdkVariables reads JAVA_HOME and versioned aliases, JAVA_HOME first', () => {
  const found = collectJdkVariables({
    JAVA_21: 'C:\\jdk21',
    JAVA_HOME: 'C:\\jdk25',
    Path: 'C:\\Windows',
    JAVA_8: 'C:\\jdk8',
  })
  assert.deepEqual(found.map(item => item.variable), ['JAVA_HOME', 'JAVA_8', 'JAVA_21'])
  assert.deepEqual(found.map(item => item.home), ['C:\\jdk25', 'C:\\jdk8', 'C:\\jdk21'])
})

test('collectJdkVariables sorts versioned aliases numerically', () => {
  const found = collectJdkVariables({ JAVA_21: 'C:\\jdk21', JAVA_8: 'C:\\jdk8', JAVA_17: 'C:\\jdk17' })
  assert.deepEqual(found.map(item => item.variable), ['JAVA_8', 'JAVA_17', 'JAVA_21'])
})

test('collectJdkVariables ignores unrelated variables and empty values', () => {
  const found = collectJdkVariables({ JAVA_HOME: '  ', MAVEN_OPTS: 'C:\\jdk', JAVA_TOOL_OPTIONS: '-Xmx1g' })
  assert.deepEqual(found, [])
})

test('collectJdkVariables keeps the higher-priority variable for a repeated directory', () => {
  const found = collectJdkVariables({ JAVA_25: 'C:\\jdk25', JAVA_HOME: 'c:\\JDK25', JAVA_17: 'C:\\jdk17' })
  assert.deepEqual(found, [
    { variable: 'JAVA_HOME', home: 'c:\\JDK25' },
    { variable: 'JAVA_17', home: 'C:\\jdk17' },
  ])
})

test('readReleaseEntry reads a quoted JAVA_VERSION', () => {
  const release = 'IMPLEMENTOR="Zulu"\nJAVA_VERSION="17.0.15"\n'
  assert.equal(readReleaseEntry(release, 'JAVA_VERSION'), '17.0.15')
  assert.equal(readReleaseEntry(release, 'MISSING'), null)
})

test('hasJavaExecutable checks both platform executable names', () => {
  assert.equal(hasJavaExecutable('C:\\jdk', path => path === 'C:\\jdk\\bin\\java.exe'), true)
  assert.equal(hasJavaExecutable('C:\\jdk', path => path === 'C:\\jdk\\bin\\java'), true)
  assert.equal(hasJavaExecutable('C:\\jdk', () => false), false)
})

test('markDefault flags only the first candidate', () => {
  const marked = markDefault([
    { variable: 'JAVA_HOME', home: 'C:\\a', version: null },
    { variable: 'JAVA_17', home: 'C:\\b', version: '17.0.15' },
  ])
  assert.deepEqual(marked.map(item => item.isDefault), [true, false])
})
