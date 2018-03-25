'use strict';
import { setAppCatalogs } from '../../reducers/actions';
import { getCurrentCatalog, getCurrentAppCatalog } from '../../reducers/getters';
import search from './search';
import { contains } from './util';
import update from '../thread/update';
import { sleep } from '~/content/util';

export default updateSearchResults;

const SLEEP_TIME = 200;

export async function updateSearchResults(store, opts) {
    let { query, sleepTime = SLEEP_TIME } = opts || {};

    search(store, query);

    let targets = getUpdateTargets(store);
    if (targets.length === 0) return;

    let count = 0;
    for (let url of targets) {
        if (++count !== 1) await sleep(sleepTime);
        await update(store, url);

        if (!isActive(store, url)) _updateSearchResults(store);
    }
}

function getUpdateTargets(store) {
    let { searchResults } = getCurrentAppCatalog(store);
    let { threads } = getCurrentCatalog(store);

    if (searchResults.length === 0) return [];

    let targets = [];
    for (let url of searchResults) {
        if (contains(url, threads)) continue;
        targets.push(url);
    }

    return targets;
}

function isActive(store, url) {
    let { domain } = store.getState();
    let thread = domain.threads.get(url);
    return thread.isActive;
}

function _updateSearchResults(store) {
    let { domain } = store.getState();
    let { url, searchResults } = getCurrentAppCatalog(store);

    searchResults = searchResults.filter(url => {
        let thread = domain.threads.get(url);
        return thread.isActive;
    });

    store.dispatch(setAppCatalogs({ url, searchResults }));
}

export const internal = {
    getUpdateTargets
};
