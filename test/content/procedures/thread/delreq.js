'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/thread/delreq';
import createStore from '~/content/reducers';
import { setAppThreads, setAppTasksDelreqs } from '~/content/reducers/actions';
import { setup, teardown } from '@/support/dom';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => {
        store = createStore({ app: { current: { thread: URL } } });
        store.dispatch(setAppThreads({ url: URL }));
    });

    const URL = 'http://example.net/thread01';
    const getDelreq = () => store.getState().app.threads.get(URL).delreq;

    describe('addDelreqTargets()', () => {
        const { addDelreqTargets } = procedures;

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
    });

    describe('setDelreqTargets()', () => {
        const { setDelreqTargets } = procedures;

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
    });

    describe('removeDelreqTargets()', () => {
        const { removeDelreqTargets } = procedures.internal;

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
    });

    describe('clearDelreqTargets()', () => {
        const { clearDelreqTargets } = procedures;

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
    });

    describe('registerDelreqTasks()', () => {
        const { registerDelreqTasks } = procedures;

        before(() => setup());
        after(() => teardown());

        beforeEach(() => {
            let posts = [ '100', '101', '102' ]
                .map((no, index) => ({ id: `may/b/${no}`, index, no }));
            store = createStore({
                domain: { posts: new Map(posts.map(post => [ post.id, post ])) },
                app: { current: { thread: URL } }
            });
            let delreq = {
                targets: new Map([
                    [ 'may/b/100', { post: 'may/b/100', checked: true } ],
                    [ 'may/b/101', { post: 'may/b/101', checked: false } ],
                    [ 'may/b/102', { post: 'may/b/102', checked: true } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delreq }));
        });

        const URL = 'https://may.2chan.net/b/res/123456789.htm';

        it('should register tasks', async () => {
            let reason = 110;

            await registerDelreqTasks(store, { url: URL, reason });

            let { app } = store.getState();

            let got = app.threads.get(URL).delreq;
            let exp = {
                targets: new Map([
                    [ 'may/b/101', { post: 'may/b/101', checked: false } ]
                ])
            };
            assert.deepStrictEqual(got , exp);

            got = pluck(app.tasks.delreqs, 'post');
            exp = [ { post: 'may/b/100' }, { post: 'may/b/102' } ];
            assert.deepStrictEqual(got , exp);

            got = app.workers.delreq.tasks;
            exp = [ 'may/b/100', 'may/b/102' ];
            assert.deepStrictEqual(got , exp);
        });
    });
});
