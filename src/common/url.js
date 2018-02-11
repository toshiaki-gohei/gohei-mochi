'use strict';

export function isFutaba(url) {
    if (url == null) return false;
    if (/^https?:\/\/[A-Za-z0-9\-_]+\.2chan\.net(?:$|\/)/.test(url)) return true;
    return false;
}

export function type(url) {
    if (!isFutaba(url)) return null;

    let { path } = _separate(url);

    switch (true) {
    case /^\/[^/]+\/res\/\d+\.html?$/.test(path):
        return 'thread';
    case /^\/[^/]+\/futaba\.php\?(?=.*mode=cat(?:$|&))/.test(path):
        return 'catalog';
    default:
        return null;
    }
}

function _separate(url) {
    if (!/^https?:\/\/([A-Za-z0-9\-_]+)\.2chan\.net(\/.+)$/.test(url)) return {};
    return { server: RegExp.$1, path: RegExp.$2 };
}

export function separate(url) {
    if (!isFutaba(url)) throw new Error(`not futaba url: ${url}`);

    let { server, path } = _separate(url);
    let bkey = null, tkey = null;

    switch (true) {
    // thread res mode
    case /^\/([^/]+)\/res\/(\d+)\.html?$/.test(path):
        bkey = RegExp.$1;
        tkey = RegExp.$2;
        break;
    // catalog, post url
    case /^\/([^/]+)\/futaba\.php/.test(path):
        bkey = RegExp.$1;
        break;
    default:
        throw new Error(`could not separate url: ${url}`);
    }

    return { server, boardKey: bkey, threadKey: tkey };
}
