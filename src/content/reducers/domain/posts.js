'use strict';
import { createReducer } from '../util';
import { F } from '~/common/util';

const STATE = F(new Map());

export default createReducer(STATE, {
    'SET_DOMAIN_POSTS': reduce
});

function reduce(state = STATE, action) {
    let { post, posts } = action;
    if (post) posts = [ post ];
    if (posts == null || posts.length === 0) return state;

    let newState = new Map(state);

    for (let post of posts) {
        if (post.id == null) throw new Error(`post id is required: no=${post.no}`);
        newState.set(post.id, post); // post is model/post
    }

    return F(newState);
}

export const internal = {
    reduce
};
