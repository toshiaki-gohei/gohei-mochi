'use strict';
import assert from 'assert';
import updateSearchResults, { internal } from '~/content/procedures/catalog/update-search-results';
import createStore from '~/content/reducers';
import * as actions from '~/content/reducers/actions';
import { Post } from '~/content/model';
import fetch from '~/content/util/fetch';

const { setDomainPosts, setDomainThreads, setDomainCatalogs, setAppCatalogs } = actions;

describe(__filename, () => {
    let store;
    beforeEach(() => {
        store = createStore({ app: { current: { catalog: URL } } });
        store.dispatch(setDomainCatalogs({ url: URL }));
        store.dispatch(setAppCatalogs({ url: URL }));
    });

    const URL = 'http://example.net/catalog01';

    describe('updateSearchResults()', () => {
        let backup;
        beforeEach(() => backup = fetch.getThread);
        afterEach(() => fetch.getThread = backup);

        const url = URL;

        const createPosts = nolist => {
            return nolist.map((no, index) => new Post({ id: `may/b/${no}`, index, no }));
        };

        it('should update search resulsts', async () => {
            let posts01 = createPosts([ '01001', '01002', '01003' ]);
            let posts02 = createPosts([ '02001' ]);
            let posts03 = createPosts([ '03001' ]);
            let posts10 = createPosts([ '10001' ]);
            store.dispatch(setDomainPosts([].concat(posts01, posts02, posts03, posts10)));

            let thread01 = {
                url: 'https://may.2chan.net/b/res/123001.htm',
                posts: posts01.map(post => post.id),
                replynum: 2, newReplynum: null
            };
            let thread02 = {
                url: 'https://may.2chan.net/b/res/123002.htm',
                posts: posts02.map(post => post.id),
                replynum: 0, newReplynum: null
            };
            let thread03 = {
                url: 'https://may.2chan.net/b/res/123003.htm',
                posts: posts03.map(post => post.id),
                replynum: 0, newReplynum: null
            };
            let thread10 = {
                url: 'https://may.2chan.net/b/res/123010.htm',
                posts: posts10.map(post => post.id),
                replynum: 0, newReplynum: null
            };
            store.dispatch(setDomainThreads([ thread01, thread02, thread03, thread10 ]));

            let threads = [
                'https://may.2chan.net/b/res/123001.htm',
                'https://may.2chan.net/b/res/123002.htm',
                'https://may.2chan.net/b/res/123003.htm'
            ];
            let searchResults = [
                'https://may.2chan.net/b/res/123001.htm',
                'https://may.2chan.net/b/res/123002.htm',
                'https://may.2chan.net/b/res/123010.htm'
            ];
            store.dispatch(setDomainCatalogs({ url, threads }));
            store.dispatch(setAppCatalogs({ url, searchResults }));

            fetch.getThread = requrl => {
                let posts = [];
                switch (requrl) {
                case 'https://may.2chan.net/b/res/123010.htm':
                    posts = [ { no: '10001' }, { no: '10002' }, { no: '10003' } ];
                    break;
                case 'https://may.2chan.net/b/res/123001.htm':
                case 'https://may.2chan.net/b/res/123002.htm':
                case 'https://may.2chan.net/b/res/123003.htm':
                default:
                    throw new Error('not reach here');
                }

                let headers = {
                    'last-modified': 'Sun, 01 Jan 2017 01:23:45 GMT',
                    get(name) { return this[name]; }
                };
                let contents = { thread: { posts } };

                return { ok: true, status: 200, headers, contents };
            };

            await updateSearchResults(store, { sleepTime: 1 });

            let { domain } = store.getState();

            let got = [];
            for (let thread of domain.threads.values()) {
                let { url, replynum, newReplynum } = thread;
                got.push({ url, replynum, newReplynum });
            }
            let exp = [
                { url: 'https://may.2chan.net/b/res/123001.htm', replynum: 2, newReplynum: null },
                { url: 'https://may.2chan.net/b/res/123002.htm', replynum: 0, newReplynum: null },
                { url: 'https://may.2chan.net/b/res/123003.htm', replynum: 0, newReplynum: null },
                { url: 'https://may.2chan.net/b/res/123010.htm', replynum: 2, newReplynum: 2 }
            ];
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('getUpdateTargets()', () => {
        const { getUpdateTargets } = internal;

        const url = URL;

        it('should get update targets', () => {
            let threads = [ 'url-thread01', 'url-thread02', 'url-thread03' ];
            let searchResults = [ 'url-thread01', 'url-thread02', 'url-thread10' ];
            store.dispatch(setDomainCatalogs({ url, threads }));
            store.dispatch(setAppCatalogs({ url, searchResults }));

            let got = getUpdateTargets(store);
            let exp = [ 'url-thread10' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should get empty list if threads contain all search results', () => {
            let threads = [ 'url-thread01', 'url-thread02', 'url-thread03' ];
            let searchResults = [ 'url-thread01', 'url-thread02', 'url-thread03' ];
            store.dispatch(setDomainCatalogs({ url, threads }));
            store.dispatch(setAppCatalogs({ url, searchResults }));

            let got = getUpdateTargets(store);
            assert.deepStrictEqual(got, []);
        });

        it('should get all search results if threads are not found', () => {
            let threads = [ 'url-thread01', 'url-thread02', 'url-thread03' ];
            let searchResults = [ 'url-thread10', 'url-thread11', 'url-thread12' ];
            store.dispatch(setDomainCatalogs({ url, threads }));
            store.dispatch(setAppCatalogs({ url, searchResults }));

            let got = getUpdateTargets(store);
            let exp = [ 'url-thread10', 'url-thread11', 'url-thread12' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should get empty list if there are no search results', () => {
            let got = getUpdateTargets(store);
            assert.deepStrictEqual(got, []);
        });
    });
});
