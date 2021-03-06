'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/thread';
import createStore from '~/content/reducers';
import { setAppThreads } from '~/content/reducers/actions';

describe(__filename, () => {
    let store;
    beforeEach(() => store = createStore());

    describe('export', () => {
        it('should export functions', () => {
            let got = Object.values(procedures).every(fn => typeof fn === 'function');
            assert(got === true);
        });
    });

    describe('setDisplayThreshold()', () => {
        const { setDisplayThreshold } = procedures;

        const url = 'http://example.net/thread01';
        const getThreshold = () => store.getState().app.threads.get(url).displayThreshold;

        beforeEach(() => {
            store = createStore({ app: { current: { thread: url } } });
            store.dispatch(setAppThreads({ url }));
        });

        it('should set display threshold', () => {
            let got = getThreshold();
            assert(got === null);

            setDisplayThreshold(store, 200);

            got = getThreshold();
            assert(got === 200);
        });
    });

    describe('setFilters()', () => {
        const { setFilters } = procedures;

        const url = 'http://example.net/thread01';
        const getFilters = () => store.getState().app.threads.get(url).filters;

        beforeEach(() => {
            store = createStore({ app: { current: { thread: url } } });
            store.dispatch(setAppThreads({ url }));
        });

        it('should set filters', () => {
            let got = getFilters();
            let exp = { isHiddenDeletedPosts: false };
            assert.deepStrictEqual(got, exp);

            setFilters(store, { isHiddenDeletedPosts: true });

            got = getFilters();
            exp = { isHiddenDeletedPosts: true };
            assert.deepStrictEqual(got, exp);
        });
    });
});
