'use strict';
import { setAppThreads } from '~/content/reducers/actions';
import { createCheckTarget } from '~/content/reducers/app/threads';

export function uniq(postIds, targets) {
    return postIds.filter(id => !targets.has(id));
}

export function makeSet(name) {
    return (store, { url, target, targets }) => {
        let { app } = store.getState();
        if (url == null) url = app.current.thread;
        if (url == null) throw new TypeError('thread url is required');

        if (target != null) targets = [ target ];
        if (targets == null || targets.length === 0) {
            throw new Error('target or targets is required');
        }

        let container = app.threads.get(url)[name];
        let newTargets = new Map(container.targets);

        for (let target of targets) {
            let key = target.post;
            if (!newTargets.has(key)) throw new Error(`${name} target not found: ${key}`);
            target = createCheckTarget(target);
            newTargets.set(key, target);
        }

        container = { targets: newTargets };
        store.dispatch(setAppThreads({ url, [name]: container }));
    };
}

export function makeRemove(name) {
    return (store, { url, postId, postIds }) => {
        let { app } = store.getState();
        if (url == null) url = app.current.thread;
        if (url == null) throw new TypeError('thread url is required');

        if (postId != null) postIds = [ postId ];
        if (postIds == null || postIds.length === 0) return;

        let removed = postIds.reduce((map, id) => {
            map.set(id, true);
            return map;
        }, new Map());

        let container = app.threads.get(url)[name];

        let targets = new Map();
        for (let [ key, target ] of container.targets) {
            if (removed.has(key)) continue;
            targets.set(key, target);
        }

        container = { targets };
        store.dispatch(setAppThreads({ url, [name]: container }));
    };
}

export function makeClear(name) {
    return (store, { url } = {}) => {
        let { app } = store.getState();
        if (url == null) url = app.current.thread;
        if (url == null) throw new TypeError('thread url is required');

        let container = app.threads.get(url)[name];
        if (container.targets.size === 0) return;

        container = { targets: new Map() };
        store.dispatch(setAppThreads({ url, [name]: container }));
    };
}
