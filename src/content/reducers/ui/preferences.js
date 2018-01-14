'use strict';
import { createReducer } from '../util';
import { preferences } from '../../model';

const STATE = preferences.create();


export default createReducer(STATE, {
    'SET_UI_PREFERENCES': reduce
});

function reduce(state = STATE, action) {
    let { preferences: pref } = action;
    if (pref == null) return state;

    let newState = pref;

    return newState;
}

export const internal = {
    reduce
};
