'use strict';
import assert from 'assert';
import reducer, { create, internal } from '~/content/reducers/ui/thread';

describe(__filename, () => {
    let state;
    beforeEach(() => state = create({
        panel: { isOpen: false, type: 'FORM_POST' },
        postsPopups: [ 'popup1' ]
    }));

    describe('export', () => {
        it('should export reducer', () => {
            let got = reducer();
            let exp = create();
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('reduce()', () => {
        const { reduce } = internal;

        it('should reduce state', () => {
            let ui = {
                panel: { isOpen: true },
                postsPopups: [ 'popup1', 'popup2' ]
            };
            let action = { ui };

            let got = reduce(state, action);
            let exp = {
                panel: { isOpen: true, type: 'FORM_POST' },
                postsPopups: [ 'popup1', 'popup2' ]
            };
            assert.deepStrictEqual(got, exp);
            assert(got.postsPopups === ui.postsPopups);
        });

        it('should ignore unknown properties', () => {
            let ui = {
                panel: { isOpen: true, hoge: 'hogehoge' },
                fuga: 'fugafuga'
            };
            let action = { ui };

            let got = reduce(state, action);
            let exp = {
                panel: { isOpen: true, type: 'FORM_POST' },
                postsPopups: [ 'popup1' ]
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should return state as it is if action is empty', () => {
            let got = reduce(state, {});
            assert(got === state);
        });
    });
});
