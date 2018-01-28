'use strict';
import { setAppWorkers } from '../../reducers/actions';
import { submitDelreq } from '../task';
import { sleep } from '~/content/util';

const SLEEP_TIME = 5 * 1000;

export default async function run(store, opts) {
    while (targets(store).length > 0) {
        await _run(store, opts);
    }
}

async function _run(store, opts) {
    let { sleepTime = SLEEP_TIME } = opts || {};

    let count = 0;
    for (let delreq of targets(store)) {
        if (count++ !== 0) await sleep(sleepTime);
        await submitDelreq(store, delreq);
    }

    let tasks = remainders(store).map(({ post }) => post);
    store.dispatch(setAppWorkers({ delreq: { tasks } }));
}

function delreqs(store) {
    let { app } = store.getState();
    let worker = app.workers.delreq;
    return worker.tasks.map(postId => app.tasks.delreqs.get(postId));
}

function targets(store) {
    return delreqs(store).filter(delreq => !isDone(delreq));
}

function isDone(delreq) {
    let { status } = delreq;
    switch (status) {
    case 'complete':
    case 'cancel':
    case 'error':
        return true;
    default:
        return false;
    }
}

function remainders(store) {
    return delreqs(store).filter(delreq => delreq.status !== 'complete');
}
