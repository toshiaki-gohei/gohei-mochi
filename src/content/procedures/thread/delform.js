'use strict';
import { setAppThreads } from '~/content/reducers/actions';
import { createCheckTarget } from '~/content/reducers/app/threads';
import * as util from './util/check-target';

export function addDelformTargets(store, { url, postId, postIds }) {
    let { app } = store.getState();
    if (url == null) url = app.current.thread;
    if (url == null) throw new TypeError('thread url is required');

    if (postId != null) postIds = [ postId ];
    if (postIds == null || postIds.length === 0) return;

    let { delform } = app.threads.get(url);

    postIds = util.uniq(postIds, delform.targets);
    if (postIds.length === 0) return;

    let targets = new Map(delform.targets);
    for (let key of postIds) {
        let target = createCheckTarget({ post: key, checked: true });
        targets.set(key, target);
    }

    delform = { targets };
    store.dispatch(setAppThreads({ url, delform }));
}

export const setDelformTargets = util.makeSet('delform');

export const removeDelformTargets = util.makeRemove('delform');

export const clearDelformTargets = util.makeClear('delform');
