'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/preferences';
import createStore from '~/content/reducers';

describe(__filename, () => {
    let store;
    beforeEach(() => store = createStore());

    describe('export', () => {
        it('should export functions', () => {
            let got = Object.values(procedures).every(fn => typeof fn === 'function');
            assert(got === true);
        });
    });

    describe('set()', () => {
        const { set } = procedures;

        const getPreferences = () => store.getState().ui.preferences;

        it('should set preferences', () => {
            let pref = {
                colnum: 14,
                title: { length: 4 }
            };

            set(store, pref);

            let got = getPreferences();
            let exp = {
                colnum: 14, rownum: null,
                title: { length: 4, position: null },
                thumb: { size: null }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should not set preferences if pass null', () => {
            set(store, { colnum: 14 });
            let prev = getPreferences();

            set(store, null);

            let got = getPreferences();
            let exp = {
                colnum: 14, rownum: null,
                title: { length: null, position: null },
                thumb: { size: null }
            };
            assert.deepStrictEqual(got, exp);
            assert(got === prev);
        });
    });
});
