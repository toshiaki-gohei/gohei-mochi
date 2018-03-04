'use strict';
import assert from 'assert';
import reducer, { internal } from '~/content/reducers/app/catalogs';
import { HttpRes } from '~/content/model';
import { F } from '~/common/util';

describe(__filename, () => {
    let state;
    beforeEach(() => state = F(new Map([
        [ 'url-catalog01', F({ url: 'url-catalog01', updatedAt: 'date' }) ],
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
            let apps = [
                { url: 'url-catalog01',
                  searchResults: [ 'result01', 'result02' ],
                  httpRes: new HttpRes({ status: 200 }) },
                { url: 'url-catalog04' }
            ];
            let action = { apps };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-catalog01', {
                    url: 'url-catalog01',
                    searchResults: [ 'result01', 'result02' ],
                    isUpdating: false,
                    updatedAt: 'date',
                    httpRes: new HttpRes({ status: 200 }) } ],
                [ 'url-catalog02', { url: 'url-catalog02' } ],
                [ 'url-catalog03', { url: 'url-catalog03' } ],
                [ 'url-catalog04', {
                    url: 'url-catalog04',
                    searchResults: [],
                    isUpdating: false, updatedAt: null, httpRes: new HttpRes() } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should reduce state if pass a app', () => {
            let app = { url: 'url-catalog01', httpRes: new HttpRes() };
            let action = { app };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-catalog01', {
                    url: 'url-catalog01',
                    searchResults: [],
                    isUpdating: false, updatedAt: 'date', httpRes: new HttpRes() } ],
                [ 'url-catalog02', { url: 'url-catalog02' } ],
                [ 'url-catalog03', { url: 'url-catalog03' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should ignore unknown properties', () => {
            let app = { url: 'url-catalog01', httpRes: new HttpRes(), hoge: 'hogehoge' };
            let action = { app };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-catalog01', {
                    url: 'url-catalog01',
                    searchResults: [],
                    isUpdating: false, updatedAt: 'date', httpRes: new HttpRes() } ],
                [ 'url-catalog02', { url: 'url-catalog02' } ],
                [ 'url-catalog03', { url: 'url-catalog03' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should return state as it is if action is empty', () => {
            let got = reduce(state, {});
            assert(got === state);
        });

        it('should throw exception if catalog url is null', () => {
            let action = { app: {} };
            let got;
            try { reduce(state, action); } catch (e) { got = e.message; }
            assert(got === 'url is required');
        });
    });
});
