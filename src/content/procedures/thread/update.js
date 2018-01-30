'use strict';
import { setDomainPosts, setDomainThreads, setAppThreads } from '../../reducers/actions';
import * as model from '../../model';
import fetch from '../../util/fetch';

const { Post, HttpRes, thread: { Changeset, IdipIndex, createPosts } } = model;

export default update;

export async function update(store, url) {
    let { app } = store.getState();

    if (url == null) url = app.current.thread;
    if (url == null) throw new TypeError('request url is required');

    store.dispatch(setAppThreads({ url, changeset: null, isUpdating: true }));

    let opts = options(app.threads.get(url));

    let lastUpdatedByUser = new Date();

    let res = await fetch.getThread(url, opts);

    store.dispatch(setAppThreads({ url, isUpdating: false, lastUpdatedByUser }));

    setRes(store, { url, res });
}

function options(thread) {
    let { updateHttpRes: res } = thread;
    if (res == null) return null;
    let headers = res.reqHeaders;
    return { headers };
}

function setRes(store, { url, res }) {
    let { domain, app } = store.getState();

    let { updateHttpRes } = app.threads.get(url);
    updateHttpRes = updateHttpRes ? updateHttpRes.unify(res) : new HttpRes(res);

    if (!res.ok) {
        store.dispatch(setAppThreads({ url, updateHttpRes }));
        return;
    }

    let { thread, messages, postform, delform } = res.contents;

    let newPosts = createPosts(thread.posts, url);
    let { posts, changeset } = merge(domain.posts, newPosts);

    thread.url = url;
    thread.posts = newPosts.map(post => post.id);

    let appThread = {
        url,
        messages, postform, delform,
        changeset,
        idipIndex: new IdipIndex(posts),
        updateHttpRes
    };

    store.dispatch(setDomainPosts(posts));
    store.dispatch(setDomainThreads(thread));
    store.dispatch(setAppThreads(appThread));
}

function merge(storePosts, newPosts) {
    let newPostsCount = 0;
    let changes = [];

    let posts = newPosts.map(postB => {
        let a = storePosts.get(postB.id);
        let b = postB;

        if (a == null) {
            ++newPostsCount;
            return b;
        }

        if (!Post.diff(a, b)) return a;

        let { post, change } = Post.merge(a, b);
        changes.push(change);

        return post;
    });

    let changeset = new Changeset({ changes, newPostsCount });

    return { posts, changeset };
}

export const internal = {
    merge
};
