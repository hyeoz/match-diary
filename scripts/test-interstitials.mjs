import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Test actual TypeScript modules without React Native or a new test dependency.
async function source(name) {
  const text = await readFile(new URL(`../src/revival/ads/${name}.ts`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(text, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { createInterstitialPolicy } = await source('interstitialPolicy');
const { createInterstitialController } = await source('interstitialController');
const flush = () => new Promise(resolve => setImmediate(resolve));

async function policyFixture(cap = 2, raw = null) {
  let time = new Date(2026, 8, 17, 12).getTime();
  const storage = {
    getItem: async () => raw,
    setItem: async (_key, value) => { raw = value; },
  };
  const policy = createInterstitialPolicy(storage, cap, () => time);
  await policy.initialized;
  return { policy, storage, now: () => time, advance: ms => { time += ms; } };
}

test('first completion and first 90 seconds are ad-free', async () => {
  const f = await policyFixture();
  assert.equal(f.policy.reserve(true), false);
  f.advance(89_999);
  assert.equal(f.policy.reserve(true), false);
  f.advance(1);
  assert.equal(f.policy.reserve(true), true);
});
test('no-fill does not reserve a slot or defer the ad', async () => {
  const f = await policyFixture();
  f.policy.reserve(false);
  f.advance(90_000);
  assert.equal(f.policy.reserve(false), false);
  assert.equal(f.policy.reserve(true), true);
});
test('rapid taps, cooldown and daily cap share one policy', async () => {
  const f = await policyFixture();
  f.policy.reserve(true);
  f.advance(90_000);
  assert.equal(f.policy.reserve(true), true);
  assert.equal(f.policy.reserve(true), false);
  f.advance(179_999);
  assert.equal(f.policy.reserve(true), false);
  f.advance(1);
  assert.equal(f.policy.reserve(true), true);
  f.advance(180_000);
  assert.equal(f.policy.reserve(true), false);
});
test('Vita daily cap is one; a new local day resets it', async () => {
  const f = await policyFixture(1);
  f.policy.reserve(true);
  f.advance(90_000);
  assert.equal(f.policy.reserve(true), true);
  f.advance(180_000);
  assert.equal(f.policy.reserve(true), false);
  f.advance(24 * 60 * 60_000);
  assert.equal(f.policy.reserve(true), true);
});
test('restart preserves cap and first-completion history', async () => {
  const f = await policyFixture(1);
  f.policy.reserve(true);
  f.advance(90_000);
  f.policy.reserve(true);
  await flush();
  const restarted = createInterstitialPolicy(f.storage, 1, f.now);
  await restarted.initialized;
  f.advance(180_000);
  assert.equal(restarted.reserve(true), false);
});
test('clock rollback cannot reset the cap', async () => {
  const f = await policyFixture();
  f.policy.reserve(true);
  f.advance(90_000);
  f.policy.reserve(true);
  f.advance(-24 * 60 * 60_000);
  assert.equal(f.policy.reserve(true), false);
});
test('unreadable and corrupted storage fail closed', async () => {
  for (const raw of ['invalid', '{}', '{"count":-1}']) {
    const f = await policyFixture(2, raw);
    f.advance(90_000);
    assert.equal(f.policy.reserve(true), false);
  }
  const p = createInterstitialPolicy({
    getItem: async () => { throw Error('storage'); }, setItem: async () => {},
  }, 2);
  await p.initialized;
  assert.equal(p.reserve(true), false);
});
test('slow hydration never queues a delayed presentation', async () => {
  let release;
  const p = createInterstitialPolicy({
    getItem: () => new Promise(resolve => { release = resolve; }),
    setItem: async () => {},
  }, 2);
  assert.equal(p.reserve(true), false);
  release(null);
  await p.initialized;
  assert.equal(p.reserve(true), false);
});
test('failed frequency writes disable subsequent ads', async () => {
  const p = createInterstitialPolicy({
    getItem: async () => null,
    setItem: async () => { throw Error('disk full'); },
  }, 2);
  await p.initialized;
  p.reserve(true);
  await flush();
  assert.equal(p.reserve(true), false);
});

function controllerFixture({ show, reserve } = {}) {
  const listeners = new Map();
  let loads = 0;
  let shows = 0;
  let active = true;
  let time = 1;
  const controller = createInterstitialController({
    now: () => time,
    isActive: () => active,
    reserve: reserve ?? (available => available),
    createAd: () => ({
      listen(event, fn) { listeners.set(event, fn); return () => listeners.delete(event); },
      load() { loads++; },
      show() { shows++; return show ? show() : Promise.resolve(); },
    }),
  });
  return {
    controller, emit: event => listeners.get(event)?.(),
    loads: () => loads, shows: () => shows,
    background: () => { active = false; }, advance: ms => { time += ms; },
  };
}
test('consent gate: before start no request or presentation', async () => {
  const f = controllerFixture();
  assert.equal(await f.controller.show(), false);
  assert.equal(f.loads(), 0);
  assert.equal(f.shows(), 0);
});
test('unloaded ad skips immediately and never shows on later LOADED', async () => {
  const f = controllerFixture(); f.controller.start();
  assert.equal(await f.controller.show(), false);
  f.emit('loaded');
  assert.equal(f.shows(), 0);
  f.controller.stop();
});
test('navigation waits for CLOSED, not the native show promise', async () => {
  const f = controllerFixture(); f.controller.start(); f.emit('loaded');
  let finished = false;
  const shown = f.controller.show().then(value => { finished = true; return value; });
  f.emit('opened');
  await flush();
  assert.equal(finished, false);
  assert.equal(await f.controller.show(), false);
  assert.equal(f.shows(), 1);
  f.emit('closed');
  assert.equal(await shown, true);
  assert.equal(f.loads(), 2);
  f.controller.stop();
});
test('presentation rejection or synchronous exception cannot break navigation', async () => {
  for (const show of [() => Promise.reject(Error('native')), () => { throw Error('native'); }]) {
    const f = controllerFixture({ show }); f.controller.start(); f.emit('loaded');
    assert.equal(await f.controller.show(), false);
    f.controller.stop();
  }
});
test('native ERROR and unmount release an in-flight transition', async () => {
  for (const event of ['error', 'unmount']) {
    const f = controllerFixture(); f.controller.start(); f.emit('loaded');
    const result = f.controller.show();
    f.emit('opened');
    if (event === 'error') f.emit('error'); else f.controller.stop();
    assert.equal(await result, false);
    f.controller.stop();
  }
});
test('background and expired ads are skipped; expiry preloads a fresh ad', async () => {
  const f = controllerFixture(); f.controller.start(); f.emit('loaded');
  f.advance(55 * 60_000);
  assert.equal(await f.controller.show(), false);
  assert.equal(f.loads(), 2);
  f.emit('loaded'); f.background();
  assert.equal(await f.controller.show(), false);
  assert.equal(f.shows(), 0);
  f.controller.stop();
});
test('load failure retries on a future workflow without retry loops', async () => {
  const f = controllerFixture(); f.controller.start(); f.emit('error');
  assert.equal(f.loads(), 1);
  assert.equal(await f.controller.show(), false);
  assert.equal(f.loads(), 2);
  f.controller.stop();
});
test('revoked consent removes loaded ads and late listeners', async () => {
  const f = controllerFixture(); f.controller.start(); f.emit('loaded');
  f.controller.stop(); f.emit('loaded');
  assert.equal(await f.controller.show(), false);
  assert.equal(f.shows(), 0);
});
