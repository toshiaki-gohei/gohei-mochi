'use strict';
import { isFirefox } from '~/common/browser';
import { decode } from './encoding';
import { parse as parseThread } from '../parser/thread';
import { parse as parseCatalog } from '../parser/catalog';

export default {
    get, post, getThread, getCatalog
};

const TIMEOUT = 20 * 1000;

async function fetch(url, opts) {
    let { timeout = TIMEOUT, ...rest } = opts || {}; // eslint-disable-line no-unused-vars
    let timeoutId = null;

    let p1 = new Promise(async resolve => {
        let res;
        try { res = await _fetch(url, rest); } catch (e) { res = res499(e); }
        if (timeoutId != null) clearTimeout(timeoutId);
        resolve(res);
    });
    // comment out to disable fetch timeout because the issue where tab crashed
    // using fetch() on Windows
    // let p2 = new Promise((resolve, reject) => {
    //     timeoutId = setTimeout(reject, timeout, res599());
    // });

    let promises = [ p1 ];
    // if (timeout !== 0) promises.push(p2);

    return Promise.race(promises).then(res => res).catch(err => err);
}

async function _fetch(...args) {
    if (isFirefox()) return content.fetch(...args); // eslint-disable-line no-undef
    return window.fetch(...args);
}

export async function get(url, opts) {
    let { headers } = opts || {};

    opts = {
        credentials: 'same-origin',
        ...opts
    };
    if (headers) opts.headers = new window.Headers(headers);

    let res = await fetch(url, opts);

    let contentType = res.headers.get('content-type');
    let { type } = mime(contentType);

    let text, blob;
    switch (true) {
    case /^text/.test(type):
        text = await textify(res);
        return response({ res, text });
    case /^image/.test(type):
        blob = await res.blob();
        return response({ res, blob });
    default:
        return response({ res });
    }
}

export async function getThread(url, opts) {
    let res = await get(url, opts);
    if (!res.ok) return res;

    let contents = parseThread(res.text);
    return { ...res, contents };
}

export async function getCatalog(url, opts) {
    let res = await get(url, opts);
    if (!res.ok) return res;

    let contents = parseCatalog(res.text);
    return { ...res, contents };
}

export async function post(url, opts) {
    opts = {
        method: 'post',
        credentials: 'same-origin',
        ...opts
    };

    let res = await fetch(url, opts);

    if (!res.ok) return response({ res });

    let text = await textify(res);

    return response({ res, text });
}

function response({ res, ...rest }) {
    let { ok, status, statusText, headers } = res;
    return { ok, status, statusText, headers, ...rest };
}

function res499(err) {
    return new window.Response(null, {
        ok: false, status: 499, statusText: `fetch error: ${err.message}`
    });
}

// eslint-disable-next-line no-unused-vars
function res599() {
    return new window.Response(null, {
        ok: false, status: 599, statusText: 'request timeout'
    });
}

async function textify(res) {
    let { headers } = res;

    let contentType = headers.get('content-type');
    let { charset } = mime(contentType);

    let text;
    if (charset === 'shift-jis') {
        let arrBuf = await res.arrayBuffer();
        text = decode(arrBuf);
    } else {
        text = await res.text();
    }

    return text;
}

function mime(contentType) {
    if (!/^\s*([^;\s]+)[;\s]*(.*)$/.test(contentType)) return null;
    let type = RegExp.$1;
    let parameter = RegExp.$2.trim() || null;

    if (!/^text\//.test(type)) return { type, parameter };

    let charset = 'utf-8';
    if (/^charset=([^;\s]+)/.test(parameter)) {
        charset = RegExp.$1.toLowerCase();
        charset = charset.replace(/_/g, '-');
    }

    return { type, charset };
}

export const internal = {
    mime
};
