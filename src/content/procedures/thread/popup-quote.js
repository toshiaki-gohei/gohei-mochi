'use strict';
import { setUiThread } from '../../reducers/actions';
import { getCurrentThread, getThreadPosts } from '../../reducers/getters';
import { add, remove } from '../popup';
import { findQuotedPost } from '../../model/thread';
import { removeQuoteMark } from '../../util/html';

export function openQuotePopup(store, opts) {
    let { component, index, quote, event } = opts;

    let thread = getCurrentThread(store);
    let { url } = thread;

    let posts = getThreadPosts(store, url);
    quote = removeQuoteMark(quote);

    let quotedPost = findQuotedPost(posts, { index, quote });
    if (quotedPost == null) return;

    let { app } = store.getState();
    app = app.threads.get(url);

    let props = { posts: [ quotedPost ], app, thread, event };
    _open(store, { component, props });
}

function _open(store, opts) {
    let popupId = add(store, opts);

    let { ui } = store.getState();
    let quotePopups = ui.thread.quotePopups.concat(popupId);

    store.dispatch(setUiThread({ quotePopups }));

    return popupId;
}

export function closeQuotePopup(store) {
    let { ui } = store.getState();

    let popups = ui.thread.quotePopups;
    if (popups.length === 0) return;

    popups = popups.slice();
    let id = popups.pop();

    store.dispatch(setUiThread({ quotePopups: popups }));

    remove(store, id);
}

export function clearQuotePopup(store) {
    let { ui } = store.getState();

    let popups = ui.thread.quotePopups;
    if (popups.length === 0) return;

    remove(store, popups);

    store.dispatch(setUiThread({ quotePopups: [] }));
}

export const internal = {
    _open
};
