'use strict';
import assert from 'assert';
import run from '~/content/procedures/worker/postdel';
import createStore from '~/content/reducers';
import { setDomainPosts, setAppTasksPostdels, setAppWorkers } from '~/content/reducers/actions';
import { setup, teardown } from '@/support/dom';
import fetch from '~/content/util/fetch';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store;
    beforeEach(() => {
        store = createStore();
        let posts = [ 123000, 123001, 123002, 123003, 123004, 123005, 123006 ]
            .map((no, index) => ({ id: `may/b/${no}`, index, no }));
        store.dispatch(setDomainPosts(posts));
    });

    describe('run()', () => {
        let backup;
        beforeEach(() => backup = fetch.post);
        afterEach(() => fetch.post = backup);

        it('should run postdels', async () => {
            let postdels = [
                { post: 'may/b/123001', url: 'url-postdel01' },
                { post: 'may/b/123002', url: 'url-postdel02' },
                { post: 'may/b/123003', url: 'url-postdel03' },
                { post: 'may/b/123004', url: 'url-postdel04' },
                { post: 'may/b/123005', url: 'url-postdel05' }
            ];
            store.dispatch(setAppTasksPostdels(postdels));
            let tasks = [ 'may/b/123001', 'may/b/123002', 'may/b/123003', 'may/b/123004' ];
            store.dispatch(setAppWorkers({ postdel: { tasks } }));

            let got = [];
            fetch.post = (url) => {
                got.push(url);
                switch (url) {
                case 'url-postdel02':
                    return { ok: true, text: '<b>削除したい記事をチェックしてください<br>' };
                case 'url-postdel03':
                    return { ok: true, text: 'faild to submit' };
                case 'url-postdel04':
                    return { ok: false, status: 599, statusText: 'request timeout' };
                default:
                    return { ok: true, text: '<META HTTP-EQUIV="refresh" content="0;URL=res/123456000.htm">' };
                }
            };

            await run(store, { sleepTime: 10 });

            let exp = [ 'url-postdel01', 'url-postdel02', 'url-postdel03', 'url-postdel04' ];
            assert.deepStrictEqual(got, exp);

            let { app } = store.getState();
            got = pluck(app.tasks.postdels, 'post', 'status', 'res');
            exp = [
                { post: 'may/b/123001', status: 'complete',
                  res: { ok: true, status: null, statusText: null } },
                { post: 'may/b/123002', status: 'error',
                  res: { ok: false, status: null,
                         statusText: '削除したい記事をチェックしてください' } },
                { post: 'may/b/123003', status: 'error',
                  res: { ok: false, status: null,
                         statusText: 'なんかエラーだって: console にレスポンスを出力' } },
                { post: 'may/b/123004', status: 'error',
                  res: { ok: false, status: 599, statusText: 'request timeout' } },
                { post: 'may/b/123005', status: null, res: null }
            ];
            assert.deepStrictEqual(got, exp);

            got = app.workers.postdel.tasks;
            exp = [ 'may/b/123002', 'may/b/123003', 'may/b/123004' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should run target postdels', async () => {
            let postdels = [
                { post: 'may/b/123001', url: 'url-postdel01', status: null },
                { post: 'may/b/123002', url: 'url-postdel02', status: 'stanby' },
                { post: 'may/b/123003', url: 'url-postdel03', status: 'posting' },
                { post: 'may/b/123004', url: 'url-postdel04', status: 'complete' },
                { post: 'may/b/123005', url: 'url-postdel05', status: 'cancel' },
                { post: 'may/b/123006', url: 'url-postdel06', status: 'error' }
            ];
            store.dispatch(setAppTasksPostdels(postdels));
            let tasks = postdels.map(({ post }) => post);
            store.dispatch(setAppWorkers({ postdel: { tasks } }));

            let got = [];
            fetch.post = (url) => {
                got.push(url);
                return { ok: true, text: '<body>登録しました</body>' };
            };

            await run(store, { sleepTime: 10 });

            let exp = [
                'url-postdel01',
                'url-postdel02',
                'url-postdel03'
            ];
            assert.deepStrictEqual(got, exp);
        });
    });
});
