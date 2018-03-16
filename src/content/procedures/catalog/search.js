'use strict';
import { setAppCatalogs } from '../../reducers/actions';
import { getCurrentCatalog, getCurrentAppCatalog } from '../../reducers/getters';

export default search;

export function search(store, query) {
    let { domain } = store.getState();

    let { threads } = getCurrentCatalog(store);
    threads = threads.map(url => domain.threads.get(url));

    let searchResults = _search(query, threads).map(thread => thread.url);

    let app = getCurrentAppCatalog(store);
    if (_equals(searchResults, app.searchResults)) return;

    store.dispatch(setAppCatalogs({ url: app.url, searchResults }));
}

function _search(query, threads) {
    if (query.isEmpty()) return [];
    if (query.and) return searchAnd(query, threads);
    if (query.or) return searchOr(query, threads);
    return [];
}

function _equals(results1, results2) {
    if (results1.length !== results2.length) return false;
    for (let i = 0, len = results1.length; i < len; ++i) {
        if (results1[i] !== results2[i]) return false;
    }
    return true;
}

function searchAnd(query, threads) {
    for (let word of _words(query)) {
        let { hits } = _divide(word, threads);
        threads = hits;
    }

    return threads;
}

function searchOr(query, threads) {
    let ret = [];

    for (let word of _words(query)) {
        let { hits, notHits } = _divide(word, threads);
        threads = notHits;
        ret = ret.concat(hits);
    }

    return ret;
}

function _words(query) {
    let { title } = query;
    let words = title.split(' ');
    return words.filter(word => {
        if (word === '') return false;
        return true;
    });
}

function _divide(word, threads) {
    let hits = [], notHits = [];

    word = word.toLowerCase();

    for (let thread of threads) {
        let title = thread.title.toLowerCase();
        if (title.includes(word)) {
            hits.push(thread);
        } else {
            notHits.push(thread);
        }
    }

    return { hits, notHits };
}

export const internal = {
    _search,
    _words
};
