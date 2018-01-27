'use strict';
import { setDomainPosts, setDomainThreads, setAppThreads } from '../../reducers/actions';
import * as model from '../../model';

const { HttpRes, thread: { IdipIndex, createPosts } } = model;

export function load(store, contents) {
    let { url, thread, messages, postform, delform, lastModified } = contents;

    let posts = createPosts(thread.posts, url);

    thread.url = url;
    thread.posts = posts.map(post => post.id);

    let appThread = {
        url,
        messages, postform, delform,
        idipIndex: new IdipIndex(posts),
        updateHttpRes: new HttpRes({ lastModified })
    };

    store.dispatch(setDomainPosts(posts));
    store.dispatch(setDomainThreads(thread));
    store.dispatch(setAppThreads(appThread));
}
