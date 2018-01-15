'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/preferences';
import createStore from '~/content/reducers';
import { preferences } from '~/content/model';

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
            let prefs = preferences.create({
                catalog: {
                    colnum: 14,
                    title: { length: 4 }
                }
            });

            set(store, prefs);

            let got = getPreferences();
            let exp = {
                ...getPreferences(),
                catalog: {
                    colnum: 14, rownum: null,
                    title: { length: 4, position: null },
                    thumb: { size: null }
                }
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if pass null', () => {
            let prefs = preferences.create({
                catalog: { colnum: 14 }
            });
            set(store, prefs);
            let prev = getPreferences();

            set(store, null);

            let got = getPreferences();
            assert(got === prev);
        });
    });
});
