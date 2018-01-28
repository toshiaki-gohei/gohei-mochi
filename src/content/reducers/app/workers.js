'use strict';
import { createReducer } from '../util';
import { F } from '~/common/util';

const STATE = F({
    delreq: createWorker(),
    postdel: createWorker()
});

function createWorker(opts) {
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
    let { delreq, postdel } = action;

    delreq = reduceWorker(state.delreq, delreq);
    postdel = reduceWorker(state.postdel, postdel);

    let newState = {
        delreq,
        postdel
    };

    return F(newState);
}

function clearWorkerId(state = STATE, action) {
    let { worker } = action;

    let newState = { ...state };

    newState[worker] = createWorker({ ...state[worker], id: null });

    return F(newState);
}

const WORKER = createWorker();

function reduceWorker(prev = WORKER, next) {
    if (next == null) return prev;
    if (prev.id != null && prev.id !== next.id) return prev;

    let newState = { ...prev, ...next };

    return createWorker(newState);
}

export const internal = {
    createWorker,
    reduce,
    clearWorkerId
};
