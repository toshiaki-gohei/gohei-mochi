'use strict';
import { h } from 'preact';
import { F } from '~/common/util';

export default function Catalog({ commit, catalog = {}, preferences }) {
    if (commit == null) return null;

    let urls = catalog.threads;

    let { colnum, rownum } = preferences || {};
    if (colnum == null || rownum == null) urls = [];

    let threads = urls.slice(0, colnum * rownum).map(url => commit('sync/thread', url));
    let $items = threads.map((thread, index) => <Item {...{ thread, preferences }} key={index} />);

    return <ol class="gohei-catalog">{$items}</ol>;
}

function Item({ thread, preferences }) {
    let { url, title, postnum, newPostnum, thumb } = thread;
    let { colnum } = preferences;

    let width = Math.floor(100 / colnum * 100) / 100 + '%';
    let newly = newPostnum == null ? 'new' : `+${newPostnum}`;

    return (
<li class="gohei-catalog-item" style={{ width }} >
  <div class="gohei-border-container">
    <Thumb {...{ url, thumb, preferences }} />
    <div class="gohei-thread-title">{title}</div>
    <div class="gohei-font-smaller">
      <span class="gohei-thread-postnum">{postnum}</span>
      <span class="gohei-thread-newpostnum">{newly}</span>
    </div>
  </div>
</li>
    );
}

function Thumb({ url, thumb, preferences: pref }) {
    let size = THUMB_SIZE[pref.thumb.size] + 'px';
    return (
<a href={url} target="_blank"
   class="gohei-thread-thumb" style={{ width: size, height: size }}>
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
