'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/thread/delreq';
import createStore from '~/content/reducers';
import { setAppThreads } from '~/content/reducers/actions';
import { setup, teardown } from '@/support/dom';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => {
        store = createStore({ app: { current: { thread: url } } });
        store.dispatch(setAppThreads({ url }));
    });

    const url = 'http://example.net/thread01';
    const getDelreqs = () => store.getState().app.threads.get(url).delreqs;

    describe('addDelreqs()', () => {
        const { addDelreqs } = procedures;

        it('should add delreqs', () => {
            let ids = [ 'post01', 'post02' ];
            addDelreqs(store, { url, ids });

            let got = getDelreqs();
            let exp = [ 'post01', 'post02' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should add a delreq', () => {
            let id = 'post01';
            addDelreqs(store, { url, id });

            let got = getDelreqs();
            let exp = [ 'post01' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if contains delreqs', () => {
            let ids = [ 'post01', 'post02' ];
            addDelreqs(store, { url, ids });
            let prev = getDelreqs();

            ids = [ 'post02' ];
            addDelreqs(store, { url, ids });

            let got = getDelreqs();
            let exp = [ 'post01', 'post02' ];
            assert.deepStrictEqual(got, exp);
            assert(got === prev);
        });

        it('should add delreqs ignored containing ids', () => {
            let ids = [ 'post01', 'post02' ];
            addDelreqs(store, { url, ids });

            ids = [ 'post02', 'post03' ];
            addDelreqs(store, { url, ids });

            let got = getDelreqs();
            let exp = [ 'post01', 'post02', 'post03' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if pass empty ids', () => {
            addDelreqs(store, { url });
            let prev = getDelreqs();

            let got = getDelreqs();
            assert.deepStrictEqual(got, []);
            assert(got === prev);
        });

        it('should throw exception if not found url', () => {
            store = createStore();
            let got;
            try { addDelreqs(store, { id: 'post01' }); } catch (e) { got = e.message; }
            assert(got === 'thread url is required');
        });
    });

    describe('removeDelreqs()', () => {
        const { removeDelreqs } = procedures;

        const delreqs = [ 'post01', 'post02' ];
        beforeEach(() => store.dispatch(setAppThreads({ url, delreqs })));

        it('should remove delreqs', () => {
            let ids = [ 'post01', 'post02' ];
            removeDelreqs(store, { url, ids });

            let got = getDelreqs();
            assert.deepStrictEqual(got , []);
        });

        it('should remove a delreq', () => {
            let id = 'post01';
            removeDelreqs(store, { url, id });

            let got = getDelreqs();
            let exp = [ 'post02' ];
            assert.deepStrictEqual(got , exp);
        });

        it('should remove delreqs correctly', () => {
            let ids = [ 'post02', 'post03' ];
            removeDelreqs(store, { url, ids });

            let got = getDelreqs();
            let exp = [ 'post01' ];
            assert.deepStrictEqual(got , exp);
        });

        it('should do nothing if pass empty ids', () => {
            removeDelreqs(store, { url });
            let got = getDelreqs();
            assert(got === delreqs);
        });

        it('should throw exception if not found url', () => {
            store = createStore();
            let got;
            try { removeDelreqs(store, { id: 'post01' }); } catch (e) { got = e.message; }
            assert(got === 'thread url is required');
        });
    });

    describe('clearDelreqs()', () => {
        const { clearDelreqs } = procedures;

        const delreqs = [ 'post01', 'post02' ];
        beforeEach(() => store.dispatch(setAppThreads({ url, delreqs })));

        it('should clear delreqs', () => {
            clearDelreqs(store, { url });
            let got = getDelreqs();
            assert.deepStrictEqual(got , []);
        });

        it('should clear delreqs using state.current.thread if no url argument', () => {
            clearDelreqs(store);
            let got = getDelreqs();
            assert.deepStrictEqual(got , []);
        });

        it('should do nothing if delreqs is empty', () => {
            clearDelreqs(store, { url });
            let delreqs = getDelreqs();

            clearDelreqs(store, { url });

            let got = getDelreqs();
            assert(got === delreqs);
        });

        it('should throw exception if not found url', () => {
            store = createStore();
            let got;
            try { clearDelreqs(store, {}); } catch (e) { got = e.message; }
            assert(got === 'thread url is required');
        });
    });

    describe('registerDelreqTasks()', () => {
        const { registerDelreqTasks } = procedures;

        before(() => setup());
        after(() => teardown());

        beforeEach(() => {
            store = createStore({ app: { current: { thread: url } } });
            store.dispatch(setAppThreads({ url, delreqs }));
        });

        const url = 'https://may.2chan.net/b/res/123456789.htm';
        const delreqs = [ 'may/b/100', 'may/b/101', 'may/b/102' ];

        it('should register tasks', async () => {
            let posts = [ '100', '102' ]
                .map((no, index) => ({ id: `may/b/${no}`, index, no }));
            let reason = 110;

            await registerDelreqTasks(store, { url, posts, reason });

            let { app } = store.getState();

            let got = app.threads.get(url).delreqs;
            let exp = [ 'may/b/101' ];
            assert.deepStrictEqual(got , exp);

            got = pluck(app.delreqs, 'post');
            exp = [ { post: 'may/b/100' }, { post: 'may/b/102' } ];
            assert.deepStrictEqual(got , exp);

            got = app.workers.delreq.tasks;
            exp = [ 'may/b/100', 'may/b/102' ];
            assert.deepStrictEqual(got , exp);
        });
    });
});
