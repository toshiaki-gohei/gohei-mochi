'use strict';
import assert from 'assert';
import reducer, { internal } from '~/content/reducers/ui/preferences';
import { preferences as pref } from '~/content/model';

describe(__filename, () => {
    let state;
    beforeEach(() => state = pref.create({
        colnum: 14, rownum: 6,
        title: { length: 4, position: 0 },
        thumb: { size: 0 }
    }));

    describe('export', () => {
        it('should export reducer', () => {
            let got = reducer();
            let exp = pref.create();
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('reduce()', () => {
        const { reduce } = internal;

        it('should reduce state', () => {
            let preferences = {
                rownum: 10,
                title: { length: 5 }
            };
            let action = { preferences };

            let got = reduce(state, action);
            let exp = {
                colnum: 14, rownum: 10,
                title: { length: 5, position: 0 },
                thumb: { size: 0 }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should return state as it is if action is empty', () => {
            let got = reduce(state, {});
            assert(got === state);
        });
    });
});
