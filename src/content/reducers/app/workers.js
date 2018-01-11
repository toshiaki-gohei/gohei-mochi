'use strict';
import { createReducer } from '../util';
import { F } from '~/common/util';

const STATE = F({
    delreq: create()
});

export function create(opts) {
    let {
        tasks = [],
        id = null
    } = opts || {};

    tasks = F(tasks || []);

    return F({ tasks, id });
}

export default createReducer(STATE, {
    'SET_APP_WORKERS': reduce,
    'CLEAR_APP_WORKER_ID': clearWorkerId
});

function reduce(state = STATE, action) {
    let { delreq } = action;

    delreq = reduceWorker(state.delreq, delreq);

    let newState = {
        delreq
    };

    return F(newState);
}

function clearWorkerId(state = STATE, action) {
    let { worker } = action;

    let newState = { ...state };

    newState[worker] = create({ ...state[worker], id: null });

    return F(newState);
}

const WORKER = create();

function reduceWorker(state = WORKER, worker) {
    if (worker == null) return state;

    let id = state.id ? state.id : worker.id;

    let newState = { ...state, ...worker, id };

    return create(newState);
}

export const internal = {
    reduce,
    clearWorkerId
};
