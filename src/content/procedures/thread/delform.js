'use strict';
import * as util from './util/check-target';
import { addPostdels } from '../task';
import { register } from '../worker';

export const addDelformTargets = util.makeAdd('delform', 'postdels');

export const setDelformTargets = util.makeSet('delform');

export const removeDelformTargets = util.makeRemove('delform');

export const clearDelformTargets = util.makeClear('delform');

export async function registerPostdelTasks(store, opts) {
    let { url, ...form } = opts || {};

    let { app } = store.getState();
    let { delform } = app.threads.get(url);

    let postIds = [];
    for (let [ , { post, checked } ] of delform.targets) {
        if (!checked) continue;
        postIds.push(post);
    }
    removeDelformTargets(store, { url, postIds });

    let posts = postIds;
    let status = 'stanby';
    await addPostdels(store, { url, posts, ...form, status });

    let tasks = postIds;
    await register(store, 'postdel', tasks);
}

export const internal = {
    removeDelformTargets
};
