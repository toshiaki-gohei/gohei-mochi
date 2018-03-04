'use strict';
import { setDomainPosts, setDomainThreads, setAppThreads } from '../../reducers/actions';
import * as model from '../../model';
import fetch from '../../util/fetch';

const { Post, thread: { Changeset, IdipIndex, createPosts } } = model;

export default update;

export async function update(store, url) {
    let { app } = store.getState();

    if (url == null) url = app.current.thread;
    if (url == null) throw new TypeError('request url is required');

    store.dispatch(setAppThreads({ url, changeset: null, isUpdating: true }));

    let opts = options(store, { url });

    let updatedAt = new Date();

    let res = await fetch.getThread(url, opts);

    store.dispatch(setAppThreads({ url, isUpdating: false, updatedAt }));

    setResponse(store, { url, res });
}

function options(store, { url }) {
    let { app } = store.getState();
    let { httpRes } = app.threads.get(url);
    let headers = httpRes.reqHeaders;
    return { headers };
}

function setResponse(store, { url, res }) {
    let { domain, app } = store.getState();

    let { httpRes } = app.threads.get(url);
    httpRes = httpRes.clone(res);

    let isActive = httpRes.status === 404 ? false : true;
    let updatedAt = getThreadUpdatedAt(store, { url, httpRes });

    if (!res.ok) {
        store.dispatch(setDomainThreads({ url, isActive, updatedAt }));
        store.dispatch(setAppThreads({ url, httpRes }));
        return;
    }

    let { thread: { title, posts: newPosts, expire },
          messages, postform, delform } = res.contents;

    newPosts = createPosts(newPosts, url);
    let { posts, changeset } = merge(domain.posts, newPosts);

    let thread = {
        url, title, expire,
        posts: posts.map(post => post.id),
        updatedAt, isActive
    };

    let appThread = {
        url,
        messages, postform, delform,
        changeset,
        idipIndex: new IdipIndex(posts),
        httpRes
    };

    store.dispatch(setDomainPosts(posts));
    store.dispatch(setDomainThreads(thread));
    store.dispatch(setAppThreads(appThread));
}

function getThreadUpdatedAt(store, { url, httpRes }) {
    let { domain } = store.getState();
    let { updatedAt } = domain.threads.get(url);

    switch (httpRes.status) {
    case 200:
        return new Date(httpRes.lastModified);
    case 304:
    default:
        return updatedAt;
    }
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
