'use strict';
import assert from 'assert';
import add from '~/content/procedures/task/postdel/add';
import createStore from '~/content/reducers';
import { setup, teardown } from '@/support/dom';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store;
    const getPostdels = () => store.getState().app.tasks.postdels;

    const createPosts = nolist => {
        let posts = nolist.map((no, index) => ({ id: `may/b/${no}`, index, no }));
        return new Map(posts.map(post => [ post.id, post ]));
    };
    const postIds = () => {
        let ids = [];
        for (let [ , post ] of store.getState().domain.posts) ids.push(post.id);
        return ids;
    };

    const URL = 'https://may.2chan.net/b/futaba.php?guid=on';

    describe('add()', () => {
        beforeEach(() => store = createStore({
            domain: { posts: createPosts([ '100', '101', '102' ]) }
        }));

        it('should add postdels', () => {
            add(store, { url: URL, posts: postIds() });

            let got = pluck(getPostdels(), 'post', 'url', 'form', 'status');
            let exp = [
                { post: 'may/b/100', url: URL,
                  form: { mode: 'usrdel', onlyimgdel: null, pwd: '' },
                  status: null },
                { post: 'may/b/101', url: URL,
                  form: { mode: 'usrdel', onlyimgdel: null, pwd: '' },
                  status: null },
                { post: 'may/b/102', url: URL,
                  form: { mode: 'usrdel', onlyimgdel: null, pwd: '' },
                  status: null },
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should add postdels with opts', () => {
            let posts = postIds();
            let onlyimgdel = 'on';
            let pwd = 'password';
            let status = 'stanby';
            add(store, { url: URL, posts, onlyimgdel, pwd, status });

            let got = pluck(getPostdels(), 'post', 'url', 'form', 'status');
            let exp = [
                { post: 'may/b/100', url: URL,
                  form: { mode: 'usrdel', onlyimgdel: 'on', pwd: 'password' },
                  status: 'stanby' },
                { post: 'may/b/101', url: URL,
                  form: { mode: 'usrdel', onlyimgdel: 'on', pwd: 'password' },
                  status: 'stanby' },
                { post: 'may/b/102', url: URL,
                  form: { mode: 'usrdel', onlyimgdel: 'on', pwd: 'password' },
                  status: 'stanby' },
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should add postdels except already added', () => {
            let postdels = new Map([
                [ 'may/b/100', { post: 'may/b/100', url: null, form: {}, status: 'complete' } ],
                [ 'may/b/101', { post: 'may/b/101', url: null, form: {}, status: null } ]
            ]);
            store = createStore({
                domain: { posts: createPosts([ '100', '101', '102' ]) },
                app: { tasks: { postdels } }
            });

            let posts = postIds();
            let pwd = 'password';
            let status = 'stanby';
            add(store, { url: URL, posts, pwd, status });

            let got = pluck(getPostdels(), 'post', 'url', 'form', 'status');
            let exp = [
                { post: 'may/b/100', url: null, form: {}, status: 'complete' },
                { post: 'may/b/101', url: null, form: {}, status: null },
                { post: 'may/b/102', url: URL,
                  form: { mode: 'usrdel', onlyimgdel: null, pwd: 'password' },
                  status: 'stanby' },
            ];
            assert.deepStrictEqual(got, exp);
        });
    });
});
