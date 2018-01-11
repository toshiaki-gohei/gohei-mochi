'use strict';
import assert from 'assert';
import reducer, { internal } from '~/content/reducers/domain/catalogs';
import { F } from '~/common/util';

describe(__filename, () => {
    let state;
    beforeEach(() => state = F(new Map([
        [ 'url-catalog01', F({ url: 'url-catalog01', title: 'title-catalog01' }) ],
        [ 'url-catalog02', F({ url: 'url-catalog02' }) ],
        [ 'url-catalog03', F({ url: 'url-catalog03' }) ]
    ])));

    describe('export', () => {
        it('should export reducer', () => {
            let got = reducer();
            assert.deepStrictEqual(got, new Map());
        });
    });

    describe('reduce()', () => {
        const { reduce } = internal;

        it('should reduce state', () => {
            let catalogs = [
                { url: 'url-catalog01', threads: [ 'thread01' ] },
                { url: 'url-catalog04' }
            ];
            let action = { catalogs };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-catalog01', {
                    url: 'url-catalog01', title: 'title-catalog01',
                    threads: [ 'thread01' ], sort: null } ],
                [ 'url-catalog02', { url: 'url-catalog02' } ],
                [ 'url-catalog03', { url: 'url-catalog03' } ],
                [ 'url-catalog04', { url: 'url-catalog04', title: null, threads: [], sort: null } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should reduce state if pass a catalog', () => {
            let catalog = { url: 'url-catalog01', threads: [ 'thread01', 'thread02' ] };
            let action = { catalog };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-catalog01', {
                    url: 'url-catalog01', title: 'title-catalog01',
                    threads: [ 'thread01', 'thread02' ], sort: null } ],
                [ 'url-catalog02', { url: 'url-catalog02' } ],
                [ 'url-catalog03', { url: 'url-catalog03' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should ignore unknown properties', () => {
            let catalog = { url: 'url-catalog01', threads: [ 'thread01' ], hoge: 'hogehoge' };
            let action = { catalog };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-catalog01', {
                    url: 'url-catalog01', title: 'title-catalog01',
                    threads: [ 'thread01' ], sort: null } ],
                [ 'url-catalog02', { url: 'url-catalog02' } ],
                [ 'url-catalog03', { url: 'url-catalog03' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should return state as it is if action is empty', () => {
            let got = reduce(state, {});
            assert(got === state);
        });

        it('should throw exception if there is no catalog url', () => {
            let action = { catalog: {} };
            let got;
            try { reduce(state, action); } catch (e) { got = e.message; }
            assert(got === 'catalog url is required');
        });
    });
});
