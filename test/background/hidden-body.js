'use strict';
import assert from 'assert';
import { handleHiddenBody } from '~/background/hidden-body';
import Store from '~/background/store';
import { isBrowser } from '@/support/dom';
import '@/support/chrome';

describe(__filename, () => {
    (isBrowser ? describe.skip : describe)('handleHiddenBody()', () => {
        const tabId = 1;
        let store;
        beforeEach(() => store = new Store());

        afterEach(() => {
            delete chrome.tabs.insertCSS;
            delete chrome.tabs.removeCSS;
        });

        if (typeof global.browser !== 'undefined') throw new Error('browser is defined');
        beforeEach(() => delete global.browser);

        it('should hide body if tab status is "blocking"', done => {
            let payload = store.set('tabs', { tabId, status: 'blocking' });

            chrome.tabs.insertCSS = (tabId, { code }) => {
                assert(tabId === 1);
                assert(code === 'body { display: none; }');
                done();
            };

            handleHiddenBody(store, payload);
        });

        it('should show body if tab status is "done"', done => {
            global.browser = {}; // for on Firefox

            let payload = store.set('tabs', { tabId, status: 'done' });

            chrome.tabs.removeCSS = (tabId, { code }) => {
                assert(tabId === 1);
                assert(code === 'body { display: none; }');
                done();
            };

            handleHiddenBody(store, payload);
        });

        it('should use insertCSS() on Chrome if tab status is "done"', done => {
            let payload = store.set('tabs', { tabId, status: 'done' });

            chrome.tabs.insertCSS = (tabId, { code }) => {
                assert(tabId === 1);
                assert(code === 'body { display: block; }');
                done();
            };

            handleHiddenBody(store, payload);
        });
    });
});
