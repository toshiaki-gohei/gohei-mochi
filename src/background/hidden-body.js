'use strict';
import { isChrome } from '~/common/browser';
import { F } from '~/common/util';

export function handleHiddenBody(store, { prev, next }) {
    let { status: prevStatus } = prev || {};
    let { status: nextStatus } = next || {};

    if (prevStatus === nextStatus) return;

    let tab = next;
    let { tabId, status } = tab;

    // console.log(`[${tabId}] change event:`, tab); // eslint-disable-line no-console

    switch (status) {
    case 'blocking':
        hideBody(tabId);
        break;
    case 'done':
        showBody(tabId);
        break;
    default:
    }
}

const defaultOpts = F({
    code: 'body { display: none; }',
    runAt: 'document_start'
});

function hideBody(tabId) {
    if (isChrome()) {
        chrome.tabs.insertCSS(tabId, defaultOpts);
        return;
    }

    // eslint-disable-next-line no-console
    browser.tabs.insertCSS(tabId, defaultOpts).catch(console.error);
}

function showBody(tabId) {
    if (isChrome()) {
        let opts = { ...defaultOpts, code: 'body { display: block; }' };
        chrome.tabs.insertCSS(tabId, opts);
        return;
    }

    chrome.tabs.removeCSS(tabId, defaultOpts);
}
