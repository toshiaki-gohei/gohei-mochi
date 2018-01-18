'use strict';
import Store from './store';
import blockFutabaRequest from './request-blocker';
import { handleHiddenBody } from './hidden-body';

main();

function main() {
    const store = new Store();

    chrome.webRequest.onBeforeRequest.addListener(
        blockFutabaRequest.bind(null, store),
        { urls: ['*://*/*'] },
        ['blocking']
    );

    chrome.runtime.onMessage.addListener(handleMessage.bind(null, store));

    chrome.tabs.onRemoved.addListener(handleCloseTab.bind(null, store));

    store.on('change:tabs', handleHiddenBody.bind(null, store));
}

function handleMessage(store, message, sender, sendResponse) {
    let { type } = message;
    if (type == null) throw new TypeError('type is required');

    switch (type) {
    case 'store':
        handleStore(store, { message, sender, callback: sendResponse });
        break;
    default:
        throw new TypeError(`unknown type: ${type}`);
    }

    return true;
}

function handleStore(store, { message, sender, callback }) {
    callback = callback || (() => {});

    let tabId = sender.tab.id;
    let tab = null;
    switch (true) {
    case !!message.get: {
        let { get: key } = message;
        if (key !== 'tab') throw new Error(`unknown get key: ${key}`);
        tab = store.tab(tabId);

        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log(`[${tabId}] store get(tab):`, tab);
        }
        break;
    }
    case !!message.set: {
        let { set: tabState } = message;
        store.set('tabs', { tabId, ...tabState });
        tab = store.tab(tabId);

        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log(`[${tabId}] store set():`, tabState, '->', tab);
        }
        break;
    }
    default:
        break;
    }

    callback(tab);
}

function handleCloseTab(store, tabId) {
    let tab = store.tab(tabId);
    if (tab == null) return;

    store.remove('tabs', tabId);

    if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(`[${tabId}] close: status=${tab.status}, tab=`, tab);
    }
}

export const internal = {
    handleMessage,
    handleStore,
    handleCloseTab
};
