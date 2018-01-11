'use strict';
import { createReducer } from '../util';
import { F } from '~/common/util';

const STATE = create();

export function create(opts) {
    let {
        thread = null,
        catalog = null
    } = opts || {};
    return F({ thread, catalog });
}


export default createReducer(STATE, {
    'SET_APP_CURRENT': reduce
});


function reduce(state = STATE, action) {
    let { current } = action;
    if (current == null) return state;

    let newState = { ...state, ...current };

    return create(newState);
}

export const internal = {
    reduce
};
