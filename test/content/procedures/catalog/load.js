'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/catalog';
import createStore from '~/content/reducers';
import { HttpRes } from '~/content/model';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => store = createStore());

    describe('load()', () => {
        const { load } = procedures;

        it('should load', () => {
            let url = 'url-catalog01';

            let contents = {
                url,
                catalog: {
                    title: 'catalog-title',
                    threads: [
                        { url: 'url-thread01', title: 'title-thread1' },
                        { url: 'url-thread02', title: 'title-thread2' },
                        { url: 'url-thread03', title: 'title-thread3' }
                    ]
                }
            };

            load(store, contents);

            let { domain, app } = store.getState();

            let got = domain.catalogs.get(url);
            let exp = {
                url: 'url-catalog01',
                title: 'catalog-title',
                threads: [ 'url-thread01', 'url-thread02', 'url-thread03' ],
                sort: null
            };
            assert.deepStrictEqual(got, exp);

            got = pluck(domain.threads, 'url', 'title', 'isActive');
            exp = [
                { url: 'url-thread01', title: 'title-thread1', isActive: true },
                { url: 'url-thread02', title: 'title-thread2', isActive: true },
                { url: 'url-thread03', title: 'title-thread3', isActive: true }
            ];
            assert.deepStrictEqual(got, exp);

            got = app.catalogs.get(url);
            exp = {
                url,
                searchResults: [],
                isUpdating: false,
                updatedAt: null,
                httpRes: new HttpRes({
                    status: 200, statusText: null,
                    lastModified: null, etag: null
                })
            };
            assert.deepStrictEqual(got, exp);

            got = pluck(app.threads, 'url');
            exp = [
                { url: 'url-thread01' },
                { url: 'url-thread02' },
                { url: 'url-thread03' }
            ];
            assert.deepStrictEqual(got, exp);

        });
    });
});
