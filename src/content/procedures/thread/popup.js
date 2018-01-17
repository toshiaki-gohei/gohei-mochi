'use strict';
import { setUiThread } from '../../reducers/actions';
import { getCurrentThread, getThreadPosts } from '../../reducers/getters';
import { add, remove } from '../popup';
import { findQuotedPost } from '../../model/thread';
import { removeQuoteMark } from '../../util/html';

export function openPostsPopup(store, opts) {
    let { component, posts, event } = opts;

    let state = store.getState();
    let thread = getCurrentThread(store);
    let app = state.app.threads.get(thread.url);

    let props = { posts, app, thread, event };
    return _open(store, { component, props });
}

export function openQuotePopup(store, opts) {
    let { component, index, quote, event } = opts;

    let thread = getCurrentThread(store);

    let posts = getThreadPosts(store, thread.url);
    quote = removeQuoteMark(quote);

    let quotedPost = findQuotedPost(posts, { index, quote });
    if (quotedPost == null) return;

    openPostsPopup(store, { component, posts: [ quotedPost ], event });
}

function _open(store, opts) {
    let popupId = add(store, opts);

    let { ui } = store.getState();
    let postsPopups = ui.thread.postsPopups.concat(popupId);

    store.dispatch(setUiThread({ postsPopups }));

    return popupId;
}

export function closePostsPopup(store) {
    let { ui } = store.getState();

    let popups = ui.thread.postsPopups;
    if (popups.length === 0) return;

    popups = popups.slice();
    let id = popups.pop();

    remove(store, id);
    store.dispatch(setUiThread({ postsPopups: popups }));
}

export function clearPostsPopup(store) {
    let { ui } = store.getState();

    let popups = ui.thread.postsPopups;
    if (popups.length === 0) return;

    remove(store, popups);
    store.dispatch(setUiThread({ postsPopups: [] }));
}
