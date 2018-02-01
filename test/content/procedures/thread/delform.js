'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/thread/delform';
import createStore from '~/content/reducers';
import { setAppThreads, setAppTasksPostdels } from '~/content/reducers/actions';
import { setup, teardown } from '@/support/dom';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => {
        store = createStore({ app: { current: { thread: URL } } });
        store.dispatch(setAppThreads({ url: URL }));
    });

    const URL = 'http://example.net/thread01';
    const getDelform = () => store.getState().app.threads.get(URL).delform;

    describe('addDelformTargets()', () => {
        const { addDelformTargets } = procedures;

        it('should add delform targets', () => {
            let postIds = [ 'post01', 'post02' ];
            addDelformTargets(store, { url: URL, postIds });

            let got = getDelform();
            let exp = {
                action: null,
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: true } ],
                    [ 'post02', { post: 'post02', checked: true } ]
                ])
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should add delform targets if contains app.tasks.postdels', () => {
            store.dispatch(setAppTasksPostdels([
                { post: 'post01', status: 'complete', res: { ok: true, status: 200 } },
                { post: 'post03', status: null }
            ]));
            let postIds = [ 'post01', 'post02', 'post03' ];
            addDelformTargets(store, { url: URL, postIds });

            let got = getDelform();
            let exp = {
                action: null,
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: false } ],
                    [ 'post02', { post: 'post02', checked: true } ],
                    [ 'post03', { post: 'post03', checked: false } ]
                ])
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('setDelformTargets()', () => {
        const { setDelformTargets } = procedures;

        beforeEach(() => {
            let delform = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: false } ],
                    [ 'post02', { post: 'post02', checked: true } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delform }));
        });

        it('should set delform targets', () => {
            let targets = [
                { post: 'post01', checked: true },
                { post: 'post02', checked: false }
            ];
            setDelformTargets(store, { url: URL, targets });

            let got = getDelform();
            let exp = {
                action: null,
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: true } ],
                    [ 'post02', { post: 'post02', checked: false } ]
                ])
            };
            assert.deepStrictEqual(got , exp);
        });
    });

    describe('removeDelformTargets()', () => {
        const { removeDelformTargets } = procedures.internal;

        beforeEach(() => {
            let delform = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: false } ],
                    [ 'post02', { post: 'post02', checked: true } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delform }));
        });

        it('should remove delform targets', () => {
            let postIds = [ 'post01', 'post02' ];
            removeDelformTargets(store, { url: URL, postIds });

            let got = getDelform();
            let exp = { action: null, targets: new Map() };
            assert.deepStrictEqual(got , exp);
        });
    });

    describe('clearDelformTargets()', () => {
        const { clearDelformTargets } = procedures;

        beforeEach(() => {
            let delform = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: false } ],
                    [ 'post02', { post: 'post02', checked: true } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delform }));
        });

        it('should clear delform targets', () => {
            clearDelformTargets(store, { url: URL });
            let got = getDelform();
            let exp = { action: null, targets: new Map() };
            assert.deepStrictEqual(got , exp);
        });
    });

    describe('registerPostdelTasks()', () => {
        const { registerPostdelTasks } = procedures;

        before(() => setup());
        after(() => teardown());

        beforeEach(() => {
            let posts = [ '100', '101', '102' ]
                .map((no, index) => ({ id: `may/b/${no}`, index, no }));
            store = createStore({
                domain: { posts: new Map(posts.map(post => [ post.id, post ])) },
                app: { current: { thread: URL } }
            });
            let delform = {
                targets: new Map([
                    [ 'may/b/100', { post: 'may/b/100', checked: true } ],
                    [ 'may/b/101', { post: 'may/b/101', checked: false } ],
                    [ 'may/b/102', { post: 'may/b/102', checked: true } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delform }));
        });

        const URL = 'https://may.2chan.net/b/res/123456789.htm';

        it('should register tasks', async () => {
            let form = { pwd: 'password' };

            await registerPostdelTasks(store, { url: URL, ...form });

            let { app } = store.getState();

            let got = app.threads.get(URL).delform;
            let exp = {
                action: null,
                targets: new Map([
                    [ 'may/b/101', { post: 'may/b/101', checked: false } ]
                ])
            };
            assert.deepStrictEqual(got , exp);

            got = pluck(app.tasks.postdels, 'post');
            exp = [ { post: 'may/b/100' }, { post: 'may/b/102' } ];
            assert.deepStrictEqual(got , exp);

            got = app.workers.postdel.tasks;
            exp = [ 'may/b/100', 'may/b/102' ];
            assert.deepStrictEqual(got , exp);
        });
    });
});
