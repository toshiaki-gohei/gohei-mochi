'use strict';
import assert from 'assert';
import getReplynum from '~/content/procedures/thread/util/replynum';
import createStore from '~/content/reducers';
import { setDomainThreads } from '~/content/reducers/actions';

describe(__filename, () => {
    let store;
    beforeEach(() => store = createStore());

    const URL = 'http://example.net/thread01';

    describe('getReplynum()', () => {
        const url = URL;

        it('should get replynum on load thread', () => {
            let thread = { url };
            store.dispatch(setDomainThreads(thread));

            let posts = [ 'may/b/100', 'may/b/101', 'may/b/102' ];

            let { replynum, newReplynum } = getReplynum(store, { url, posts });
            assert(replynum === 2);
            assert(newReplynum === null);
        });

        it('should get replynum on update thread', () => {
            let thread = {
                url, posts: [ 'may/b/100' ],
                replynum: 0, newReplynum: null
            };
            store.dispatch(setDomainThreads(thread));

            let posts = [ 'may/b/100', 'may/b/101', 'may/b/102' ];

            let { replynum, newReplynum } = getReplynum(store, { url, posts });
            assert(replynum === 2);
            assert(newReplynum === 2);
        });

        it('should get replynum if there are replynum and newReplynum in store', () => {
            let thread = { url, posts: [ 'may/b/100' ] };
            store.dispatch(setDomainThreads(thread));

            let posts = [ 'may/b/100', 'may/b/101', 'may/b/102' ];

            let { replynum, newReplynum } = getReplynum(store, { url, posts });
            assert(replynum === 2);
            assert(newReplynum === null);
        });

        it('should get replynum if replynum set 0 in catalog', () => {
            let thread = { url, replynum: 0, newReplynum: null };
            store.dispatch(setDomainThreads(thread));

            let posts = [ 'may/b/100', 'may/b/101', 'may/b/102' ];

            let { replynum, newReplynum } = getReplynum(store, { url, posts });
            assert(replynum === 2);
            assert(newReplynum === 2);
        });

        it('should get replynum if set replynum set value in catalog', () => {
            let thread = { url, replynum: 1, newReplynum: 1 };
            store.dispatch(setDomainThreads(thread));

            let posts = [ 'may/b/100', 'may/b/101', 'may/b/102' ];

            let { replynum, newReplynum } = getReplynum(store, { url, posts });
            assert(replynum === 2);
            assert(newReplynum === 1);
        });
    });
});
