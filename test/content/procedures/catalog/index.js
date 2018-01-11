'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/catalog';
import createStore from '~/content/reducers';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => store = createStore());

    describe('export', () => {
        it('should export functions', () => {
            let got = Object.values(procedures).every(fn => typeof fn === 'function');
            assert(got === true);
        });
    });

    describe('load()', () => {
        const { load } = procedures;

        it('should load', () => {
            let url = 'url-catalog01';

            let threads = [
                { url: 'url-thread01', title: 'title-thread1' },
                { url: 'url-thread02', title: 'title-thread2' },
                { url: 'url-thread03', title: 'title-thread3' }
            ];
            let contents = { url, catalog: { threads } };

            load(store, contents);

            let { domain } = store.getState();

            let got = domain.catalogs.get(url);
            let exp = {
                url: 'url-catalog01',
                title: null,
                threads: [ 'url-thread01', 'url-thread02', 'url-thread03' ],
                sort: null
            };
            assert.deepStrictEqual(got, exp);

            got = pluck(domain.threads, 'url', 'title');
            exp = [
                { url: 'url-thread01', title: 'title-thread1' },
                { url: 'url-thread02', title: 'title-thread2' },
                { url: 'url-thread03', title: 'title-thread3' }
            ];
            assert.deepStrictEqual(got, exp);
        });
    });
});
