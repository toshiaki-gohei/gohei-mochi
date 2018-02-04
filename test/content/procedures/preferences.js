'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/preferences';
import createStore from '~/content/reducers';
import { setup, teardown, disposePreferences } from '@/support/dom';
import cookie from 'js-cookie';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store;
    beforeEach(() => store = createStore());

    afterEach(() => disposePreferences());

    describe('export', () => {
        it('should export functions', () => {
            let got = Object.values(procedures).every(fn => typeof fn === 'function');
            assert(got === true);
        });
    });

    const getPreferences = () => store.getState().ui.preferences;

    describe('load()', () => {
        const { load } = procedures;

        it('should load preferences', () => {
            cookie.set('cxyl', '15x10x5x1x2');
            window.localStorage.setItem('futabavideo', '0.8,true,false');

            load(store);

            let got = getPreferences();
            let exp = {
                catalog: {
                    colnum: 15, rownum: 10,
                    title: { length: 5, position: 1 },
                    thumb: { size: 2 }
                },
                video: { loop: false, muted: true, volume: 0.8 }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('save()', () => {
        const { save } = procedures;

        const prefs = {
            catalog: {
                colnum: 15, rownum: 10,
                title: { length: 5, position: 1 },
                thumb: { size: 2 }
            },
            video: { loop: false, muted: true, volume: 0.8 }
        };

        it('should save preferences', () => {
            save(store, prefs);

            let got = getPreferences();
            let exp = prefs;
            assert.deepStrictEqual(got, exp);

            got = cookie.get('cxyl');
            assert(got === '15x10x5x1x2');
            got = window.localStorage.getItem('futabavideo');
            assert(got === '0.8,true,false');
        });

        it('should do nothing if pass null', () => {
            save(store, prefs);
            let prev = getPreferences();

            save(store, null);

            let got = getPreferences();
            assert(got === prev);
        });
    });
});
