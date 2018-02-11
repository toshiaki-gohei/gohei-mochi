'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/preferences';
import createStore from '~/content/reducers';
import { setup, teardown, disposePreferences } from '@/support/dom';
import jsCookie from 'js-cookie';

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
            jsCookie.set('cxyl', '15x10x5x1x2');
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

            got = jsCookie.get('cxyl');
            assert(got === '15x10x5x1x2');
            got = window.localStorage.getItem('futabavideo');
            assert(got === '0.8,true,false');
        });

        it('should save only catalog preferences', () => {
            jsCookie.set('cxyl', '14x6x4x0x0');
            window.localStorage.setItem('futabavideo', '0.5,false,true');

            let { catalog } = prefs;
            save(store, { catalog });

            let got = getPreferences();
            let exp = {
                ...prefs,
                video: { loop: true, muted: false, volume: 0.5 }
            };
            assert.deepStrictEqual(got, exp);

            got = jsCookie.get('cxyl');
            assert(got === '15x10x5x1x2');
            got = window.localStorage.getItem('futabavideo');
            assert(got === '0.5,false,true');
        });

        it('should save only video preferences', () => {
            jsCookie.set('cxyl', '14x6x4x0x0');
            window.localStorage.setItem('futabavideo', '0.5,false,true');

            let { video } = prefs;
            save(store, { video });

            let got = getPreferences();
            let exp = {
                ...prefs,
                catalog: {
                    colnum: 14, rownum: 6,
                    title: { length: 4, position: 0 },
                    thumb: { size: 0 }
                }
            };
            assert.deepStrictEqual(got, exp);

            got = jsCookie.get('cxyl');
            assert(got === '14x6x4x0x0');
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
