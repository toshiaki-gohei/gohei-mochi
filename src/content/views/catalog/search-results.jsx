'use strict';
import React from 'react';
import Item from './item.jsx';

export default function SearchResults({ commit, searchResults = [], preferences }) {
    if (commit == null) return null;

    let threads = searchResults.map(url => commit('sync/thread', url));
    let $items = threads.map((thread, index) => <Item {...{ thread, preferences }} key={index} />);

    return <ol className="gohei-catalog gohei-search-results">{$items}</ol>;
}
