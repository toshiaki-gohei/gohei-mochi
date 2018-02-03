'use strict';
import { setAppThreads } from '~/content/reducers/actions';
import { createCheckTarget } from '~/content/reducers/app/threads';
import * as util from './util/check-target';
import { addDelreqs } from '../task';
import { register } from '../worker';

export function addDelreqTargets(store, { url, postId, postIds }) {
    let { app } = store.getState();
    if (url == null) url = app.current.thread;
    if (url == null) throw new TypeError('thread url is required');

    if (postId != null) postIds = [ postId ];
    if (postIds == null || postIds.length === 0) return;

    let { delreq } = app.threads.get(url);

    postIds = util.uniq(postIds, delreq.targets);
    if (postIds.length === 0) return;

    let targets = new Map(delreq.targets);
    for (let key of postIds) {
        let checked = app.tasks.delreqs.has(key) ? false : true;
        let target = createCheckTarget({ post: key, checked });
        targets.set(key, target);
    }

    delreq = { targets };
    store.dispatch(setAppThreads({ url, delreq }));
}

export const setDelreqTargets = util.makeSet('delreq');

export const removeDelreqTargets = util.makeRemove('delreq');

export const clearDelreqTargets = util.makeClear('delreq');

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
