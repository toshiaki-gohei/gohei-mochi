'use strict';
import assert from 'assert';
import reducer, { internal } from '~/content/reducers/app/current';
import { F } from '~/common/util';

describe(__filename, () => {
    let state;
    beforeEach(() => state = F({
        thread: 'http://example.net/thread01',
        catalog: 'http://example.net/catalog01'
    }));

    describe('export', () => {
        it('should export reducer', () => {
            let got = reducer();
            let exp = {
                thread: null,
                catalog: null
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('reduce()', () => {
        const { reduce } = internal;

        it('should reduce state', () => {
            let current = { thread: 'http://example.net/thread02' };
            let action = { current };

            let got = reduce(state, action);
            let exp = {
                thread: 'http://example.net/thread02',
                catalog: 'http://example.net/catalog01'
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should ignore unknown properties', () => {
            let current = {
                thread: 'http://example.net/thread02',
                hoge: 'hogehoge'
            };
            let action = { current };

            let got = reduce(state, action);
            let exp = {
                thread: 'http://example.net/thread02',
                catalog: 'http://example.net/catalog01'
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should return state as it is if action is empty', () => {
            let got = reduce(state, {});
            assert(got === state);
        });
    });
});
