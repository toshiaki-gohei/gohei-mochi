'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/worker';
import createStore from '~/content/reducers';
import { externals } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => store = createStore());

    const getWorkers = () => store.getState().app.workers;

    describe('export', () => {
        it('should export functions', () => {
            let got = externals(procedures).every(fn => typeof fn === 'function');
            assert(got === true);
        });
    });

    describe('register()', () => {
        const { register } = procedures;

        it('should register tasks', () => {
            register(store, 'delreq', [ 'task-delreq01', 'task-delreq02' ]);

            let got = getWorkers();
            let exp = {
                delreq: { tasks: [ 'task-delreq01', 'task-delreq02' ], id: null },
                postdel: { tasks: [], id: null }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should register tasks if tasks already exists', () => {
            register(store, 'delreq', [ 'delreq01', 'delreq02' ]);
            register(store, 'delreq', [ 'delreq03', 'delreq04' ]);

            let got = getWorkers();
            let exp = {
                delreq: {
                    tasks: [ 'delreq01', 'delreq02', 'delreq03', 'delreq04' ],
                    id: null
                },
                postdel: { tasks: [], id: null }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should throw exception if unknown worker', () => {
            let got;
            try { register(store, 'unknown-worker'); } catch (e) { got = e.message; }
            assert(got === 'unknown worker: unknown-worker');
        });
    });

    describe('run()', () => {
        const { run } = procedures;
        const { workers } = procedures.internal;

        let backup;
        beforeEach(() => backup = workers.delreq);
        afterEach(() => workers.delreq = backup);

        it('should run worker', async () => {
            workers.delreq = arg => {
                assert(arg === store);
                let got = getWorkers().delreq.id;
                assert(got !== null);
                return Promise.resolve();
            };

            await run(store, 'delreq');

            let got = getWorkers().delreq.id;
            assert(got === null);
        });

        it('should do nothing if worker already is running', () => {
            workers.delreq = () => new Promise(resolve => {
                setTimeout(resolve, 50);
            });
            let p1 = run(store, 'delreq');

            let beforeId = getWorkers().delreq.id;
            assert(beforeId != null);

            workers.delreq = () => { throw new Error('not reach here'); };
            let p2 = run(store, 'delreq');

            let afterId = getWorkers().delreq.id;
            assert(beforeId === afterId);
            
            return Promise.all([ p1, p2 ]);
        });

        it('should throw exception if unknown worker', async () => {
            let got;
            try { await run(store, 'unknown-worker'); } catch (e) { got = e.message; }
            assert(got === 'unknown worker: unknown-worker');
        });
    });
});
