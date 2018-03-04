'use strict';
import { setDomainPosts, setDomainThreads, setAppThreads } from '../../reducers/actions';
import * as model from '../../model';
import getReplynum from './util/replynum';

const { HttpRes, thread: { IdipIndex, createPosts } } = model;

export function load(store, contents) {
    let { url, thread: { title, posts, expire },
          messages, postform, delform, lastModified } = contents;

    posts = createPosts(posts, url);

    let { replynum, newReplynum } = getReplynum(store, { url, posts });

    let thread = {
        url, title, expire,
        replynum, newReplynum,
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
