'use strict';
import assert from 'assert';
import reducer, { internal } from '~/content/reducers/ui/thread';

describe(__filename, () => {
    let state;
    beforeEach(() => state = create({
        panel: { isOpen: false, type: 'FORM_POST' },
        postsPopups: [ 'popup1' ]
    }));

    const create = internal.create;

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

        it('should do nothing if not change props', () => {
            let ui = {
                panel: { isOpen: true },
                postsPopups: [ 'popup1', 'popup2' ]
            };
            let action = { ui };
            let prev = reduce(state, action);

            ui = {};
            action = { ui };
            let next = reduce(prev, action);

            let got = [ 'panel' ].every(prop => {
                return prev[prop] === next[prop];
            });
            assert(got);

            let { panel } = prev;
            ui = { panel };
            action = { ui };
            next = reduce(prev, action);

            got = [ 'panel' ].every(prop => {
                return prev[prop] === next[prop];
            });
            assert(got);
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
