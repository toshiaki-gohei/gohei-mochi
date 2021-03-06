'use strict';
import assert from 'assert';
import * as util from '~/content/views/thread/util';
import createStore from '~/content/reducers';
import { setAppThreads } from '~/content/reducers/actions';
import { setup, teardown, disposePreferences, isBrowser } from '@/support/dom';
import jsCookie from 'js-cookie';

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

    describe('isHiddenPost()', () => {
        const { isHiddenPost } = util;

        it('should return true if filter is active and post is deleted', () => {
            let post = { state: 1 };
            let filters = { isHiddenDeletedPosts: true };
            let got = isHiddenPost({ post, filters });
            assert(got === true);
        });

        it('should return false if filter is active and post is not deleted', () => {
            let post = { state: null };
            let filters = { isHiddenDeletedPosts: true };
            let got = isHiddenPost({ post, filters });
            assert(got === false);
        });

        it('should return false if filter is inactive', () => {
            let filters = { isHiddenDeletedPosts: false };
            let got = isHiddenPost({ filters });
            assert(got === false);
        });
    });

    (isBrowser ? describe.skip : describe)('setNamec()', () => {
        const { setNamec } = util;

        before(() => setup({ url: URL }));
        after(() => teardown());

        afterEach(() => disposePreferences());

        const URL = 'https://may.2chan.net/b/res/123456789.htm';

        it('should set namec to cookie', () => {
            let got = jsCookie.get('namec');
            assert(got === undefined);

            setNamec('test name', URL);

            got = jsCookie.get('namec');
            assert(got === 'test name');

            jsCookie.remove('namec', { path: '/b/' });
            got = jsCookie.get('namec');
            assert(got === undefined);
        });

        it('should set empty string if pass null', () => {
            setNamec(null, URL);
            let got = jsCookie.get('namec');
            assert(got === '');
        });
    });

    (isBrowser ? describe.skip : describe)('setPwdc()', () => {
        const { setPwdc } = util;

        before(() => setup({ url: URL }));
        after(() => teardown());

        afterEach(() => disposePreferences());

        const URL = 'https://may.2chan.net/b/res/123456789.htm';

        it('should set pwdc to cookie', () => {
            let got = jsCookie.get('pwdc');
            assert(got === undefined);

            setPwdc('test password', URL);

            got = jsCookie.get('pwdc');
            assert(got === 'test password');

            jsCookie.remove('pwdc', { domain: '.2chan.net' });
            got = jsCookie.get('pwdc');
            assert(got === undefined);
        });

        it('should set empty string if pass null', () => {
            setPwdc(null);
            let got = jsCookie.get('pwdc');
            assert(got === '');
        });
    });
});
