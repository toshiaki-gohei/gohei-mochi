'use strict';
import { getThreadPosts } from '../reducers/getters';

export function post(store, id) {
    if (id == null) throw new Error('post id is required');
    let { domain } = store.getState();
    return domain.posts.get(id) || null;
}

export function thread(store, url) {
    if (url == null) throw new Error('thread url is required');
    let { domain } = store.getState();
    return domain.threads.get(url) || null;
}

export function threadPosts(store, url) {
    return getThreadPosts(store, url);
}

export function appThread(store, url) {
    if (url == null) throw new Error('thread url is required');
    let { app } = store.getState();
    return app.threads.get(url) || null;
}

export function preferences(store) {
    let { ui } = store.getState();
    return ui.preferences;
}
