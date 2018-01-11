'use strict';

export const isBrowser = typeof window !== 'undefined';

export function setup() {
    if (isBrowser) return;
    if (window != null) return;

    const JSDOM = require('jsdom').JSDOM;
    const dom = new JSDOM('<!doctype html><html><body></body></html>', {
        url: 'http://example.net/initial-setting'
    });
    const { window } = dom;

    global.jsdom = dom;
    global.window = window;
    global.document = window.document;

    const fetch = require('node-fetch');
    window.fetch = nodeFetchWrapper(fetch);
    window.Response = fetch.Response;
    window.Headers = fetch.Headers;

    require('./chrome');
}

export function teardown() {
    if (isBrowser) return;
    delete global.window;
    delete global.document;
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
