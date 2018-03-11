'use strict';
import { setAppCatalogs } from '../../reducers/actions';
import { getCurrentCatalog, getCurrentAppCatalog } from '../../reducers/getters';
import update from '../thread/update';
import { sleep } from '~/content/util';

export default updateSearchResults;

const SLEEP_TIME = 200;

export async function updateSearchResults(store, opts) {
    let { sleepTime = SLEEP_TIME } = opts || {};

    let targets = getUpdateTargets(store);
    if (targets.length === 0) return;

    for (let i = 0, len = targets.length; i < len; ++i) {
        let url = targets[i];
        if (i !== 0) await sleep(sleepTime);
        await update(store, url);
    }

    let { domain } = store.getState();
    let { url, searchResults } = getCurrentAppCatalog(store);

    searchResults = searchResults.filter(url => {
        let thread = domain.threads.get(url);
        return thread.isActive;
    });

    store.dispatch(setAppCatalogs({ url, searchResults }));
}

function getUpdateTargets(store) {
    let { searchResults } = getCurrentAppCatalog(store);
    let { threads } = getCurrentCatalog(store);

    if (searchResults.length === 0) return [];

    let targets = [];
    for (let url of searchResults) {
        if (contains(threads, url)) continue;
        targets.push(url);
    }

    return targets;
}

function contains(threads, url) {
    for (let threadUrl of threads) {
        if (threadUrl === url) return true;
    }
    return false;
}

export const internal = {
    getUpdateTargets
};
