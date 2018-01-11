'use strict';
import assert from 'assert';
import quote, { internal } from '~/content/procedures/thread/quote';
import createStore from '~/content/reducers';
import { setAppThreads } from '~/content/reducers/actions';
import { Post } from '~/content/model';

describe(__filename, () => {
    let store;
    beforeEach(() => {
        let file = { url: 'file url', name: 'file name' };
        let posts = [
            { id: 'may/b/123000', index: 0, no: '123000', raw: { blockquote: 'op' }, file },
            { id: 'may/b/123001', index: 1, no: '123001', raw: { blockquote: 'post1' } },
        ].map(opts => new Post(opts));

        store = createStore({
            domain: {
                posts: new Map(posts.map(post => [ post.id, post ])),
                threads: new Map([
                    [ 'url-thread01', { url: 'url-thread01', posts: posts.map(({ id }) => id) } ]
                ])
            },
            app: {
                current: { thread: 'url-thread01' }
            }
        });
        store.dispatch(setAppThreads({ url: 'url-thread01' }));
    });

    const getComment = () => store.getState().app.threads.get('url-thread01').postform.comment;

    describe('quote()', () => {
        it('should set quoted No to comment', () => {
            quote(store, { id: 'may/b/123000', type: 'no' });
            let got = getComment();
            assert(got == '>No.123000\n');
        });

        it('should set quoted comment to comment', () => {
            quote(store, { id: 'may/b/123001', type: 'comment' });
            let got = getComment();
            assert(got == '>post1\n');
        });

        it('should set quoted filename to comment', () => {
            quote(store, { id: 'may/b/123000', type: 'file' });
            let got = getComment();
            assert(got == '>file name\n');
        });

        it('should not set if unknown type', () => {
            let got;
            try {
                quote(store, { id: 'may/b/123000', type: 'unknown' });
            } catch (e) { got = e.message; }
            assert(got === 'unknown type: unknown');
        });

        it('should append quote to comment', () => {
            let postform = { comment: 'abc' };
            store.dispatch(setAppThreads({ url: 'url-thread01', postform }));

            quote(store, { id: 'may/b/123000', type: 'no' });
            let got = getComment();
            assert(got == `\
abc
>No.123000
`);
        });
    });

    describe('quotify()', () => {
        const { quotify } = internal;

        it('should return quote', () => {
            let got = quotify('abc');
            assert(got === '>abc\n');

            got = quotify(`\
abc

def`);
            assert(got === `\
>abc
>
>def
`);
        });

        it('should not quote last line if only \n', () => {
            assert(quotify('abc\n') === '>abc\n'); // not '>abc\n>'
        });

        it('should return null if text is null', () => {
            assert(quotify(null) === null);
            assert(quotify('') === null);
            assert(quotify() === null);
        });
    });
});
