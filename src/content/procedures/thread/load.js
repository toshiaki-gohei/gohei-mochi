'use strict';
import { setDomainPosts, setDomainThreads, setAppThreads } from '../../reducers/actions';
import * as model from '../../model';

const { HttpRes, thread: { IdipIndex, createPosts } } = model;

export function load(store, contents) {
    let { url, thread: { title, posts, expire },
          messages, postform, delform, lastModified } = contents;

    posts = createPosts(posts, url);

    let thread = {
        url, title, expire,
        posts: posts.map(post => post.id),
        updatedAt: new Date(lastModified),
        isActive: true
    };

    let appThread = {
        url,
        messages, postform, delform,
        idipIndex: new IdipIndex(posts),
        httpRes: new HttpRes({ status: 200, lastModified })
    };

    store.dispatch(setDomainPosts(posts));
    store.dispatch(setDomainThreads(thread));
    store.dispatch(setAppThreads(appThread));
}
