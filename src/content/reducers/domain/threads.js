'use strict';
import { createReducer } from '../util';
import { F } from '~/common/util';

const STATE = F(new Map());

export function create(opts) {
    let {
        url = null,
        title = null,
        posts = POSTS,
        expire,

        postnum = null,
        newPostnum = null,
        thumb
    } = opts || {};

    F(posts);
    expire = createExpire(expire);
    thumb = createThumb(thumb);

    return F({
        url, title, posts, expire,
        postnum, newPostnum, thumb
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

function reduceThread(state = THREAD, thread) {
    if (thread == null) return state;

    let { expire, thumb } = thread;
    expire = expire ? { ...state.expire, ...expire } : null;
    thumb = thumb ? { ...state.thumb, ...thumb } : null;

    let newState = { ...state, ...thread, expire, thumb };

    return create(newState);
}

export const internal = {
    reduce
};
