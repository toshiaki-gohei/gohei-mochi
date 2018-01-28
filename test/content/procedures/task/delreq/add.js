'use strict';
import assert from 'assert';
import * as procedures from '~/content/procedures/task/delreq/add';
import createStore from '~/content/reducers';
import { setup, teardown } from '@/support/dom';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store;
    const getDelreqs = () => store.getState().app.tasks.delreqs;

    const createPosts = nolist => {
        let posts = nolist.map((no, index) => ({ id: `may/b/${no}`, index, no }));
        return new Map(posts.map(post => [ post.id, post ]));
    };
    const postIds = () => {
        let ids = [];
        for (let [ , post ] of store.getState().domain.posts) ids.push(post.id);
        return ids;
    };

    const URL = 'https://may.2chan.net/b/res/123456789.htm';
    const DELREQ_URL = 'https://may.2chan.net/del.php?guid=on';

    describe('add()', () => {
        const { add } = procedures;

        beforeEach(() => store = createStore({
            domain: { posts: createPosts([ '100', '101', '102' ]) }
        }));

        it('should add delreqs', () => {
            add(store, { url: URL, posts: postIds() });

            let got = pluck(getDelreqs(), 'post', 'url', 'form', 'status');
            let exp = [
                { post: 'may/b/100', url: DELREQ_URL,
                  form: { reason: null, mode: 'post', b: 'b', d: '100', dlv: 0 },
                  status: null },
                { post: 'may/b/101', url: DELREQ_URL,
                  form: { reason: null, mode: 'post', b: 'b', d: '101', dlv: 0 },
                  status: null },
                { post: 'may/b/102', url: DELREQ_URL,
                  form: { reason: null, mode: 'post', b: 'b', d: '102', dlv: 0 },
                  status: null },
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should add delreqs with reason and status', () => {
            let posts = postIds();
            let reason = 110;
            let status = 'stanby';
            add(store, { url: URL, posts, reason, status });

            let got = pluck(getDelreqs(), 'post', 'url', 'form', 'status');
            let exp = [
                { post: 'may/b/100', url: DELREQ_URL,
                  form: { reason: 110, mode: 'post', b: 'b', d: '100', dlv: 0 },
                  status: 'stanby' },
                { post: 'may/b/101', url: DELREQ_URL,
                  form: { reason: 110, mode: 'post', b: 'b', d: '101', dlv: 0 },
                  status: 'stanby' },
                { post: 'may/b/102', url: DELREQ_URL,
                  form: { reason: 110, mode: 'post', b: 'b', d: '102', dlv: 0 },
                  status: 'stanby' },
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should add delreqs except already added', () => {
            let delreqs = new Map([
                [ 'may/b/100', { post: 'may/b/100', url: null, form: {}, status: 'complete' } ],
                [ 'may/b/101', { post: 'may/b/101', url: null, form: {}, status: null } ]
            ]);
            store = createStore({
                domain: { posts: createPosts([ '100', '101', '102' ]) },
                app: { tasks: { delreqs } }
            });

            let posts = postIds();
            let reason = 110;
            let status = 'stanby';
            add(store, { url: URL, posts, reason, status });

            let got = pluck(getDelreqs(), 'post', 'url', 'form', 'status');
            let exp = [
                { post: 'may/b/100', url: null, form: {}, status: 'complete' },
                { post: 'may/b/101', url: null, form: {}, status: null },
                { post: 'may/b/102', url: DELREQ_URL,
                  form: { reason: 110, mode: 'post', b: 'b', d: '102', dlv: 0 },
                  status: 'stanby' },
            ];
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('delreqUrl', () => {
        const { delreqUrl } = procedures.internal;

        it('should return delreq url', () => {
            let got = delreqUrl('https://may.2chan.net/b/res/123456789.htm');
            assert(got === 'https://may.2chan.net/del.php?guid=on');

            got = delreqUrl('https://may.2chan.net/b/futaba.php?mode=cat');
            assert(got === 'https://may.2chan.net/del.php?guid=on');

            got = delreqUrl('http://may.2chan.net/b/res/123456789.htm');
            assert(got === 'http://may.2chan.net/del.php?guid=on');
            got = delreqUrl('http://may.2chan.net/b/futaba.php?mode=cat');
            assert(got === 'http://may.2chan.net/del.php?guid=on');
        });

        it('should throw exception if arg url is not correct url', () => {
            let got, exp;
            try { delreqUrl('http://www.2chan.net/'); } catch (e) { got = e.message; }
            exp = 'thread url or catalog url is required: http://www.2chan.net/';
            assert(got === exp);

            try { delreqUrl('http://example.net'); } catch (e) { got = e.message; }
            exp = 'thread url or catalog url is required: http://example.net';
            assert(got === exp);
        });
    });
});
