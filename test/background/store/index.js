'use strict';
import assert from 'assert';
import Store from '~/background/store';
import { pick, pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => store = new Store());

    describe('constructor()', () => {
        it('should create store', () => {
            assert(store);
        });
    });

    describe('accessors', () => {
        it('should have tabs', done => {
            let got = store.tabs;
            let exp = new Map();
            assert.deepStrictEqual(got, exp);

            try { store.tabs = null; } catch (e) {
                assert(e instanceof TypeError);
                done();
            }
        });
    });

    describe('event emitter', () => {
        it('should handle event', () => {
            let handler1, handler2;
            let p1 = new Promise(resolve => handler1 = resolve);
            let p2 = new Promise(resolve => handler2 = resolve);

            store.on('event1', handler1);
            store.once('event2', handler2);

            store.emit('event1', { foo: 'bar' });
            store.emit('event2', { hoge: 'fuga' });

            return Promise.all([
                p1.then(payload => {
                    assert.deepStrictEqual(payload, { foo: 'bar' });
                }),
                p2.then(payload => {
                    assert.deepStrictEqual(payload, { hoge: 'fuga' });
                })
            ]).then(() => {
                let got = store.emitter.listenerCount('event1');
                assert(got === 1);
                got = store.emitter.listenerCount('event2');
                assert(got === 0);
            });
        });

        it('should remove handlers', () => {
            let handler1 = () => {};
            let handler2 = () => {};

            store.on('event1', handler1);
            store.on('event1', handler2);

            let got = store.emitter.listenerCount('event1');
            assert(got === 2);

            store.off('event1', handler1);

            got = store.emitter.listenerCount('event1');
            assert(got === 1);
        });
    });

    describe('add()', () => {
        const tabId = 1;

        it('should add correctly', () => {
            let tab = store.add('tabs', { tabId: 1 });

            let got = pluck(store.tabs, 'tabId');
            let exp = [ { tabId } ];
            assert.deepStrictEqual(got, exp);

            got = pick(tab, 'tabId');
            exp = { tabId };
            assert.deepStrictEqual(got, exp);
        });

        it('should throw exception if unknown type', () => {
            let got;
            try { store.add('unknown-type'); } catch (e) { got = e.message; }
            assert(got === 'unknown type: unknown-type');
        });

        it.skip('should throw exception if function is not defined', () => {
            let got;
            try { store.add('tabs'); } catch (e) { got = e.message; }
            assert(got === '');
        });
    });

    describe('set()', () => {
        const tabId = 1;

        it('should set correctly', () => {
            store.set('tabs', { tabId });

            let ret = store.set('tabs', { tabId, status: 'done' });

            let got = pluck(store.tabs, 'tabId');
            let exp = [ { tabId } ];
            assert.deepStrictEqual(got, exp);

            got = Object.keys(ret).sort();
            exp = [ 'prev', 'next' ].sort();
            assert.deepStrictEqual(got, exp);
        });

        it('should emit change event if set to tabs', () => {
            let handler;
            let p = new Promise(resolve => handler = resolve);

            store.on('change:tabs', handler);

            store.add('tabs', { tabId });
            store.set('tabs', { tabId, status: 'done' });

            return p.then(payload => {
                let { prev, next } = payload;
                let got = next;
                let exp = store.tabs.get(tabId);
                assert(got === exp);

                got = pick(prev, 'tabId', 'status');
                exp = { tabId: 1, status: null };
                assert.deepStrictEqual(got, exp);
                got = pick(next, 'tabId', 'status');
                exp = { tabId: 1, status: 'done' };
                assert.deepStrictEqual(got, exp);
            });
        });

        it('should throw exception if unknown type', () => {
            let got;
            try { store.set('unknown-type'); } catch (e) { got = e.message; }
            assert(got === 'unknown type: unknown-type');
        });

        it.skip('should throw exception if function is not defined', () => {
            let got;
            try { store.set('tabs'); } catch (e) { got = e.message; }
            assert(got === '');
        });
    });

    describe('remove()', () => {
        it('should remove tab', () => {
            store.add('tabs', { tabId: 1 });
            store.add('tabs', { tabId: 2 });

            let tab = store.remove('tabs', 1);

            let got = pluck(store.tabs, 'tabId');
            let exp = [ { tabId: 2 } ];
            assert.deepStrictEqual(got, exp);

            got = pick(tab, 'tabId');
            exp = { tabId: 1 };
            assert.deepStrictEqual(got, exp);
        });

        it('should throw exception if unknown type', () => {
            let got;
            try { store.remove('unknown-type'); } catch (e) { got = e.message; }
            assert(got === 'unknown type: unknown-type');
        });

        it.skip('should throw exception if function is not defined', () => {
            let got;
            try { store.remove('tabs'); } catch (e) { got = e.message; }
            assert(got === '');
        });
    });

    describe('tab()', () => {
        it('should get tab', () => {
            let added = store.add('tabs', { tabId: 1 });

            let tab = store.tab(1);

            let got = pick(tab, 'tabId');
            let exp = { tabId: 1 };
            assert.deepStrictEqual(got, exp);

            assert(tab === added);
        });

        it('should return null if tab not find', () => {
            store.add('tabs', { tabId: 1 });

            let got = store.tab(9);
            assert(got === null);
        });
    });
});
