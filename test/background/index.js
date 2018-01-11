'use strict';
import assert from 'assert';
import '../support/chrome';
import { internal } from '~/background';
import Store from '~/background/store';
import { pick, pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => store = new Store());

    describe('handleMessage()', () => {
        const { handleMessage } = internal;

        it('should throw exception if message not contain type', () => {
            let message = {};
            let got;
            try { handleMessage(store, message); } catch (e) { got = e.message; }
            assert(got === 'type is required');
        });

        it('should throw exception if unknown message type', () => {
            let message = { type: 'unknown-type' };
            let got;
            try { handleMessage(store, message); } catch (e) { got = e.message; }
            assert(got === 'unknown type: unknown-type');
        });
    });

    describe('handleStore()', () => {
        const { handleStore } = internal;

        const tabId = 1;
        let sender;
        beforeEach(() => {
            store.add('tabs', { tabId, unload: { foo: 'bar' } });
            sender = { tab: { id: tabId } };
        });

        it('should get store', () => {
            let message = { type: 'store', get: 'tab' };
            handleStore(store, { message, sender, callback: tab => {
                let got = pick(tab, 'tabId', 'unload');
                let exp = { tabId: 1, unload: { foo: 'bar' } };
                assert.deepStrictEqual(got, exp);
            }});

            sender.tab.id = 2;
            message = { type: 'store', get: 'tab' };
            handleStore(store, { message, sender, callback: tab => {
                assert(tab === null);
            }});
        });

        it('should throw exception if get key is not "tab"', () => {
            let message = { type: 'store', get: 'hoge' };
            let got;
            try { handleStore(store, { message, sender }); } catch (e) { got = e.message; }
            assert(got === 'unknown get key: hoge');
        });

        it('should set store', () => {
            let message = { type: 'store', set: { unload: { hoge: 'fuga' } } };
            handleStore(store, { message, sender, callback: tab => {
                let { tabId, unload } = tab;
                assert(tabId === 1);
                assert.deepStrictEqual(unload, { hoge: 'fuga' });
            }});

            let got = pluck(store.tabs, 'tabId', 'unload');
            let exp = [
                { tabId: 1, unload: { hoge: 'fuga' } }
            ];
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('handleCloseTab()', () => {
        const { handleCloseTab } = internal;

        beforeEach(() => {
            store.add('tabs', { tabId: 1 });
            store.add('tabs', { tabId: 2 });
        });

        it('should remove tab from store', () => {
            handleCloseTab(store, 1);

            let got = pluck(store.tabs, 'tabId');
            let exp = [
                { tabId: 2 }
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if unknown tab id', () => {
            handleCloseTab(store, 9);

            let got = pluck(store.tabs, 'tabId');
            let exp = [
                { tabId: 1 },
                { tabId: 2 }
            ];
            assert.deepStrictEqual(got, exp);
        });
    });
});
