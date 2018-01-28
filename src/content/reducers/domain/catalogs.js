'use strict';
import { createReducer } from '../util';
import { F } from '~/common/util';

const STATE = F(new Map());

function create(opts) {
    let {
        url = null,
        title = null,
        threads = [],
        sort = null // content/constants.CATALOG_SORT
    } = opts || {};

    F(threads);

    return F({ url, title, threads, sort });
}


export default createReducer(STATE, {
    'SET_DOMAIN_CATALOGS': reduce
});

function reduce(state = STATE, action) {
    let { catalog, catalogs } = action;
    if (catalog) catalogs = [ catalog ];
    if (catalogs == null || catalogs.length === 0) return state;

    let newState = new Map(state);

    for (let catalog of catalogs) {
        let { url } = catalog;
        if (url == null) throw new Error('catalog url is required');

        let newCatalog = reduceCatalog(state.get(url), catalog);
        newState.set(url, newCatalog);
    }

    return F(newState);
}

const CATALOG = create();

function reduceCatalog(prev = CATALOG, next) {
    if (next == null) return prev;

    let newState = { ...prev, ...next };

    return create(newState);
}

export const internal = {
    reduce
};
