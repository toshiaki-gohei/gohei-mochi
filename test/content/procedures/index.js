'use strict';
import assert from 'assert';
import procedures, { internal } from '~/content/procedures';

describe(__filename, () => {
    const STORE = 'test store';

    const foo = {
        bar: store => `test procedure: "${store}"`
    };
    const hoge = {
        fuga: (store, ...args) => `args: "${store}", ${args.join(', ')}`
    };

    describe('makeMap()', () => {
        const { makeMap } = internal;

        it('should map procedures', () => {
            let pros = makeMap(STORE, 'foo', foo);

            let got = pros['foo/bar']();
            assert(got === 'test procedure: "test store"');
        });

        it('should handle args', () => {
            let pros = makeMap(STORE, 'hoge', hoge);

            let got = pros['hoge/fuga']('arg1', 'arg2');
            assert(got === 'args: "test store", arg1, arg2');
        });
    });

    describe('defaultMap()', () => {
        const { defaultMap } = internal;

        it('should return default map', () => {
            let map = defaultMap(STORE);
            let got = Object.values(map).every(fn => typeof fn === 'function');
            assert(got === true);
        });
    });

    describe('procedures()', () => {
        const { makeMap } = internal;

        const map = {
            ...makeMap(STORE, 'foo', foo),
            ...makeMap(STORE, 'hoge', hoge)
        };

        it('should return commit()', async () => {
            let commit = procedures(STORE, map);

            let got = await commit('foo/bar');
            assert(got === 'test procedure: "test store"');

            got = await commit('hoge/fuga', 'arg1', 'arg2');
            assert(got === 'args: "test store", arg1, arg2');
        });

        it('should use simply if not need store', async () => {
            let commit = procedures(null, {
                'foo/bar': () => 'test procedure',
                'hoge/fuga': (...args) => args.join(', ')
            });

            let got = await commit('foo/bar');
            assert(got === 'test procedure');
            got = await commit('hoge/fuga', 'arg1', 'arg2');
            assert(got === 'arg1, arg2');
        });

        it('should return default commit() if no map argument', () => {
            let commit = procedures(STORE);
            assert(typeof commit === 'function');
        });

        it('should handle async function correctly', async () => {
            let commit = procedures(null, {
                'foo/bar': () => new Promise(resolve => {
                    setTimeout(() => resolve('async function'), 10);
                })
            });
            let got = await commit('foo/bar');
            assert(got === 'async function');
        });

        it('should handle sync functions', done => {
            let commit = procedures(null, {
                'sync/func': () => {
                    setTimeout(done, 10);
                    return 'call sync';
                }
            });

            let got = commit('sync/func');
            assert(got === 'call sync');
        });

        it('should throw exception if mapped function not found', async () => {
            let commit = procedures(STORE, map);

            let got;
            try { await commit('hoo/bar'); } catch (e) { got = e.message; }
            assert(got === 'mapped procedure not found: hoo/bar');
        });
    });
});
