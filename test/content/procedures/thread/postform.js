'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/thread/postform';
import createStore from '~/content/reducers';
import { setAppThreads } from '~/content/reducers/actions';

describe(__filename, () => {
    let store;
    beforeEach(() => store = createStore());

    describe('setComment()', () => {
        const { setComment } = procedures;

        const url = 'http://example.net/thread01';
        const getComment = () => store.getState().app.threads.get(url).postform.comment;

        beforeEach(() => {
            store = createStore({ app: { current: { thread: url } } });
            store.dispatch(setAppThreads({ url }));
        });

        it('should set comment', () => {
            setComment(store, 'foo bar');

            let got = getComment();
            assert(got === 'foo bar');
        });

        it('should not set comment if not change comment', () => {
            setComment(store, 'foo bar');
            let prev = store.getState();

            setComment(store, [ 'foo', 'bar' ].join(' '));

            let got = store.getState();
            assert(got === prev);
        });
    });

    describe('setFile()', () => {
        const { setFile } = procedures;

        const url = 'http://example.net/thread01';
        const getFile = () => store.getState().app.threads.get(url).postform.file;

        beforeEach(() => {
            store = createStore({ app: { current: { thread: url } } });
            store.dispatch(setAppThreads({ url }));
        });

        it('should set a file', () => {
            setFile(store, 'file object');

            let got = getFile();
            assert(got === 'file object');
        });

        it('should not set a file if not change a file', () => {
            setFile(store, 'file object');
            let prev = store.getState();

            setFile(store, 'file object');

            let got = store.getState();
            assert(got === prev);
        });
    });
});
