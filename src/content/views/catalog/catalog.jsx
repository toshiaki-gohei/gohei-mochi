'use strict';
import React from 'react';
import { F } from '~/common/util';

export default function Catalog({ commit, catalog = {}, preferences = {} }) {
    if (commit == null) return null;

    let urls = catalog.threads;

    preferences = preferences.catalog || {};
    let { colnum, rownum } = preferences;
    if (colnum == null || rownum == null) urls = [];

    let threads = urls.slice(0, colnum * rownum).map(url => commit('sync/thread', url));
    let $items = threads.map((thread, index) => <Item {...{ thread, preferences }} key={index} />);

    return <ol className="gohei-catalog">{$items}</ol>;
}

function Item({ thread, preferences }) {
    let { url, title, postnum, newPostnum, thumb } = thread;
    let { colnum } = preferences;

    let width = Math.floor(100 / colnum * 100) / 100 + '%';
    let newly = newPostnum == null ? 'new' : `+${newPostnum}`;

    return (
<li className="gohei-catalog-item" style={{ width }} >
  <div className="gohei-border-container">
    <Thumb {...{ url, thumb, preferences }} />
    <div className="gohei-thread-title">{title}</div>
    <div className="gohei-font-smaller">
      <span className="gohei-thread-postnum">{postnum}</span>
      <span className="gohei-thread-newpostnum">{newly}</span>
    </div>
  </div>
</li>
    );
}

function Thumb({ url, thumb, preferences: prefs }) {
    let size = THUMB_SIZE[prefs.thumb.size] + 'px';
    return (
<a href={url} target="_blank"
   className="gohei-thread-thumb" style={{ width: size, height: size }}>
  <Image {...{ thumb }} />
</a>
    );
}

function Image({ thumb }) {
    if (thumb == null) return null;

    let width = thumb.width + 'px';
    let height = thumb.height + 'px';

    // eslint-disable-next-line jsx-a11y/alt-text
    return <img src={thumb.url} style={{ width, height }} />;
}

const THUMB_SIZE = F({
    0: 50, 1: 75, 2: 100, 3: 125, 4: 150, 5: 175, 6: 250
});
