'use strict';
import { setAppThreads } from '../../reducers/actions';
import { add } from '../delreq';
import { register } from '../worker';

export function addDelreqs(store, { url, id, ids }) {
    let { app } = store.getState();
    if (url == null) url = app.current.thread;
    if (url == null) throw new TypeError('thread url is required');

    if (id != null) ids = [ id ];
    if (ids == null || ids.length === 0) return;

    let { delreqs } = app.threads.get(url);

    ids = uniq(delreqs, ids);
    if (ids.length === 0) return;

    delreqs = delreqs.concat(ids);

    store.dispatch(setAppThreads({ url, delreqs }));
}

function uniq(delreqs, ids) {
    let contains = delreqs.reduce((map, postId) => {
        map.set(postId, true);
        return map;
    }, new Map());

    ids = ids.filter(id => !contains.has(id));

    return ids;
}

export function removeDelreqs(store, { url, id, ids }) {
    let { app } = store.getState();
    if (url == null) url = app.current.thread;
    if (url == null) throw new TypeError('thread url is required');

    if (id != null) ids = [ id ];
    if (ids == null || ids.length === 0) return;

    let contains = ids.reduce((map, id) => {
        map.set(id, true);
        return map;
    }, new Map());

    let { delreqs } = app.threads.get(url);
    delreqs = delreqs.filter(id => !contains.has(id));

    store.dispatch(setAppThreads({ url, delreqs }));
}

export function clearDelreqs(store, { url } = {}) {
    let { app } = store.getState();
    if (url == null) url = app.current.thread;
    if (url == null) throw new TypeError('thread url is required');

    let { delreqs } = app.threads.get(url);
    if (delreqs.length === 0) return;

    delreqs = [];
    store.dispatch(setAppThreads({ url, delreqs }));
}

export async function registerDelreqTasks(store, { url, posts, reason }) {
    let removed = posts.map(({ id }) => id);
    removeDelreqs(store, { url, ids: removed });

    let status = 'stanby';
    await add(store, { url, posts, reason, status });

    let tasks = posts.map(({ id }) => id);
    await register(store, 'delreq', tasks);
}
