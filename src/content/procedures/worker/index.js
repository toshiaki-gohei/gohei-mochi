'use strict';
import { setAppWorkers, clearAppWorkerId } from '../../reducers/actions';
import delreq from './delreq';
import genId from '../../util/id-generator';

const workers = {
    delreq
};

export function register(store, name, tasks) {
    let { app } = store.getState();
    let worker = app.workers[name];
    if (worker == null) throw new Error(`unknown worker: ${name}`);

    tasks = worker.tasks.concat(tasks);

    store.dispatch(setAppWorkers({ [name]: { tasks } }));
}

export async function run(store, name) {
    let fn = workers[name];
    if (fn == null) throw new Error(`unknown worker: ${name}`);

    let id = genId();
    store.dispatch(setAppWorkers({ [name]: { id } }));

    let { app } = store.getState();
    let worker = app.workers[name];

    if (worker.id !== id) return;

    await fn(store);

    store.dispatch(clearAppWorkerId(name));
}

export const internal = {
    workers
};
