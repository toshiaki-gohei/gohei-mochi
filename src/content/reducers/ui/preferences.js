'use strict';
import { createReducer } from '../util';
import { preferences } from '../../model';

const STATE = preferences.create();


export default createReducer(STATE, {
    'SET_UI_PREFERENCES': reduce
});

function reduce(state = STATE, action) {
    let { preferences: prefs } = action;
    if (prefs == null) return state;

    let newState = prefs;

    return newState;
}

export const internal = {
    reduce
};
