import assert from 'assert';
import * as getter from '~/content/reducers/getters';
import createStore from '~/content/reducers';

describe(__filename, () => {
    describe('getThreadPosts()', () => {
        const { getThreadPosts } = getter;

        const posts = new Map([
            [ 'may/b/123000', { id: 'may/b/123000', name: 'スレあき' } ],
            [ 'may/b/123001', { id: 'may/b/123001', name: 'としあき1' } ],
            [ 'may/b/123002', { id: 'may/b/123002', name: 'としあき2' } ]
        ]);
        const threads = new Map([
            [ 'url-thread01', { posts: [ 'may/b/123000', 'may/b/123002' ] } ]
        ]);
        const store = createStore({ domain: { posts, threads } });

        it('should return thread posts', () => {
            let got = getThreadPosts(store, 'url-thread01');
            let exp = [
                { id: 'may/b/123000', name: 'スレあき' },
                { id: 'may/b/123002', name: 'としあき2' }
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should return empty posts if not find thread', () => {
            let got = getThreadPosts(store, 'url-thread09');
            assert.deepStrictEqual(got, []);
        });

        it('should throw exception if not pass url', () => {
            let got;
            try { getThreadPosts(store); } catch (e) { got = e.message; }
            assert(got === 'url is required');
        });
    });

    describe('getCurrentThread()', () => {
        const { getCurrentThread } = getter;

        const threads = new Map([
            [ 'url-thread01', { url: 'url-thread01' } ],
            [ 'url-thread02', { url: 'url-thread02' } ],
            [ 'url-thread03', { url: 'url-thread03' } ]
        ]);

        it('should return current thread', () => {
            let store = createStore({
                domain: { threads },
                app: { current: { thread: 'url-thread01' } }
            });
            let got = getCurrentThread(store);
            let exp = { url: 'url-thread01' };
            assert.deepStrictEqual(got, exp);
        });

        it('should throw exception if there is no current thread', () => {
            let store = createStore({
                domain: { threads },
                app: { current: { thread: null } }
            });
            let got;
            try { getCurrentThread(store); } catch (e) { got = e.message; }

            assert(got === 'no current thread');
        });

        it('should throw exception if not find current thread', () => {
            let store = createStore({
                domain: { threads },
                app: { current: { thread: 'url-thread09' } }
            });
            let got;
            try { getCurrentThread(store); } catch (e) { got = e.message; }

            assert(got === 'current thread not found: url-thread09');
        });
    });

    describe('getCurrentCatalog()', () => {
        const { getCurrentCatalog } = getter;

        const catalogs = new Map([
            [ 'url-catalog01', { url: 'url-catalog01' } ],
            [ 'url-catalog02', { url: 'url-catalog02' } ],
            [ 'url-catalog03', { url: 'url-catalog03' } ]
        ]);

        it('should return current catalog', () => {
            let store = createStore({
                domain: { catalogs },
                app: { current: { catalog: 'url-catalog01' } }
            });
            let got = getCurrentCatalog(store);
            let exp = { url: 'url-catalog01' };
            assert.deepStrictEqual(got, exp);
        });

        it('should throw exception if there is no current catalog', () => {
            let store = createStore({
                domain: { catalogs },
                app: { current: { catalog: null } }
            });
            let got;
            try { getCurrentCatalog(store); } catch (e) { got = e.message; }

            assert(got === 'no current catalog');
        });

        it('should throw exception if not find current catalog', () => {
            let store = createStore({
                domain: { catalogs },
                app: { current: { catalog: 'url-catalog09' } }
            });
            let got;
            try { getCurrentCatalog(store); } catch (e) { got = e.message; }

            assert(got === 'current catalog not found: url-catalog09');
        });
    });

    describe('getCurrentAppThread()', () => {
        const { getCurrentAppThread } = getter;

        const appThread = new Map([
            [ 'url-thread01', { postform: { action: 'thread01' } } ],
            [ 'url-thread02', { postform: { action: 'thread02' } } ],
            [ 'url-thread03', { postform: { action: 'thread03' } } ]
        ]);

        it('should return current app thread', () => {
            let store = createStore({
                app: { threads: appThread, current: { thread: 'url-thread01' } }
            });
            let got = getCurrentAppThread(store);
            let exp = { postform: { action: 'thread01' } };
            assert.deepStrictEqual(got, exp);
        });

        it('should throw exception if there is no current thread', () => {
            let store = createStore({
                app: { threads: appThread, current: { thread: null } }
            });
            let got;
            try { getCurrentAppThread(store); } catch (e) { got = e.message; }

            assert(got === 'no current thread');
        });

        it('should throw exception if not find current app thread', () => {
            let store = createStore({
                app: { threads: appThread, current: { thread: 'url-thread09' } }
            });
            let got;
            try { getCurrentAppThread(store); } catch (e) { got = e.message; }

            assert(got === 'current app thread not found: url-thread09');
        });
    });

    describe('getCurrentAppCatalog()', () => {
        const { getCurrentAppCatalog } = getter;

        const appCatalog = new Map([
            [ 'url-catalog01', { query: 'dummy-query-catalog01' } ],
            [ 'url-catalog02', { query: 'dummy-query-catalog02' } ],
            [ 'url-catalog03', { query: 'dummy-query-catalog03' } ]
        ]);

        it('should return current app catalog', () => {
            let store = createStore({
                app: { catalogs: appCatalog, current: { catalog: 'url-catalog01' } }
            });
            let got = getCurrentAppCatalog(store);
            let exp = { query: 'dummy-query-catalog01' };
            assert.deepStrictEqual(got, exp);
        });

        it('should throw exception if there is no current catalog', () => {
            let store = createStore({
                app: { catalogs: appCatalog, current: { catalog: null } }
            });
            let got;
            try { getCurrentAppCatalog(store); } catch (e) { got = e.message; }

            assert(got === 'no current catalog');
        });

        it('should throw exception if not find current app catalog', () => {
            let store = createStore({
                app: { catalogs: appCatalog, current: { catalog: 'url-catalog09' } }
            });
            let got;
            try { getCurrentAppCatalog(store); } catch (e) { got = e.message; }

            assert(got === 'current app catalog not found: url-catalog09');
        });
    });
});
