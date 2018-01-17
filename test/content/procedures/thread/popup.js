'use strict';
import assert from 'assert';
import * as popup from '~/content/procedures/thread/popup';
import createStore from '~/content/reducers';
import { Post } from '~/content/model';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => {
        let popups = new Map([
            [ 'popup01', { id: 'popup01' } ],
            [ 'popup02', { id: 'popup02' } ],
            [ 'popup03', { id: 'popup03' } ]
        ]);
        let thread = {
            quotePopups: [ 'popup01', 'popup03' ]
        };
        store = createStore({ ui: { thread, popups } });
    });

    const getPopups = () => store.getState().ui.popups;
    const quotePopupIds = () => store.getState().ui.thread.quotePopups;

    describe('openQuotePopup()', () => {
        const { openQuotePopup } = popup;

        it('should open quote popup', () => {
            let posts = [ '100', '101', '102' ]
                .map((no, index) => new Post({ id: `may/b/${no}`, index, no }));
            let thread01 = { url: 'url-thread01', posts: posts.map(({ id }) => id) };
            store = createStore({
                domain: {
                    posts: new Map(posts.map(post => [ post.id, post ])),
                    threads: new Map([ [ thread01.url, thread01 ] ])
                },
                app: {
                    current: { thread: 'url-thread01' },
                    threads: new Map([
                        [ 'url-thread01', { idipIndex: 'instance of IdipIndex' } ]
                    ])
                }
            });

            let opts = {
                component: 'popup01',
                index: 2, quote: '> No.100', event: 'event01'
            };

            openQuotePopup(store, opts);

            let got = pluck(getPopups(), 'component', 'props')[0];
            let exp = {
                component: 'popup01',
                props: {
                    posts: [ posts[0] ],
                    app: { idipIndex: 'instance of IdipIndex' },
                    thread: thread01,
                    event: 'event01'
                }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('_open()', () => {
        const { _open } = popup.internal;

        it('should open popups', () => {
            let id1 = _open(store, { component: 'popup10' });
            let id2 = _open(store, { component: 'popup11' });

            let got = pluck(getPopups(), 'id');
            let exp = [
                { id: 'popup01' }, { id: 'popup02' }, { id: 'popup03' },
                { id: id1 }, { id: id2 }
            ].sort();
            assert.deepStrictEqual(got, exp);

            got = quotePopupIds();
            exp = [ 'popup01', 'popup03', id1, id2 ];
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('closeQuotePopup()', () => {
        const { closeQuotePopup } = popup;

        it('should close last popup', () => {
            closeQuotePopup(store);

            let got = pluck(getPopups(), 'id');
            let exp = [ { id: 'popup01' }, { id: 'popup02' } ];
            assert.deepStrictEqual(got, exp);

            got = quotePopupIds();
            exp = [ 'popup01' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if ui.popups is empty', () => {
            store = createStore();
            let popups = store.getState().ui.popups;
            let quotePopups = store.getState().ui.thread.quotePopups;

            closeQuotePopup(store);

            let got = getPopups();
            assert(got.size === 0);
            got = quotePopupIds();
            assert(got.length === 0);

            got = store.getState().ui.popups;
            assert(got === popups);
            got = store.getState().ui.thread.quotePopups;
            assert(got === quotePopups);
        });
    });

    describe('clearQuotePopup()', () => {
        const { clearQuotePopup } = popup;

        it('should clear popups', () => {
            clearQuotePopup(store);

            let got = pluck(getPopups(), 'id');
            let exp = [ { id: 'popup02' } ];
            assert.deepStrictEqual(got, exp);

            got = quotePopupIds();
            assert(got.length === 0);
        });

        it('should do nothing if popups is empty', () => {
            store = createStore();
            let popups = store.getState().ui.popups;
            let quotePopups = store.getState().ui.thread.quotePopups;

            clearQuotePopup(store);

            let got = getPopups();
            assert(got.size === 0);
            got = quotePopupIds();
            assert(got.length === 0);

            got = store.getState().ui.popups;
            assert(got === popups);
            got = store.getState().ui.thread.quotePopups;
            assert(got === quotePopups);
        });
    });
});
