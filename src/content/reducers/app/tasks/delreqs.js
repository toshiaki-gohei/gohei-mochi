'use strict';
import { createReducer } from '../../util';
import { createRes, reduceRes } from './common';
import { F } from '~/common/util';

const STATE = F(new Map());

export function createDelreq(opts) {
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
        reason = null,
        mode = null,
        b = null,  // board
        d = null,  // post no
        dlv = null // fixed with 0?
    } = opts || {};
    return F({ reason, mode, b, d, dlv });
}


export default createReducer(STATE, {
    'SET_APP_TASKS_DELREQS': reduce
});

function reduce(state = STATE, action) {
    let { delreq, delreqs } = action;
    if (delreq) delreqs = [ delreq ];
    if (delreqs == null || delreqs.length === 0) return state;

    let newState = new Map(state);

    for (let delreq of delreqs) {
        let { post: postId } = delreq;
        if (postId == null) throw new Error('post id is required');

        let newDelreq = reduceDelreq(state.get(postId), delreq);
        newState.set(postId, newDelreq);
    }

    return F(newState);
}

const DELREQ = createDelreq();

function reduceDelreq(prev = DELREQ, next) {
    if (next == null) return prev;

    let form = reduceForm(prev.form, next.form);
    let res = reduceRes(prev.res, next.res);

    let newState = { ...prev, ...next, form, res };

    return createDelreq(newState);
}

function reduceForm(prev, next) {
    if (next == null || next === prev) return prev;
    return createForm({ ...prev, ...next });
}

export const internal = {
    reduce
};
