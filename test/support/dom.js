'use strict';

export const isBrowser = typeof window !== 'undefined';

export function setup(opts) {
    if (!shouldSetup()) return;

    let {
        url = 'http://example.net/initial-setting'
    } = opts || {};

    let html = '<!doctype html><html><body></body></html>';

    const JSDOM = require('jsdom').JSDOM;
    const dom = new JSDOM(html, { url });
    const { window } = dom;

    global.jsdom = dom;
    global.window = window;
    global.document = window.document;

    const fetch = require('node-fetch');
    window.fetch = nodeFetchWrapper(fetch);
    window.Response = fetch.Response;
    window.Headers = fetch.Headers;

    window.localStorage = new LocalStorage();

    require('./chrome');
}

function shouldSetup() {
    if (isBrowser) return false;
    if (typeof window === 'undefined') return true;
    if (window == null) return true;
    return false;
}

export function teardown() {
    if (isBrowser) return;
    delete global.window;
    delete global.document;
}

export function disposePreferences() {
    const cookie = require('js-cookie');
    cookie.remove('namec');
    cookie.remove('namec', { path: '/b/' });
    cookie.remove('pwdc');
    cookie.remove('pwdc', { domain: '.2chan.net' });
    cookie.remove('cxyl');
    window.localStorage.clear();
}

// the order of element attributes is different for each browser
export function tidy(htmlString) {
    if (htmlString == null) return htmlString;
    if (!isBrowser) return htmlString;

    let parser = new window.DOMParser();
    let doc = parser.parseFromString(htmlString, 'text/html');

    let $body = doc.children[0].children[1];
    return $body.innerHTML;
}

// to handle Blob smoothly on node.js environment
function nodeFetchWrapper(fetch) {
    return (url, opts) => {
        let { body } = opts;
        if (body == null) return fetch(url, opts);

        return new Promise(resolve => {
            let reader = new window.FileReader();
            reader.addEventListener('loadend', () => {
                let arrBuf = reader.result;
                resolve(Buffer.from(arrBuf));
            });
            reader.readAsArrayBuffer(body);
        }).then(body => {
            opts.body = body;
            return fetch(url, opts);
        });
    };
}

// cf. https://github.com/tmpvar/jsdom/issues/1137#issuecomment-173039751
class LocalStorage {
    constructor() {
        this._data = new Map();
    }
    getItem(key) { return this._data.has(key) ? this._data.get(key) : null; }
    setItem(key, value) { this._data.set(key, value); }
    removeItem(key) { this._data.delete(key); }
    clear() { this._data = new Map(); }
}
