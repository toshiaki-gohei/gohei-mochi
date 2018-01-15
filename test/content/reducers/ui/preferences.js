'use strict';
import assert from 'assert';
import reducer, { internal } from '~/content/reducers/ui/preferences';
import { preferences as prefs } from '~/content/model';

describe(__filename, () => {
    let state;
    beforeEach(() => state = prefs.load());

    describe('export', () => {
        it('should export reducer', () => {
            let got = reducer();
            let exp = prefs.create();
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('reduce()', () => {
        const { reduce } = internal;

        it('should reduce state', () => {
            let preferences = prefs.create({
                catalog: {
                    rownum: 10,
                    title: { length: 5 }
                }
            });
            let action = { preferences };

            let got = reduce(state, action);
            assert(got === preferences);
        });

        it('should return state as it is if action is empty', () => {
            let got = reduce(state, {});
            assert(got === state);
        });
    });
});
