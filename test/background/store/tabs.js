'use strict';
import assert from 'assert';
import tabsFuns, { create, internal } from '~/background/store/tabs';
import { pluckFromMap as pluck } from '@/support/util';

const { TabState } = internal;

describe(__filename, () => {
    let tabs;
    beforeEach(() => tabs = create());

    describe('export', () => {
        it('should export functions', () => {
            let got = Object.values(tabsFuns).every(fn => typeof fn === 'function');
            assert(got === true);
        });
    });

    describe('create()', () => {
        it('should create tabs', () => {
            let got = tabs;
            let exp = new Map();
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('add()', () => {
        const { add } = tabsFuns;

        const tabId = 1;

        it('should add tab', () => {
            let tab = add(tabs, { tabId });

            let got = pluck(tabs, 'tabId');
            let exp = [ { tabId: 1 } ];
            assert.deepStrictEqual(got, exp);

            got = tab;
            exp = new TabState({ tabId });
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('set()', () => {
        const { set } = tabsFuns;

        const tabId = 1;

        it('should add tab', () => {
            let ret = set(tabs, { tabId });

            let got = pluck(tabs, 'tabId');
            let exp = [ { tabId: 1 } ];
            assert.deepStrictEqual(got, exp);

            let { prev, next } = ret;
            assert(prev === null);
            got = next;
            exp = new TabState({ tabId });
            assert.deepStrictEqual(got, exp);
        });

        it('should set tab', () => {
            set(tabs, { tabId });

            let ret = set(tabs, { tabId, status: 'done' });

            let got = pluck(tabs, 'tabId', 'status');
            let exp = [ { tabId, status: 'done' } ];
            assert.deepStrictEqual(got, exp);

            let { prev, next } = ret;
            got = prev;
            exp = new TabState({ tabId });
            assert.deepStrictEqual(got, exp);
            got = next;
            exp = new TabState({ tabId, status: 'done' });
            assert.deepStrictEqual(got, exp);
        });

        it('should throw exception if not pass tabId', () => {
            set(tabs, { tabId });

            let got;
            try { set(tabs, { status: 'done' }); } catch (e) { got = e.message; }
            assert(got === 'tabId is required');
        });
    });

    describe('remove()', () => {
        const { remove, set } = tabsFuns;

        it('should remove tab', () => {
            set(tabs, { tabId: 1 });
            set(tabs, { tabId: 2 });

            let tab = remove(tabs, 1);

            let got = pluck(tabs, 'tabId');
            let exp = [ { tabId: 2 } ];
            assert.deepStrictEqual(got, exp);

            got = tab;
            exp = new TabState({ tabId: 1 });
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if pass none existing id', () => {
            set(tabs, { tabId: 1 });
            set(tabs, { tabId: 2 });

            let tab = remove(tabs, 9);

            let got = pluck(tabs, 'tabId');
            let exp = [ { tabId: 1 }, { tabId: 2 } ];
            assert.deepStrictEqual(got, exp);

            assert(tab === null);
        });
    });

    describe('TabState', () => {
        it('should create tab state', () => {
            let tab = new TabState();
            assert(tab);
            assert(tab instanceof TabState);

            let got = { ...tab };
            let exp = {
                tabId: null,
                status: null,
                unload: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should create tab state if pass opts', () => {
            let tab = new TabState({ tabId: 1 });

            let got = { ...tab };
            let exp = {
                tabId: 1,
                status: null,
                unload: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should ignore unknown properties', () => {
            let tab = new TabState({ tabId: 1, foo: 'bar' });

            let got = { ...tab };
            let exp = {
                tabId: 1,
                status: null,
                unload: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should be freeze', () => {
            let tab = new TabState({ tabId: 1 });

            let got;
            try { tab.tabId = 0; } catch (e) { got = e; }
            assert(got instanceof TypeError);
        });
    });
});
