'use strict';
import assert from 'assert';
import blockFutabaRequest from '~/background/request-blocker';
import Store from '~/background/store';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => store = new Store());

    describe('blockFutabaRequest()', () => {
        it('should not block if request is unrelated url', () => {
            let details = { tabId: 1, url: 'http://example.net/' };
            let got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: false });

            assert(store.tabs.size === 0);

            details = { tabId: 1, url: 'http://example.net/same-tab-other-url' };
            got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: false });

            assert(store.tabs.size === 0);
        });

        it('should block if thread is initializing', () => {
            const tabId = 1;
            let details = { tabId, url: 'https://may.2chan.net/b/res/123456789.htm' };

            let got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: false });

            got = pluck(store.tabs, 'tabId', 'status');
            let exp = [
                { tabId: 1, status: 'blocking' }
            ];
            assert.deepEqual(got, exp);

            details = { tabId, url: 'https://may.2chan.net/bin/base4.js?i' };
            got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: true });
            details = { tabId, url: 'https://example.net/ad' };
            got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: true });

            got = pluck(store.tabs, 'tabId', 'status');
            exp = [
                { tabId: 1, status: 'blocking' }
            ];
            assert.deepEqual(got, exp);
        });

        it('should not block if thread is initialized', () => {
            const tabId = 1;
            let details = { tabId, url: 'https://may.2chan.net/b/res/123456789.htm' };

            blockFutabaRequest(store, details);
            store.set('tabs', { tabId, status: 'done' });

            let got = pluck(store.tabs, 'tabId', 'status');
            let exp = [
                { tabId: 1, status: 'done' }
            ];
            assert.deepEqual(got, exp);

            details = { tabId, url: 'https://may.2chan.net/bin/base4.js?i' };
            got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: false });
            details = { tabId, url: 'https://example.net/ad' };
            got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: false });

            // update thread
            details = { tabId, url: 'https://may.2chan.net/b/res/123456789.htm' };
            got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: false });

            got = pluck(store.tabs, 'tabId', 'status');
            exp = [
                { tabId: 1, status: 'done' }
            ];
            assert.deepEqual(got, exp);
        });

        it('should block if catalog is initializing', () => {
            const tabId = 1;
            let details = { tabId, url: 'https://may.2chan.net/b/futaba.php?mode=cat&sort=3' };

            let got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: false });

            got = pluck(store.tabs, 'tabId', 'status');
            let exp = [
                { tabId: 1, status: 'blocking' }
            ];
            assert.deepEqual(got, exp);

            details = { tabId, url: 'https://may.2chan.net/bin/base4.js?i' };
            got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: true });
            details = { tabId, url: 'https://example.net/ad' };
            got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: true });

            got = pluck(store.tabs, 'tabId', 'status');
            exp = [
                { tabId: 1, status: 'blocking' }
            ];
            assert.deepEqual(got, exp);
        });

        it('should not block if catalog is initialized', () => {
            const tabId = 1;
            let details = { tabId, url: 'https://may.2chan.net/b/futaba.php?mode=cat&sort=3' };

            blockFutabaRequest(store, details);
            store.set('tabs', { tabId, status: 'done' });

            let got = pluck(store.tabs, 'tabId', 'status');
            let exp = [
                { tabId: 1, status: 'done' }
            ];
            assert.deepEqual(got, exp);

            details = { tabId, url: 'https://may.2chan.net/bin/base4.js?i' };
            got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: false });
            details = { tabId, url: 'https://example.net/ad' };
            got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: false });

            // update catalog
            details = { tabId, url: 'https://may.2chan.net/b/futaba.php?mode=cat&sort=3' };
            got = blockFutabaRequest(store, details);
            assert.deepStrictEqual(got, { cancel: false });

            got = pluck(store.tabs, 'tabId', 'status');
            exp = [
                { tabId: 1, status: 'done' }
            ];
            assert.deepEqual(got, exp);
        });
    });
});
