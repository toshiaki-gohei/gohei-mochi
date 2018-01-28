'use strict';
import assert from 'assert';
import reducer, { createPopup, internal } from '~/content/reducers/ui/popups';
import { F } from '~/common/util';

describe(__filename, () => {
    let state;
    beforeEach(() => state = F(new Map([
        [ 'popup01', F({ id: 'popup01' }) ],
        [ 'popup02', F({ id: 'popup02' }) ],
        [ 'popup03', F({ id: 'popup03' }) ]
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
            let popups = new Map([
                [ 'popup03', { id: 'popup03', component: 'popup03' } ],
                [ 'popup04', { id: 'popup04' } ]
            ]);
            let action = { popups };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'popup03', { id: 'popup03', component: 'popup03' } ],
                [ 'popup04', { id: 'popup04' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should not ignore unknown properties', () => {
            let popups = new Map([
                [ 'popup03', { id: 'popup03', hoge: 'hogehoge' } ],
                [ 'popup04', { id: 'popup04' } ]
            ]);
            let action = { popups };

            let got = reduce(state, action);
            let exp = new Map([
                [ 'popup03', { id: 'popup03', hoge: 'hogehoge' } ],
                [ 'popup04', { id: 'popup04' } ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should return state as it is if action is empty', () => {
            let got = reduce(state, new Map());
            assert(got === state);
        });
    });

    describe('createPopup()', () => {
        const Popup = () => {};

        it('should create popup', () => {
            let props = {
                class: 'class-name',
                style: 'left: 100px; top: 200px'
            };
            let popup = createPopup(Popup, props);

            let { id, ...rest } = popup;
            assert(/^gohei-popup-\d{13}-\d{1,8}$/.test(id));
            let got = rest;
            let exp = {
                component: Popup,
                props: {
                    class: 'class-name',
                    style: 'left: 100px; top: 200px'
                }
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});
