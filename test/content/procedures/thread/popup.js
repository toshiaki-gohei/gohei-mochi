'use strict';
import assert from 'assert';
import * as popup from '~/content/procedures/thread/popup';
import createStore from '~/content/reducers';
import { setDomainPosts, setDomainThreads } from '~/content/reducers/actions';
import { Post } from '~/content/model';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    let store;
    beforeEach(() => {
        let thread01 = { url: 'url-thread01', posts: [] };
        let popups = new Map([
            [ 'popup01', { id: 'popup01', component: 'POPUP01' } ],
            [ 'popup02', { id: 'popup02', component: 'POPUP02' } ],
            [ 'popup03', { id: 'popup03', component: 'POPUP03' } ]
        ]);

        store = createStore({
            domain: {
                threads: new Map([ [ thread01.url, thread01 ] ])
            },
            app: {
                current: { thread: thread01.url }
            },
            ui: {
                popups,
                thread: {
                    postsPopups: [ 'popup01', 'popup03' ]
                }
            }
        });
    });

    const getPopups = () => store.getState().ui.popups;
    const postsPopupIds = () => store.getState().ui.thread.postsPopups;

    describe('openPostsPopup()', () => {
        const { openPostsPopup } = popup;

        it('should open popups', () => {
            let id10 = openPostsPopup(store, { component: 'POPUP10' });
            let id11 = openPostsPopup(store, { component: 'POPUP11' });

            let got = pluck(getPopups(), 'id');
            let exp = [
                { id: 'popup01' }, { id: 'popup02' }, { id: 'popup03' },
                { id: id10 }, { id: id11 }
            ].sort();
            assert.deepStrictEqual(got, exp);

            got = postsPopupIds();
            exp = [ 'popup01', 'popup03', id10, id11 ];
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('openQuotePopup()', () => {
        const { openQuotePopup } = popup;

        it('should open quote popup', () => {
            let posts = [ '100', '101', '102' ]
                .map((no, index) => new Post({ id: `may/b/${no}`, index, no }));
            store.dispatch(setDomainPosts(posts));
            store.dispatch(setDomainThreads({
                url: 'url-thread01', posts: posts.map(({ id }) => id)
            }));

            let opts = {
                component: 'POPUP10',
                index: 2, quote: '> No.100', event: 'mouseover'
            };

            openQuotePopup(store, opts);

            let got = pluck(getPopups(), 'component', 'props')[3];
            let exp = {
                component: 'POPUP10',
                props: {
                    posts: [ posts[0].id ],
                    thread: 'url-thread01',
                    event: 'mouseover'
                }
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('closePostsPopup()', () => {
        const { closePostsPopup } = popup;

        it('should close last popup', () => {
            closePostsPopup(store);

            let got = pluck(getPopups(), 'id');
            let exp = [ { id: 'popup01' }, { id: 'popup02' } ];
            assert.deepStrictEqual(got, exp);

            got = postsPopupIds();
            exp = [ 'popup01' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should do nothing if ui.popups is empty', () => {
            store = createStore();
            let popups = store.getState().ui.popups;
            let postsPopups = store.getState().ui.thread.postsPopups;

            closePostsPopup(store);

            let got = getPopups();
            assert(got.size === 0);
            got = postsPopupIds();
            assert(got.length === 0);

            got = store.getState().ui.popups;
            assert(got === popups);
            got = store.getState().ui.thread.postsPopups;
            assert(got === postsPopups);
        });
    });

    describe('clearPostsPopup()', () => {
        const { clearPostsPopup } = popup;

        it('should clear popups', () => {
            clearPostsPopup(store);

            let got = pluck(getPopups(), 'id');
            let exp = [ { id: 'popup02' } ];
            assert.deepStrictEqual(got, exp);

            got = postsPopupIds();
            assert(got.length === 0);
        });

        it('should do nothing if popups is empty', () => {
            store = createStore();
            let popups = store.getState().ui.popups;
            let postsPopups = store.getState().ui.thread.postsPopups;

            clearPostsPopup(store);

            let got = getPopups();
            assert(got.size === 0);
            got = postsPopupIds();
            assert(got.length === 0);

            got = store.getState().ui.popups;
            assert(got === popups);
            got = store.getState().ui.thread.postsPopups;
            assert(got === postsPopups);
        });
    });
});
