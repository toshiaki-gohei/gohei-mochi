'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/thread/delform';
import createStore from '~/content/reducers';
import { setAppThreads } from '~/content/reducers/actions';

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

        it('should add a delform target', () => {
            let postId = 'post01';
            addDelformTargets(store, { url: URL, postId });

            let got = getDelform();
            let exp = {
                action: null,
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: true } ]
                ])
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if contains delform targets', () => {
            let postIds = [ 'post01', 'post02' ];
            addDelformTargets(store, { url: URL, postIds });
            let prev = getDelform();

            postIds = [ 'post02' ];
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
            assert(got === prev);
        });

        it('should add delform targets ignored containing ids', () => {
            let postIds = [ 'post01', 'post02' ];
            addDelformTargets(store, { url: URL, postIds });

            postIds = [ 'post02', 'post03' ];
            addDelformTargets(store, { url: URL, postIds });

            let got = getDelform();
            let exp = {
                action: null,
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: true } ],
                    [ 'post02', { post: 'post02', checked: true } ],
                    [ 'post03', { post: 'post03', checked: true } ]
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
        const { removeDelformTargets } = procedures;

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
});
