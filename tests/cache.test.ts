import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CACHE_VERSION, isTaskCacheEntry } from '../src/cache.ts'

/** A minimal entry this build accepts. */
const valid = {
  version: CACHE_VERSION,
  fingerprint: 'abc123',
  javaHome: 'C:\\jdk17',
  groups: [{ group: 'build', tasks: [{ path: ':build', project: ':', group: 'build', description: 'Builds' }] }],
  scannedAt: 1_700_000_000_000,
  durationMs: 3200,
}

test('isTaskCacheEntry accepts an entry this build wrote', () => {
  assert.equal(isTaskCacheEntry(valid), true)
  assert.equal(isTaskCacheEntry({ ...valid, javaHome: null }), true)
})

test('isTaskCacheEntry rejects an entry from another cache format', () => {
  assert.equal(isTaskCacheEntry({ ...valid, version: CACHE_VERSION + 1 }), false)
  assert.equal(isTaskCacheEntry({ ...valid, version: '1' }), false)
})

test('isTaskCacheEntry rejects a body missing the fields a hit relies on', () => {
  for (const broken of [
    null,
    [],
    'text',
    { ...valid, fingerprint: '' },
    { ...valid, fingerprint: undefined },
    { ...valid, scannedAt: undefined },
    { ...valid, durationMs: '3 s' },
    { ...valid, javaHome: 17 },
    { ...valid, groups: undefined },
    { ...valid, groups: [{ group: 'build' }] },
    { ...valid, groups: [{ group: 'build', tasks: 'none' }] },
    { ...valid, groups: [null] },
  ]) {
    assert.equal(isTaskCacheEntry(broken), false, JSON.stringify(broken))
  }
})
