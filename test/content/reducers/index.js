'use strict';
import assert from 'assert';
import createStore from '~/content/reducers';

describe(__filename, () => {
    const initialState = {
        domain: {
            posts: new Map(),
            threads: new Map(),
            catalogs: new Map()
        },
        app: {
            current: { thread: null, catalog: null },
            threads: new Map(),
            catalogs: new Map(),
            tasks: {
                delreqs: new Map(),
                postdels: new Map()
            },
            workers: {
                delreq: { tasks: [], id: null }
            }
        },
        ui: {
            thread: {
                panel: { isOpen: null, type: null },
                postsPopups: []
            },
            preferences: {
                catalog: {
                    colnum: null, rownum: null,
                    title: { length: null, position: null },
                    thumb: { size: null }
                },
                video: { loop: null, muted: null, volume: null }
            },
            popups: new Map()
        }
    };

    describe('export', () => {
        it('should export createStore()', () => {
            assert(typeof createStore === 'function');
        });
    });

    describe('createStore()', () => {
        it('should create store', () => {
            let store = createStore();
            assert(typeof store.dispatch === 'function');

            let got = store.getState();
            assert.deepStrictEqual(got, initialState);
        });

        it('should create store if pass initial state', () => {
            let store = createStore({
                domain: {
                    posts: new Map([
                        [ 'may/b/123000', { id: 'may/b/123000', name: 'スレあき' } ],
                        [ 'may/b/123001', { id: 'may/b/123001', name: 'としあき1' } ],
                        [ 'may/b/123002', { id: 'may/b/123002', name: 'としあき2' } ]
                    ])
                }
            });
            assert(typeof store.dispatch === 'function');

            let got = store.getState();
            let exp = {
                ...initialState,
                domain: {
                    ...initialState.domain,
                    posts: new Map([
                        [ 'may/b/123000', { id: 'may/b/123000', name: 'スレあき' } ],
                        [ 'may/b/123001', { id: 'may/b/123001', name: 'としあき1' } ],
                        [ 'may/b/123002', { id: 'may/b/123002', name: 'としあき2' } ]
                    ])
                }
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});
