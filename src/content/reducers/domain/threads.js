'use strict';
import { createReducer } from '../util';
import { F } from '~/common/util';

const STATE = F(new Map());

function create(opts) {
    let {
        url = null,
        title = null,
        posts = POSTS,
        expire = createExpire(),

        postnum = null,
        newPostnum = null,
        thumb = createThumb(),

        createdAt = null,
        updatedAt = null,
        isActive = false
    } = opts || {};

    F(posts);
    F(expire);
    F(thumb);

    return F({
        url, title, posts, expire,
        postnum, newPostnum, thumb,
        createdAt, updatedAt, isActive
    });
}
const POSTS = F([]);

function createExpire(opts) {
    if (opts == null) return null;
    let { message = null, date = null } = opts;
    return F({ message, date });
}

function createThumb(opts) {
    if (opts == null) return null;
    let { url = null, width = null, height = null } = opts;
    return F({ url, width, height });
}


export default createReducer(STATE, {
    'SET_DOMAIN_THREADS': reduce
});

function reduce(state = STATE, action) {
    let { thread, threads } = action;
    if (thread) threads = [ thread ];
    if (threads == null || threads.length === 0) return state;

    let newState = new Map(state);

    for (let thread of threads) {
        let { url } = thread;
        if (url == null) throw new Error('thread url is required');

        let newThread = reduceThread(state.get(url), thread);
        newState.set(url, newThread);
    }

    return F(newState);
}

const THREAD = create();

function reduceThread(prev = THREAD, next) {
    if (next == null) return prev;

    let expire = reduceExpire(prev.expire, next.expire);
    let thumb = reduceThumb(prev.thumb, next.thumb);

    let newState = { ...prev, ...next, expire, thumb };

    return create(newState);
}

function reduceExpire(prev, next) {
    if (next === null) return null;
    if (next === undefined || next === prev) return prev;
    return createExpire({ ...prev, ...next });
}

function reduceThumb(prev, next) {
    if (next === null) return null;
    if (next === undefined || next === prev) return prev;
    return createThumb({ ...prev, ...next });
}

export const internal = {
    reduce
};
