'use strict';
import assert from 'assert';
import search, { internal } from '~/content/procedures/catalog/search';
import createStore from '~/content/reducers';
import { setDomainThreads, setDomainCatalogs, setAppCatalogs } from '~/content/reducers/actions';
import { catalog } from '~/content/model';

describe(__filename, () => {
    const URL = 'http://example.net/catalog01';

    describe('search()', () => {
        let store;
        beforeEach(() => {
            let threads = [
                { url: 'url-thread01', title: 'foo', isActive: true },
                { url: 'url-thread02', title: 'bar', isActive: true },
                { url: 'url-thread03', title: 'foo bar', isActive: true }
            ];

            store = createStore({ app: { current: { catalog: URL } } });
            store.dispatch(setDomainThreads(threads));
            store.dispatch(setDomainCatalogs({ url: URL, threads: [] }));
            store.dispatch(setAppCatalogs({ url: URL }));
        });

        const getSearchResults = url => store.getState().app.catalogs.get(url).searchResults;

        it('should search if query is and', () => {
            let query = new catalog.Query({ title: 'f b', and: true });
            search(store, query);

            let got = getSearchResults(URL);
            let exp = [
                'url-thread03'
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should search if query is or', () => {
            let query = new catalog.Query({ title: 'f b', or: true });
            search(store, query);

            let got = getSearchResults(URL);
            let exp = [
                'url-thread01',
                'url-thread03',
                'url-thread02'
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should search from active threads', () => {
            let query = new catalog.Query({ title: 'f b', or: true });
            search(store, query);

            let searchResults = getSearchResults(URL);
            assert(searchResults.length === 3);

            let threads = [];
            for (let url of store.getState().domain.threads.keys()) {
                threads.push({ url, isActive: false });
            }
            store.dispatch(setDomainThreads(threads));

            search(store, query);

            let got = getSearchResults(URL);
            assert.deepStrictEqual(got, []);
        });

        it('should not set search results if search resulsts are same resutls', () => {
            let query = new catalog.Query({ title: 'f b', and: true });
            search(store, query);
            let before = getSearchResults(URL);

            search(store, query);
            let after = getSearchResults(URL);
            assert(after === before);
        });
    });

    describe('_search()', () => {
        const { _search } = internal;

        let threads = [
            { url: 'url-thread01', title: 'foo' },
            { url: 'url-thread02', title: 'bar' },
            { url: 'url-thread03', title: 'foo bar' }
        ];

        it('should search if query is and', () => {
            let query = new catalog.Query({ title: 'f b', and: true });

            let got = _search(query, threads);
            let exp = [
                { url: 'url-thread03', title: 'foo bar' }
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should search if query is or', () => {
            let query = new catalog.Query({ title: 'f b', or: true });

            let got = _search(query, threads);
            let exp = [
                { url: 'url-thread01', title: 'foo' },
                { url: 'url-thread03', title: 'foo bar' },
                { url: 'url-thread02', title: 'bar' }
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should search with ignore case', () => {
            let thread = { url: 'url-thread01', title: 'foo BAR' };

            let query = new catalog.Query({ title: 'foo', or: true });
            let got = _search(query, [ thread ]);
            assert.deepStrictEqual(got, [ thread ]);

            query = new catalog.Query({ title: 'FOO', or: true });
            got = _search(query, [ thread ]);
            assert.deepStrictEqual(got, [ thread ]);

            query = new catalog.Query({ title: 'bar', or: true });
            got = _search(query, [ thread ]);
            assert.deepStrictEqual(got, [ thread ]);

            query = new catalog.Query({ title: 'BAR', or: true });
            got = _search(query, [ thread ]);
            assert.deepStrictEqual(got, [ thread ]);
        });

        it('should return [] if query is empty', () => {
            let query = new catalog.Query({ title: ' ', and: true });
            let got = _search(query, threads);
            assert.deepStrictEqual(got, []);
        });
    });

    describe('_words()', () => {
        const { _words } = internal;

        it('should return words', () => {
            let query = new catalog.Query({ title: 'foo bar', or: true });
            let got = _words(query);
            let exp = [ 'foo', 'bar' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should return words without blank', () => {
            let query = new catalog.Query({ title: 'foo ', or: true });
            let got = _words(query);
            let exp = [ 'foo' ];
            assert.deepStrictEqual(got, exp);
        });
    });
});
