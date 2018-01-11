'use strict';
import { createReducer } from '../util';
import { F } from '~/common/util';

const STATE = F(new Map());

export function create(opts) {
    let {
        post = null, // post id
        url = null,
        form: {
            reason = null,
            mode = null,
            b = null,  // board
            d = null,  // post no
            dlv = null // fixed with 0?
        } = {},
        status = null, // null -> stanby -> posting -> done(complete|cancel|error)
        res
    } = opts || {};

    let form = F({ mode, b, d, dlv, reason });
    res = createRes(res);

    return F({ post, url, form, status, res });
}

function createRes(opts) {
    if (opts == null) return null;
    let { ok = null, status = null, statusText = null } = opts;
    return F({ ok, status, statusText });
}


export default createReducer(STATE, {
    'SET_APP_DELREQS': reduce
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

const DELREQ = create();

function reduceDelreq(state = DELREQ, delreq) {
    if (delreq == null) return state;

    let { form, res } = delreq;
    form = { ...state.form, ...form };
    res = res ? { ...state.res, ...res } : null;

    let newState = { ...state, ...delreq, form, res };

    return create(newState);
}

export const internal = {
    reduce
};
