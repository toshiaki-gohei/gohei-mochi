'use strict';
import assert from 'assert';
import * as util from '~/content/views/thread/util';
import createStore from '~/content/reducers';
import { setAppThreads } from '~/content/reducers/actions';

describe(__filename, () => {
    describe('isThreadLazyDisplay()', () => {
        const { isThreadLazyDisplay } = util;

        it('should return true if displayThreshold has value', () => {
            let app = { displayThreshold: 200 };
            let got = isThreadLazyDisplay(app);
            assert(got === true);
        });

        it('should return false if displayThreshold is null', () => {
            let app = { displayThreshold: null };
            let got = isThreadLazyDisplay(app);
            assert(got === false);
        });

        it('should return false if app is null', () => {
            let app = null;
            let got = isThreadLazyDisplay(app);
            assert(got === false);
        });
    });

    describe('hasCheckedTarget()', () => {
        const { hasCheckedTarget } = util;

        let store;
        beforeEach(() => {
            store = createStore({
                app: { current: { thread: URL } }
            });
            store.dispatch(setAppThreads({ url: URL }));
        });

        const URL = 'http://example.net/thread01';

        it('should return true if contains checked delreqs', () => {
            const delreq = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: false } ],
                    [ 'post02', { post: 'post02', checked: true } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delreq }));

            let { app } = store.getState();
            let got = hasCheckedTarget(app, 'delreq');
            assert(got === true);
        });

        it('should return false if not contains checked delreqs', () => {
            const delreq = {
                targets: new Map([
                    [ 'post01', { post: 'post01', checked: false } ],
                    [ 'post02', { post: 'post02', checked: false } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delreq }));

            let { app } = store.getState();
            let got = hasCheckedTarget(app, 'delreq');
            assert(got === false);
        });

        it('should return false if delreqs is empty', () => {
            const delreq = { targets: new Map([]) };
            store.dispatch(setAppThreads({ url: URL, delreq }));

            let { app } = store.getState();
            let got = hasCheckedTarget(app, 'delreq');
            assert(got === false);
        });
    });
});
