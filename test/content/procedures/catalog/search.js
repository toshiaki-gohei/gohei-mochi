'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/catalog/search';
import createStore from '~/content/reducers';
import { setDomainThreads, setDomainCatalogs, setAppCatalogs } from '~/content/reducers/actions';
import { catalog } from '~/content/model';

describe(__filename, () => {
    const URL = 'http://example.net/catalog01';

    describe('search()', () => {
        const { search } = procedures;

        let store;
        beforeEach(() => {
            let threads = [
                { url: 'url-thread01', title: 'foo' },
                { url: 'url-thread02', title: 'bar' },
                { url: 'url-thread03', title: 'foo bar' }
            ];
            let threadIds = threads.map(({ url }) => url);

            store = createStore({ app: { current: { catalog: URL } } });
            store.dispatch(setDomainThreads(threads));
            store.dispatch(setDomainCatalogs({ url: URL, threads: threadIds }));
            store.dispatch(setAppCatalogs({ url: URL }));
        });

        it('should search if query is and', () => {
            let query = new catalog.Query({ title: 'f b', and: true });
            search(store, query);

            let { searchResults } = store.getState().app.catalogs.get(URL);
            let got = searchResults;
            let exp = [
                'url-thread03'
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should search if query is or', () => {
            let query = new catalog.Query({ title: 'f b', or: true });
            search(store, query);

            let { searchResults } = store.getState().app.catalogs.get(URL);
            let got = searchResults;
            let exp = [
                'url-thread01',
                'url-thread03',
                'url-thread02'
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should not set search results if search resulsts are same resutls', () => {
            let query = new catalog.Query({ title: 'f b', and: true });
            search(store, query);
            let { searchResults: before } = store.getState().app.catalogs.get(URL);

            search(store, query);
            let { searchResults: after } = store.getState().app.catalogs.get(URL);
            assert(after === before);
        });
    });

    describe('_search()', () => {
        const { _search } = procedures.internal;

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

        it('should not search if query is empty', () => {
            let query = new catalog.Query({ title: ' ', and: true });
            let got = _search(query, threads);
            assert.deepStrictEqual(got, []);
        });
    });
});
