'use strict';
import assert from 'assert';
import reducer, { internal } from '~/content/reducers/app/catalogs';
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
                { url: 'url-catalog01', updateHttpRes: 'http-res' },
                { url: 'url-catalog04' }
            ];
            let action = { apps };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-catalog01', {
                    url: 'url-catalog01', isUpdating: false,
                    updatedAt: 'date', updateHttpRes: 'http-res' } ],
                [ 'url-catalog02', { url: 'url-catalog02' } ],
                [ 'url-catalog03', { url: 'url-catalog03' } ],
                [ 'url-catalog04', {
                    url: 'url-catalog04', isUpdating: false,
                    updatedAt: null, updateHttpRes: null } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should reduce state if pass a app', () => {
            let app = { url: 'url-catalog01', updateHttpRes: 'http-res' };
            let action = { app };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-catalog01', {
                    url: 'url-catalog01', isUpdating: false,
                    updatedAt: 'date', updateHttpRes: 'http-res' } ],
                [ 'url-catalog02', { url: 'url-catalog02' } ],
                [ 'url-catalog03', { url: 'url-catalog03' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should ignore unknown properties', () => {
            let app = { url: 'url-catalog01', updateHttpRes: 'http-res', hoge: 'hogehoge' };
            let action = { app };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'url-catalog01', {
                    url: 'url-catalog01', isUpdating: false,
                    updatedAt: 'date', updateHttpRes: 'http-res' } ],
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
