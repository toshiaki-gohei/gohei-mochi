'use strict';
import * as util from './util/check-target';
import { addDelreqs } from '../task';
import { register } from '../worker';

export const addDelreqTargets = util.makeAdd('delreq', 'delreqs');

export const setDelreqTargets = util.makeSet('delreq');

const removeDelreqTargets = util.makeRemove('delreq');

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
