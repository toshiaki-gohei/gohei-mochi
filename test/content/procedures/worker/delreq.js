'use strict';
import assert from 'assert';
import run from '~/content/procedures/worker/delreq';
import createStore from '~/content/reducers';
import { setAppTasksDelreqs, setAppWorkers } from '~/content/reducers/actions';
import { setup, teardown } from '@/support/dom';
import fetch from '~/content/util/fetch';
import { pluckFromMap as pluck } from '@/support/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store;
    beforeEach(() => store = createStore());

    describe('run()', () => {
        let backup;
        beforeEach(() => backup = fetch.post);
        afterEach(() => fetch.post = backup);

        it('should run delreqs', async () => {
            let delreqs = [
                { post: 'may/b/123001', url: 'url-delreq01' },
                { post: 'may/b/123002', url: 'url-delreq02' },
                { post: 'may/b/123003', url: 'url-delreq03' },
                { post: 'may/b/123004', url: 'url-delreq04' },
                { post: 'may/b/123005', url: 'url-delreq05' }
            ];
            store.dispatch(setAppTasksDelreqs(delreqs));
            let tasks = [ 'may/b/123001', 'may/b/123002', 'may/b/123003', 'may/b/123004' ];
            store.dispatch(setAppWorkers({ delreq: { tasks } }));

            let got = [];
            fetch.post = (url) => {
                got.push(url);
                switch (url) {
                case 'url-delreq02':
                    return { ok: true, text: '<b>同じIPアドレスからの削除依頼があります<br>' };
                case 'url-delreq03':
                    return { ok: true, text: 'faild to submit' };
                case 'url-delreq04':
                    return { ok: false, status: 599, statusText: 'request timeout' };
                default:
                    return { ok: true, text: '<body>登録しました</body>' };
                }
            };

            await run(store, { sleepTime: 10 });

            let exp = [ 'url-delreq01', 'url-delreq02', 'url-delreq03', 'url-delreq04' ];
            assert.deepStrictEqual(got, exp);

            let { app } = store.getState();
            got = pluck(app.tasks.delreqs, 'post', 'status', 'res');
            exp = [
                { post: 'may/b/123001', status: 'complete',
                  res: { ok: true, status: null, statusText: null } },
                { post: 'may/b/123002', status: 'error',
                  res: { ok: false, status: null,
                         statusText: '同じIPアドレスからの削除依頼があります' } },
                { post: 'may/b/123003', status: 'error',
                  res: { ok: false, status: null,
                         statusText: 'なんかエラーだって: console にレスポンスを出力' } },
                { post: 'may/b/123004', status: 'error',
                  res: { ok: false, status: 599, statusText: 'request timeout' } },
                { post: 'may/b/123005', status: null, res: null }
            ];
            assert.deepStrictEqual(got, exp);

            got = app.workers.delreq.tasks;
            exp = [ 'may/b/123002', 'may/b/123003', 'may/b/123004' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should run target delreqs', async () => {
            let delreqs = [
                { post: 'may/b/123001', url: 'url-delreq01', status: null },
                { post: 'may/b/123002', url: 'url-delreq02', status: 'stanby' },
                { post: 'may/b/123003', url: 'url-delreq03', status: 'posting' },
                { post: 'may/b/123004', url: 'url-delreq04', status: 'complete' },
                { post: 'may/b/123005', url: 'url-delreq05', status: 'cancel' },
                { post: 'may/b/123006', url: 'url-delreq06', status: 'error' }
            ];
            store.dispatch(setAppTasksDelreqs(delreqs));
            let tasks = delreqs.map(({ post }) => post);
            store.dispatch(setAppWorkers({ delreq: { tasks } }));

            let got = [];
            fetch.post = (url) => {
                got.push(url);
                return { ok: true, text: '<body>登録しました</body>' };
            };

            await run(store, { sleepTime: 10 });

            let exp = [
                'url-delreq01',
                'url-delreq02',
                'url-delreq03'
            ];
            assert.deepStrictEqual(got, exp);
        });
    });
});
