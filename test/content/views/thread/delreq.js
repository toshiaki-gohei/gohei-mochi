'use strict';
import assert from 'assert';
import Delreq from '~/content/views/thread/delreq.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown, tidy } from '@/support/dom';
import createStore from '~/content/reducers';
import * as actions from '~/content/reducers/actions';
import procedures, { defaultMap } from '~/content/procedures';
import { pluckFromMap as pluck } from '@/support/util';
import { sleep } from '~/content/util';

const { setDomainPosts, setAppThreads, setAppTasksDelreqs, setAppWorkers } = actions;

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store, props;
    beforeEach(() => {
        store = createStore({
            app: { current: { thread: URL } },
            ui: { thread: { panel: { isOpen: true, type: 'DELREQ' } } }
        });
        store.dispatch(setAppThreads({ url: URL }));

        let { app, ui: { thread: { panel } } } = store.getState();
        props = { panel, app };
    });

    const URL = 'http://example.net/thread01';

    const createPosts = nolist => {
        return nolist.map((no, index) => ({ id: `may/b/${no}`, index, no }));
    };

    describe('render()', () => {
        beforeEach(() => {
            let posts = createPosts([
                '100', '101', '102', '103', '104', '105', '106', '107', '108', '109',
                '110', '111', '112'
            ]);
            store.dispatch(setDomainPosts(posts));
        });

        it('should render delreq', () => {
            let $el = render(<Delreq {...props} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-delreq">
<div>削除依頼</div>
<div class="gohei-pane gohei-left-pane">.+</div>
<div class="gohei-pane gohei-right-pane">.+</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render left delreq list', () => {
            store.dispatch(setAppTasksDelreqs([
                { post: 'may/b/100', status: 'complete', res: { ok: true, status: 200 } },
                { post: 'may/b/101', status: 'stanby' },
                { post: 'may/b/102', status: null }
            ]));
            let delreq = {
                targets: new Map([
                    [ 'may/b/100', { post: 'may/b/100', checked: true } ],
                    [ 'may/b/101', { post: 'may/b/101', checked: true } ],
                    [ 'may/b/102', { post: 'may/b/102', checked: true } ],
                    [ 'may/b/110', { post: 'may/b/110', checked: true } ],
                    [ 'may/b/111', { post: 'may/b/111', checked: false } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delreq }));

            let commit = procedures(store);
            let { app, ui: { thread: { panel } } } = store.getState();
            let $el = render(<Delreq {...{ commit, panel, app }} />);

            let got = tidy($el.querySelector('.gohei-left-pane .gohei-list').outerHTML);
            let exp = tidy(`
<table class="gohei-list gohei-selectable-list">
<tbody>
<tr class="gohei-tr">
<td class="gohei-td gohei-text-center" title="">完了</td>
<td class="gohei-td">0</td><td class="gohei-td">No.100</td>
</tr>
<tr class="gohei-tr">
<td class="gohei-td gohei-text-center" title="">待機中</td>
<td class="gohei-td">1</td><td class="gohei-td">No.101</td>
</tr>
<tr class="gohei-tr" data-post-id="may/b/102">
<td class="gohei-td gohei-text-center"><input type="checkbox" value="on"></td>
<td class="gohei-td">2</td><td class="gohei-td">No.102</td>
</tr>
<tr class="gohei-tr" data-post-id="may/b/110">
<td class="gohei-td gohei-text-center"><input type="checkbox" value="on"></td>
<td class="gohei-td">10</td><td class="gohei-td">No.110</td>
</tr>
<tr class="gohei-tr" data-post-id="may/b/111">
<td class="gohei-td gohei-text-center"><input type="checkbox" value="on"></td>
<td class="gohei-td">11</td><td class="gohei-td">No.111</td>
</tr>
</tbody>
</table>
`.replace(/\n/g, ''));
            assert(got === exp);
        });

        it('should render right delreq list', () => {
            let delreqs = [
                { post: 'may/b/100', form: { reason: 110 }, status: 'complete',
                  res: { ok: true } },
                { post: 'may/b/101', form: { reason: 111 }, status: 'error',
                  res: { ok: false, statusText: 'request timeout' } },
                { post: 'may/b/102', form: { reason: 101 }, status: 'stanby' },
                { post: 'may/b/103', form: { reason: 101 }, status: null }
            ];
            store.dispatch(setAppTasksDelreqs(delreqs));
            let tasks = delreqs.map(({ post }) => post);
            store.dispatch(setAppWorkers({ delreq: { tasks } }));

            let commit = procedures(store);
            let { app, ui: { thread: { panel } } } = store.getState();
            let $el = render(<Delreq {...{ commit, panel, app }} />);

            let got = $el.querySelector('.gohei-right-pane .gohei-list').outerHTML;
            let exp = `
<table class="gohei-list">
<tbody>
<tr class="gohei-tr">
<td class="gohei-td" title="">完了</td><td class="gohei-td">0</td>
<td class="gohei-td" title="荒らし・嫌がらせ・混乱の元">荒らし・嫌が...</td>
</tr>
<tr class="gohei-tr">
<td class="gohei-td" title="request timeout">エラー</td><td class="gohei-td">1</td>
<td class="gohei-td" title="政治・宗教・民族">政治・宗教・...</td>
</tr>
<tr class="gohei-tr">
<td class="gohei-td" title="">待機中</td><td class="gohei-td">2</td>
<td class="gohei-td" title="中傷・侮辱・名誉毀損">中傷・侮辱・...</td>
</tr>
<tr class="gohei-tr">
<td class="gohei-td" title=""></td><td class="gohei-td">3</td>
<td class="gohei-td" title="中傷・侮辱・名誉毀損">中傷・侮辱・...</td>
</tr>
</tbody>
</table>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should not render delreq if no props', () => {
            let $el = render(<Delreq />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });

    describe('event', () => {
        it('should change delreq state if click delreq list', async () => {
            store.dispatch(setDomainPosts(createPosts([ '100' ])));
            let delreq = {
                targets: new Map([
                    [ 'may/b/100', { post: 'may/b/100', checked: true } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delreq }));

            let commit = procedures(store);
            let { app, ui: { thread: { panel } } } = store.getState();
            let $el = render(<Delreq {...{ commit, panel, app }} />);

            let $rows = $el.querySelectorAll('.gohei-list .gohei-tr');
            simulate.click($rows[0]);

            await sleep(1);

            let { targets } = store.getState().app.threads.get(URL).delreq;
            let got = pluck(targets, 'post', 'checked');
            let exp = [ { post: 'may/b/100', checked: false } ];
            assert.deepStrictEqual(got, exp);
        });

        it('should clear delreq list if click clear button', done => {
            let mock = procedures(store, {
                ...defaultMap(store),
                'thread/clearDelreqTargets': () => done()
            });

            let $el = render(<Delreq {...{ commit: mock, ...props }} />);

            let $btn = $el.querySelector('.gohei-clear-btn');
            simulate.click($btn);
        });
    });

    describe('add to tasks event', () => {
        beforeEach(() => {
            let posts = createPosts([ '100', '101', '102' ]);
            store.dispatch(setDomainPosts(posts));
            store.dispatch(setAppTasksDelreqs([
                { post: 'may/b/100', status: 'complete', res: { ok: true, status: 200 } },
                { post: 'may/b/101', status: 'stanby' },
                { post: 'may/b/102', status: null }
            ]));
            let delreq = {
                targets: new Map([
                    [ 'may/b/100', { post: 'may/b/100', checked: true } ],
                    [ 'may/b/101', { post: 'may/b/101', checked: true } ],
                    [ 'may/b/102', { post: 'may/b/102', checked: true } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delreq }));
        });

        it('should add to tasks if click delreq button', () => {
            let registerDelreqTasks, run;
            let p1 = new Promise(resolve => registerDelreqTasks = resolve);
            let p2 = new Promise(resolve => run = resolve);

            let mock = procedures(store, {
                ...defaultMap(store),
                'thread/registerDelreqTasks': registerDelreqTasks,
                'worker/run': run
            });

            let { app, ui: { thread: { panel } } } = store.getState();
            let $el = render(<Delreq {...{ commit: mock, panel, app }} />);

            $el.setState({ reason: 110, isVisibleReasons: true }, () => {
                let $btn = $el.querySelector('.gohei-delreq-btn');
                simulate.click($btn);
            });

            return Promise.all([
                p1.then(({ url, reason }) => {
                    assert(url === 'http://example.net/thread01');
                    assert(reason === 110);
                }),
                p2.then(worker => {
                    assert(worker === 'delreq');
                })
            ]).then(() => {
                let got = $el.state.isVisibleReasons;
                assert(got === false);
            });
        });
    });
});
