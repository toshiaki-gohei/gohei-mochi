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

    let { title, thumb } = pref;
    title = { ...state.title, ...title };
    thumb = { ...state.thumb, ...thumb };

    let newState = { ...state, ...pref, title, thumb };

    return preferences.create(newState);
}

export const internal = {
    reduce
};
