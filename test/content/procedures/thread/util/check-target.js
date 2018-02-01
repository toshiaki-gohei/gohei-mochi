'use strict';
import assert from 'assert';
import * as util from '~/content/procedures/thread/util/check-target';
import createStore from '~/content/reducers';
import { setAppThreads, setAppTasksDelreqs } from '~/content/reducers/actions';

describe(__filename, () => {
    let store;
    beforeEach(() => {
        store = createStore({ app: { current: { thread: URL } } });
        store.dispatch(setAppThreads({ url: URL }));
    });

    const URL = 'http://example.net/thread01';
    const getDelreq = () => store.getState().app.threads.get(URL).delreq;

    describe('makeAdd()', () => {
        const { makeAdd } = util;
        const addDelreqTargets = makeAdd('delreq', 'delreqs');

        it('should add delreq targets', () => {
            let postIds = [ 'post01', 'post02' ];
            addDelreqTargets(store, { url: URL, postIds });

            let got = getDelreq();
            let exp = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: true } ],
                    [ 'post02', { post: 'post02', checked: true } ]
                ])
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should add a delreq target', () => {
            let postId = 'post01';
            addDelreqTargets(store, { url: URL, postId });

            let got = getDelreq();
            let exp = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: true } ]
                ])
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if contains delreq targets', () => {
            let postIds = [ 'post01', 'post02' ];
            addDelreqTargets(store, { url: URL, postIds });
            let prev = getDelreq();

            postIds = [ 'post02' ];
            addDelreqTargets(store, { url: URL, postIds });

            let got = getDelreq();
            let exp = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: true } ],
                    [ 'post02', { post: 'post02', checked: true } ]
                ])
            };
            assert.deepStrictEqual(got, exp);
            assert(got === prev);
        });

        it('should add delreq targets ignored containing ids', () => {
            let postIds = [ 'post01', 'post02' ];
            addDelreqTargets(store, { url: URL, postIds });

            postIds = [ 'post02', 'post03' ];
            addDelreqTargets(store, { url: URL, postIds });

            let got = getDelreq();
            let exp = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: true } ],
                    [ 'post02', { post: 'post02', checked: true } ],
                    [ 'post03', { post: 'post03', checked: true } ]
                ])
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should add delreq targets if contains app.tasks.delreqs', () => {
            store.dispatch(setAppTasksDelreqs([
                { post: 'post01', status: 'complete', res: { ok: true, status: 200 } },
                { post: 'post03', status: null }
            ]));
            let postIds = [ 'post01', 'post02', 'post03' ];
            addDelreqTargets(store, { url: URL, postIds });

            let got = getDelreq();
            let exp = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: false } ],
                    [ 'post02', { post: 'post02', checked: true } ],
                    [ 'post03', { post: 'post03', checked: false } ]
                ])
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if pass empty postIds', () => {
            let prev = getDelreq();
            addDelreqTargets(store, { url: URL });

            let got = getDelreq();
            assert(got === prev);
        });

        it('should throw exception if not found url', () => {
            store = createStore();
            let got;
            try { addDelreqTargets(store, { postId: 'post01' }); } catch (e) { got = e.message; }
            assert(got === 'thread url is required');
        });
    });

    describe('makeSet()', () => {
        const { makeSet } = util;
        const setDelreqTargets = makeSet('delreq');

        beforeEach(() => {
            let delreq = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: false } ],
                    [ 'post02', { post: 'post02', checked: true } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delreq }));
        });

        it('should set delreq targets', () => {
            let targets = [
                { post: 'post01', checked: true },
                { post: 'post02', checked: false }
            ];
            setDelreqTargets(store, { url: URL, targets });

            let got = getDelreq();
            let exp = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: true } ],
                    [ 'post02', { post: 'post02', checked: false } ]
                ])
            };
            assert.deepStrictEqual(got , exp);
        });

        it('should set a delreq target', () => {
            let target = { post: 'post01', checked: true };
            setDelreqTargets(store, { url: URL, target });

            let got = getDelreq();
            let exp = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: true } ],
                    [ 'post02', { post: 'post02', checked: true } ]
                ])
            };
            assert.deepStrictEqual(got , exp);
        });

        it('should throw exception if pass a nonexistent delreq target', () => {
            let targets = [
                { post: 'post02', checked: false },
                { post: 'post03', checked: false }
            ];
            let got;
            try { setDelreqTargets(store, { url: URL, targets }); } catch (e) { got = e.message; }
            assert(got === 'delreq target not found: post03');
        });

        it('should throw exception if pass empty delreq targets', () => {
            let got;
            try { setDelreqTargets(store, { url: URL }); } catch (e) { got = e.message; }
            assert(got === 'target or targets is required');
        });

        it('should throw exception if not found url', () => {
            store = createStore();
            let got;
            try { setDelreqTargets(store, { delreq: {} }); } catch (e) { got = e.message; }
            assert(got === 'thread url is required');
        });
    });

    describe('makeRemove()', () => {
        const { makeRemove } = util;
        const removeDelreqTargets = makeRemove('delreq');

        beforeEach(() => {
            let delreq = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: false } ],
                    [ 'post02', { post: 'post02', checked: true } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delreq }));
        });

        it('should remove delreq targets', () => {
            let postIds = [ 'post01', 'post02' ];
            removeDelreqTargets(store, { url: URL, postIds });

            let got = getDelreq();
            let exp = { targets: new Map() };
            assert.deepStrictEqual(got , exp);
        });

        it('should remove a delreq target', () => {
            let postId = 'post01';
            removeDelreqTargets(store, { url: URL, postId });

            let got = getDelreq();
            let exp = {
                targets: new Map([
                    [ 'post02', { post: 'post02', checked: true } ]
                ])
            };
            assert.deepStrictEqual(got , exp);
        });

        it('should remove delreq targets correctly', () => {
            let postIds = [ 'post02', 'post03' ];
            removeDelreqTargets(store, { url: URL, postIds });

            let got = getDelreq();
            let exp = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: false } ]
                ])
            };
            assert.deepStrictEqual(got , exp);
        });

        it('should do nothing if pass empty postIds', () => {
            let prev = getDelreq();
            removeDelreqTargets(store, { url: URL });

            let got = getDelreq();
            assert(got === prev);
        });

        it('should throw exception if not found url', () => {
            store = createStore();
            let got;
            try { removeDelreqTargets(store, { postId: 'post01' }); } catch (e) { got = e.message; }
            assert(got === 'thread url is required');
        });
    });

    describe('makeClear()', () => {
        const { makeClear } = util;
        const clearDelreqTargets = makeClear('delreq');

        beforeEach(() => {
            let delreq = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: false } ],
                    [ 'post02', { post: 'post02', checked: true } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delreq }));
        });

        it('should clear delreq targets', () => {
            clearDelreqTargets(store, { url: URL });
            let got = getDelreq();
            let exp = { targets: new Map() };
            assert.deepStrictEqual(got , exp);
        });

        it('should clear delreq targets using state.current.thread if no url argument', () => {
            clearDelreqTargets(store);
            let got = getDelreq();
            let exp = { targets: new Map() };
            assert.deepStrictEqual(got , exp);
        });

        it('should do nothing if delreq targets is empty', () => {
            clearDelreqTargets(store, { url: URL });
            let prev = getDelreq();
            clearDelreqTargets(store, { url: URL });

            let got = getDelreq();
            assert(got === prev);
        });

        it('should throw exception if not found url', () => {
            store = createStore();
            let got;
            try { clearDelreqTargets(store, {}); } catch (e) { got = e.message; }
            assert(got === 'thread url is required');
        });
    });
});
