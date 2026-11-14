import assert from 'node:assert/strict'
import { test } from 'node:test'
import { collectJdkVariables, readReleaseEntry } from '../src/jdk.ts'

test('collectJdkVariables keeps JAVA_HOME ahead of versioned aliases and sorts them numerically', () => {
  const found = collectJdkVariables({
    JAVA_21: 'C:\\jdk21',
    JAVA_HOME: 'C:\\jdk25',
    Path: 'C:\\Windows',
    JAVA_8: 'C:\\jdk8',
    JAVA_17: 'C:\\jdk17',
  })
  assert.deepEqual(found.map(item => item.variable), ['JAVA_HOME', 'JAVA_8', 'JAVA_17', 'JAVA_21'])
})

test('collectJdkVariables ignores variables that only share the JAVA prefix', () => {
  const found = collectJdkVariables({
    JAVA_HOME: '  ',
    MAVEN_OPTS: 'C:\\jdk',
    JAVA_TOOL_OPTIONS: '-Xmx1g',
    JAVA_OPTS: '-Dfoo=bar',
  })
  assert.deepEqual(found, [])
})

test('collectJdkVariables keeps the higher-priority variable for a repeated directory', () => {
  const found = collectJdkVariables({ JAVA_25: 'C:\\jdk25', JAVA_HOME: 'c:\\JDK25', JAVA_17: 'C:\\jdk17' })
  assert.deepEqual(found, [
    { variable: 'JAVA_HOME', home: 'c:\\JDK25' },
    { variable: 'JAVA_17', home: 'C:\\jdk17' },
  ])
})

test('readReleaseEntry reads a quoted JAVA_VERSION and reports a missing key', () => {
  const release = 'IMPLEMENTOR="Zulu"\nJAVA_VERSION="17.0.15"\n'
  assert.equal(readReleaseEntry(release, 'JAVA_VERSION'), '17.0.15')
  assert.equal(readReleaseEntry(release, 'MISSING'), null)
})
