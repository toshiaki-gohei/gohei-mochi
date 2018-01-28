'use strict';
import { setAppThreads } from '../../reducers/actions';
import { createDelreqTarget } from '../../reducers/app/threads';
import { addDelreqs } from '../task';
import { register } from '../worker';

export function addDelreqTargets(store, { url, postId, postIds }) {
    let { app } = store.getState();
    if (url == null) url = app.current.thread;
    if (url == null) throw new TypeError('thread url is required');

    if (postId != null) postIds = [ postId ];
    if (postIds == null || postIds.length === 0) return;

    let { delreq } = app.threads.get(url);

    postIds = uniq(delreq.targets, postIds);
    if (postIds.length === 0) return;

    let targets = new Map(delreq.targets);
    for (let key of postIds) {
        let checked = app.tasks.delreqs.has(key) ? false : true;
        let target = createDelreqTarget({ post: key, checked });
        targets.set(key, target);
    }

    delreq = { targets };
    store.dispatch(setAppThreads({ url, delreq }));
}

function uniq(targets, postIds) {
    return postIds.filter(id => !targets.has(id));
}

export function setDelreqTargets(store, { url, target, targets }) {
    let { app } = store.getState();
    if (url == null) url = app.current.thread;
    if (url == null) throw new TypeError('thread url is required');

    if (target != null) targets = [ target ];
    if (targets == null || targets.length === 0) {
        throw new Error('target or targets is required');
    }

    let { delreq } = app.threads.get(url);
    let newTargets = new Map(delreq.targets);

    for (let target of targets) {
        let key = target.post;
        if (!newTargets.has(key)) throw new Error(`delreq target not found: ${key}`);
        target = createDelreqTarget(target);
        newTargets.set(key, target);
    }

    delreq = { targets: newTargets };
    store.dispatch(setAppThreads({ url, delreq }));
}

function removeDelreqTargets(store, { url, postId, postIds }) {
    let { app } = store.getState();
    if (url == null) url = app.current.thread;
    if (url == null) throw new TypeError('thread url is required');

    if (postId != null) postIds = [ postId ];
    if (postIds == null || postIds.length === 0) return;

    let removed = postIds.reduce((map, id) => {
        map.set(id, true);
        return map;
    }, new Map());

    let { delreq } = app.threads.get(url);

    let targets = new Map();
    for (let [ key, target ] of delreq.targets) {
        if (removed.has(key)) continue;
        targets.set(key, target);
    }

    delreq = { targets };
    store.dispatch(setAppThreads({ url, delreq }));
}

export function clearDelreqTargets(store, { url } = {}) {
    let { app } = store.getState();
    if (url == null) url = app.current.thread;
    if (url == null) throw new TypeError('thread url is required');

    let { delreq } = app.threads.get(url);
    if (delreq.targets.size === 0) return;

    delreq = { targets: new Map() };
    store.dispatch(setAppThreads({ url, delreq }));
}

export async function registerDelreqTasks(store, { url, reason }) {
    let { app } = store.getState();
    let { delreq } = app.threads.get(url);

    let postIds = [];
    for (let [ , { post, checked } ] of delreq.targets) {
        if (!checked) continue;
        postIds.push(post);
    }

    removeDelreqTargets(store, { url, postIds });

    let posts = postIds;
    let status = 'stanby';
    await addDelreqs(store, { url, posts, reason, status });

    let tasks = postIds;
    await register(store, 'delreq', tasks);
}

export const internal = {
    removeDelreqTargets
};
