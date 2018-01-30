'use strict';
import { setAppWorkers } from '../../reducers/actions';
import { submitPostdel } from '../task';
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
    for (let postdel of targets(store)) {
        if (count++ !== 0) await sleep(sleepTime);
        await submitPostdel(store, postdel);
    }

    let tasks = remainders(store).map(({ post }) => post);
    store.dispatch(setAppWorkers({ postdel: { tasks } }));
}

function postdels(store) {
    let { app } = store.getState();
    let worker = app.workers.postdel;
    return worker.tasks.map(postId => app.tasks.postdels.get(postId));
}

function targets(store) {
    return postdels(store).filter(postdel => !isDone(postdel));
}

function isDone(postdel) {
    let { status } = postdel;
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
    return postdels(store).filter(postdel => postdel.status !== 'complete');
}
