'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/sync';
import createStore from '~/content/reducers';

describe(__filename, () => {
    describe('export', () => {
        it('should export functions', () => {
            let got = Object.values(procedures).every(fn => typeof fn === 'function');
            assert(got === true);
        });
    });

    describe('post()', () => {
        const { post } = procedures;

        const posts = new Map([
            [ 'may/b/123000', { id: 'may/b/123000', name: 'スレあき' } ],
            [ 'may/b/123001', { id: 'may/b/123001', name: 'としあき1' } ],
            [ 'may/b/123002', { id: 'may/b/123002', name: 'としあき2' } ]
        ]);
        const store = createStore({ domain: { posts } });

        it('should return post', () => {
            let got = post(store, 'may/b/123000');
            let exp = { id: 'may/b/123000', name: 'スレあき' };
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if not find post', () => {
            let got = post(store, 'may/b/123009');
            assert(got === null);
        });

        it('should throw exception if not pass id', () => {
            let got;
            try { post(store); } catch (e) { got = e.message; }
            assert(got === 'post id is required');
        });
    });

    describe('thread()', () => {
        const { thread } = procedures;

        const threads = new Map([
            [ 'url-thread01', { url: 'url-thread01' } ],
            [ 'url-thread02', { url: 'url-thread02' } ],
            [ 'url-thread03', { url: 'url-thread03' } ]
        ]);
        const store = createStore({ domain: { threads } });

        it('should return thread', () => {
            let got = thread(store, 'url-thread01');
            let exp = { url: 'url-thread01' };
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if not find thread', () => {
            let got = thread(store, 'url-thread09');
            assert(got === null);
        });

        it('should throw exception if not pass url', () => {
            let got;
            try { thread(store); } catch (e) { got = e.message; }
            assert(got === 'thread url is required');
        });
    });

    describe('threadPosts()', () => {
        const { threadPosts } = procedures;

        const posts = new Map([
            [ 'may/b/123000', { id: 'may/b/123000', name: 'スレあき' } ],
            [ 'may/b/123001', { id: 'may/b/123001', name: 'としあき1' } ],
            [ 'may/b/123002', { id: 'may/b/123002', name: 'としあき2' } ]
        ]);
        const threads = new Map([
            [ 'url-thread01', { posts: [ 'may/b/123000', 'may/b/123002'] } ]
        ]);
        const store = createStore({ domain: { posts, threads } });

        it('should return thread posts', () => {
            let got = threadPosts(store, 'url-thread01');
            let exp = [
                { id: 'may/b/123000', name: 'スレあき' },
                { id: 'may/b/123002', name: 'としあき2' }
            ];
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('appThread()', () => {
        const { appThread } = procedures;

        const threads = new Map([
            [ 'url-thread01', { url: 'url-thread01' } ],
            [ 'url-thread02', { url: 'url-thread02' } ],
            [ 'url-thread03', { url: 'url-thread03' } ]
        ]);
        const store = createStore({ app: { threads } });

        it('should return app thread', () => {
            let got = appThread(store, 'url-thread01');
            let exp = { url: 'url-thread01' };
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if not find thread', () => {
            let got = appThread(store, 'url-thread09');
            assert(got === null);
        });

        it('should throw exception if not pass url', () => {
            let got;
            try { appThread(store); } catch (e) { got = e.message; }
            assert(got === 'thread url is required');
        });
    });

    describe('preferences()', () => {
        const { preferences } = procedures;

        const store = createStore();

        it('should return preferences', () => {
            let got = preferences(store);
            assert(got);
        });
    });
});
