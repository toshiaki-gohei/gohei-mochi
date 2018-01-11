'use strict';
import { createReducer } from '../util';
import { F } from '~/common/util';
import genId from '~/content/util/id-generator';

const STATE = F(new Map());

export function create(component, props) {
    let id = `gohei-popup-${genId()}`;

    F(component); // component: <component />
    F(props);

    return F({ id, component, props });
}

export default createReducer(STATE, {
    'SET_UI_POPUPS': reduce
});

function reduce(state = STATE, action) {
    let { popups } = action;
    if (popups == null) return state;

    let newState = popups;

    return F(newState);
}

export const internal = {
    reduce
};
