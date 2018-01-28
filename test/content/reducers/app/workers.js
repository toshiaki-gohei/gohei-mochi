'use strict';
import assert from 'assert';
import reducer, { internal } from '~/content/reducers/app/workers';
import { F } from '~/common/util';

describe(__filename, () => {
    let state;
    beforeEach(() => state = F({
        delreq: createWorker({ tasks: [ 'delreq01', 'delreq02' ] }),
        postdel: createWorker()
    }));

    const createWorker = internal.createWorker;

    describe('export', () => {
        it('should export reducer', () => {
            let got = reducer();
            let exp = {
                delreq: { tasks: [], id: null },
                postdel: { tasks: [], id: null }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('reduce()', () => {
        const { reduce } = internal;

        it('should reduce state', () => {
            let delreq = {
                tasks: [ 'delreq01', 'delreq02', 'delreq03' ]
            };
            let action = { delreq };

            let got = reduce(state, action);
            let exp = {
                delreq: {
                    tasks: [ 'delreq01', 'delreq02', 'delreq03' ],
                    id: null
                },
                postdel: { tasks: [], id: null }
            };
            assert.deepStrictEqual(got, exp);

            assert(got.postdel === state.postdel);
        });

        it('should reduce state if contains id', () => {
            let delreq = {
                tasks: [ 'delreq01', 'delreq02', 'delreq03' ],
                id: 'delreq-worker01'
            };
            let action = { delreq };

            let got = reduce(state, action);
            let exp = {
                delreq: {
                    tasks: [ 'delreq01', 'delreq02', 'delreq03' ],
                    id: 'delreq-worker01'
                },
                postdel: { tasks: [], id: null }
            };
            assert.deepStrictEqual(got, exp);

            assert(got.postdel === state.postdel);
        });

        it('should empty tasks if pass tasks as null', () => {
            let delreq = { tasks: null };
            let action = { delreq };

            let got = reduce(state, action);
            let exp = {
                delreq: { tasks: [], id: null },
                postdel: { tasks: [], id: null }
            };
            assert.deepStrictEqual(got, exp);

            assert(got.postdel === state.postdel);
        });

        it('should set id', () => {
            let delreq = { id: 'delreq-worker01' };
            let action = { delreq };

            let got = reduce(state, action);
            let exp = {
                delreq: {
                    tasks: [ 'delreq01', 'delreq02' ],
                    id: 'delreq-worker01'
                },
                postdel: { tasks: [], id: null }
            };
            assert.deepStrictEqual(got, exp);

            assert(got.postdel === state.postdel);
        });

        it('should do nothing if worker already is running', () => {
            let delreq = { id: 'delreq-worker01' };
            let action = { delreq };
            state = reduce(state, action);

            delreq = {
                tasks: [ 'delreq11', 'delreq12', 'delreq13' ],
                id: 'delreq-worker02'
            };
            action = { delreq };
            let got = reduce(state, action);
            let exp = {
                delreq: {
                    tasks: [ 'delreq01', 'delreq02' ],
                    id: 'delreq-worker01'
                },
                postdel: { tasks: [], id: null }
            };
            assert.deepStrictEqual(got, exp);

            assert(got.delreq === state.delreq);
            assert(got.postdel === state.postdel);
        });
    });

    describe('clearWorkerId()', () => {
        const { clearWorkerId } = internal;

        beforeEach(() => state = F({
            delreq: createWorker({
                tasks: [ 'delreq01', 'delreq02' ],
                id: 'delreq-worker01'
            }),
            postdel: createWorker()
        }));

        it('should clear worker id', () => {
            let got = clearWorkerId(state, { worker: 'delreq' });
            let exp = {
                delreq: {
                    tasks: [ 'delreq01', 'delreq02' ],
                    id: null
                },
                postdel: { tasks: [], id: null }
            };
            assert.deepStrictEqual(got, exp);

            assert(got.postdel === state.postdel);
        });
    });
});
