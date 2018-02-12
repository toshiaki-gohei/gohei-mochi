'use strict';
import React from 'react';
import Item from './item.jsx';

export default function Catalog({ commit, catalog = {}, preferences = {} }) {
    if (commit == null) return null;

    let urls = catalog.threads;

    let { colnum, rownum } = preferences.catalog || {};
    if (colnum == null || rownum == null) urls = [];

    let threads = urls.slice(0, colnum * rownum).map(url => commit('sync/thread', url));
    let $items = threads.map((thread, index) => <Item {...{ thread, preferences }} key={index} />);

    return <ol className="gohei-catalog">{$items}</ol>;
}
