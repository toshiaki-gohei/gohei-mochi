'use strict';
import { createReducer } from '../util';
import { F } from '~/common/util';

const STATE = create();

export function create(opts) {
    let {
        panel: { isOpen = null, type = null } = {},
        postsPopups = []
    } = opts || {};

    let panel = F({ isOpen, type });
    F(postsPopups);

    return F({ panel, postsPopups });
}

export default createReducer(STATE, {
    'SET_UI_THREAD': reduce
});

function reduce(state = STATE, action) {
    let { ui } = action;
    if (ui == null) return state;

    let { panel } = ui;
    panel = { ...state.panel, ...panel };

    let newState = { ...state, ...ui, panel };

    return create(newState);
}

export const internal = {
    reduce
};
