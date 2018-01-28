'use strict';
import { createReducer } from '../util';
import { F } from '~/common/util';

const STATE = create();

function create(opts) {
    let {
        panel = createPanel(),
        postsPopups = []
    } = opts || {};

    F(panel);
    F(postsPopups);

    return F({ panel, postsPopups });
}

function createPanel(opts) {
    let { isOpen = null, type = null } = opts || {};
    return F({ isOpen, type });
}


export default createReducer(STATE, {
    'SET_UI_THREAD': reduce
});

function reduce(state = STATE, action) {
    let { ui } = action;
    if (ui == null) return state;

    let panel = reducePanel(state.panel, ui.panel);

    let newState = { ...state, ...ui, panel };

    return create(newState);
}

function reducePanel(prev, next) {
    if (next == null || next === prev) return prev;
    return createPanel({ ...prev, ...next });
}

export const internal = {
    create,
    reduce
};
