'use strict';
import { CATALOG_SORT } from '../constants';

export function catalogUrl(url, sort = null) {
    if (url == null) return null;

    switch (sort) {
    case CATALOG_SORT.HISTORY:
        return `${url}&sort=${sort}&guid=on`;
    case CATALOG_SORT.BUMP_ORDER:
    case null:
        return url;
    default:
        return `${url}&sort=${sort}`;
    }
}

export function cleanCatalogUrl(url) {
    if (typeof url === 'string') url = new window.URL(url);

    let { origin, hostname, pathname } = url;
    if (!/\.2chan\.net$/.test(hostname)) return null;

    let mode = url.searchParams.get('mode');
    if (mode !== 'cat') return null;

    return `${origin}${pathname}?mode=${mode}`;
}
