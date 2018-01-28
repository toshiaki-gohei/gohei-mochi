'use strict';
import { createReducer } from '../../util';
import { createRes, reduceRes } from './common';
import { F } from '~/common/util';

const STATE = F(new Map());

export function createPostdel(opts) {
    let {
        post = null, // post id
        url = null,
        form = createForm(),
        status = null, // null -> stanby -> posting -> done(complete|cancel|error)
        res = createRes()
    } = opts || {};

    F(form);
    F(res);

    return F({ post, url, form, status, res });
}

function createForm(opts) {
    let {
        // not have the delete target poperty because can not be determine (e.g. 12345: delete)
        mode = null, // usrdel
        onlyimgdel = null,
        pwd = null
    } = opts || {};
    return F({ mode, onlyimgdel, pwd });
}


export default createReducer(STATE, {
    'SET_APP_TASKS_POSTDELS': reduce
});

function reduce(state = STATE, action) {
    let { postdel, postdels } = action;
    if (postdel) postdels = [ postdel ];
    if (postdels == null || postdels.length === 0) return state;

    let newState = new Map(state);

    for (let postdel of postdels) {
        let { post: postId } = postdel;
        if (postId == null) throw new Error('post id is required');

        let newPostdel = reducePostdel(state.get(postId), postdel);
        newState.set(postId, newPostdel);
    }

    return F(newState);
}

const POSTDEL = createPostdel();

function reducePostdel(prev = POSTDEL, next) {
    if (next == null) return prev;

    let form = reduceForm(prev.form, next.form);
    let res = reduceRes(prev.res, next.res);

    let newState = { ...prev, ...next, form, res };

    return createPostdel(newState);
}

function reduceForm(prev, next) {
    if (next == null || next === prev) return prev;
    return createForm({ ...prev, ...next });
}

export const internal = {
    reduce
};
