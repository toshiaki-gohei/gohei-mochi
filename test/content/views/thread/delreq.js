'use strict';
import assert from 'assert';
import Delreq, { internal } from '~/content/views/thread/delreq.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown, tidy } from '@/support/dom';
import createStore from '~/content/reducers';
import * as actions from '~/content/reducers/actions';
import procedures from '~/content/procedures';

const { setAppThreads, setAppDelreqs, setAppWorkers } = actions;

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store, props;
    beforeEach(() => {
        store = createStore({
            app: { current: { thread: url } },
            ui: { thread: { panel: { isOpen: true, type: 'DELREQ' } } }
        });
        store.dispatch(setAppThreads({ url }));

        let { app, ui } = store.getState();
        props = { panel: ui.thread.panel, app };
    });

    const url = 'http://example.net/thread01';

    const createPosts = nolist => {
        return nolist.reduce((map, no, index) => {
            let id = `may/b/${no}`;
            map.set(id, { id, index, no });
            return map;
        }, new Map());
    };

    describe('render()', () => {
        const posts = createPosts([
            '100', '101', '102', '103', '104', '105', '106', '107', '108', '109',
            '110', '111', '112'
        ]);

        it('should render delreq', () => {
            let $el = render(<Delreq {...props} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-delreq">
<div>削除依頼</div>
<div class="gohei-left-pane">.+</div>
<div class="gohei-right-pane">.+</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render left delreq list', () => {
            store.dispatch(setAppDelreqs([
                { post: 'may/b/100', status: 'complete', res: { ok: true, status: 200 } },
                { post: 'may/b/101', status: 'stanby' },
                { post: 'may/b/102', status: null }
            ]));
            let delreqs = [ 'may/b/100', 'may/b/101', 'may/b/102', 'may/b/110', 'may/b/111' ];
            store.dispatch(setAppThreads({ url, delreqs }));

            let mock = procedures(store, {
                'sync/post': id => posts.get(id)
            });

            let { app, ui } = store.getState();
            let $el = render(<Delreq {...{ commit: mock, panel: ui.thread.panel, app }} />);

            let tdCss = 'gohei-td gohei-selectable';

            let got = tidy($el.querySelector('.gohei-left-pane .gohei-delreq-list').outerHTML);
            let exp = tidy(`
<table class="gohei-delreq-list">
<tbody>
<tr class="gohei-tr">
<td class="gohei-td gohei-text-center">完了</td>
<td class="gohei-td">0</td><td class="gohei-td">No.100</td>
</tr>
<tr class="gohei-tr">
<td class="gohei-td gohei-text-center">待機中</td>
<td class="gohei-td">1</td><td class="gohei-td">No.101</td>
</tr>
<tr class="gohei-tr" data-post-id="may/b/102">
<td class="gohei-td gohei-text-center gohei-selectable"><input type="checkbox" value="on"></td>
<td class="${tdCss}">2</td><td class="${tdCss}">No.102</td>
</tr>
<tr class="gohei-tr" data-post-id="may/b/110">
<td class="gohei-td gohei-text-center gohei-selectable"><input type="checkbox" value="on"></td>
<td class="${tdCss}">10</td><td class="${tdCss}">No.110</td>
</tr>
<tr class="gohei-tr" data-post-id="may/b/111">
<td class="gohei-td gohei-text-center gohei-selectable"><input type="checkbox" value="on"></td>
<td class="${tdCss}">11</td><td class="${tdCss}">No.111</td>
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
            store.dispatch(setAppDelreqs(delreqs));
            let tasks = delreqs.map(({ post }) => post);
            store.dispatch(setAppWorkers({ delreq: { tasks } }));

            let mock = procedures(store, {
                'sync/post': id => posts.get(id)
            });

            let { app, ui } = store.getState();
            let $el = render(<Delreq {...{ commit: mock, panel: ui.thread.panel, app }} />);

            let got = $el.querySelector('.gohei-right-pane .gohei-delreq-list').outerHTML;
            let exp = `
<table class="gohei-delreq-list">
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
        it('should clear delreq list if click clear button', done => {
            let mock = procedures(null, {
                'thread/clearDelreqs': () => done()
            });

            let { app, ui } = store.getState();
            let $el = render(<Delreq {...{ commit: mock, panel: ui.thread.panel, app }} />);

            let $btn = $el.querySelector('.gohei-clear-btn');
            simulate.click($btn);
        });
    });

    describe('add to tasks event', () => {
        beforeEach(() => {
            store.dispatch(setAppDelreqs([
                { post: 'may/b/100', status: 'complete', res: { ok: true, status: 200 } },
                { post: 'may/b/101', status: 'stanby' },
                { post: 'may/b/102', status: null }
            ]));
            let delreqs = [ 'may/b/100', 'may/b/101', 'may/b/102' ];
            store.dispatch(setAppThreads({ url, delreqs }));
        });

        let posts = createPosts([ '100', '101', '102' ]);

        it('should add to tasks if click delreq button', () => {
            let registerDelreqTasks, run;
            let p1 = new Promise(resolve => registerDelreqTasks = resolve);
            let p2 = new Promise(resolve => run = resolve);

            let mock = procedures(null, {
                'sync/post': id => posts.get(id),
                'thread/registerDelreqTasks': registerDelreqTasks,
                'worker/run': run
            });

            let { app, ui } = store.getState();
            let $el = render(<Delreq {...{ commit: mock, panel: ui.thread.panel, app }} />);

            $el.setState({ reason: 110, isVisibleReasons: true }, () => {
                let $btn = $el.querySelector('.gohei-delreq-btn');
                simulate.click($btn);
            });

            return Promise.all([
                p1.then(({ url, posts, reason }) => {
                    assert(url === 'http://example.net/thread01');
                    let got = posts.map(({ id }) => id);
                    assert.deepStrictEqual(got, [ 'may/b/102' ]);
                    assert(reason === 110);
                }),
                p2.then(worker => {
                    assert(worker === 'delreq');
                })
            ]).then(() => {
                let got = $el.state.checked;
                let exp = new Map([ [ 'may/b/100', null ], [ 'may/b/101', null ] ]);
                assert.deepStrictEqual(got, exp);
                assert($el.state.isVisibleReasons === false);
            });
        });
    });

    describe('createChecked()', () => {
        const { createChecked } = internal;

        beforeEach(() => {
            store.dispatch(setAppDelreqs([
                { post: 'may/b/100', status: 'complete' },
                { post: 'may/b/101', status: 'stanby' },
                { post: 'may/b/102', status: null }
            ]));
        });

        it('should create checked', () => {
            let delreqs = [ 'may/b/110', 'may/b/111', 'may/b/112' ];
            store.dispatch(setAppThreads({ url, delreqs }));
            let { app } = store.getState();

            let nextProps = { app };

            let got = createChecked(null, nextProps);
            let exp = new Map([
                [ 'may/b/110', true ],
                [ 'may/b/111', true ],
                [ 'may/b/112', true ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should create checked if pass state', () => {
            let delreqs = [ 'may/b/110', 'may/b/111', 'may/b/112' ];
            store.dispatch(setAppThreads({ url, delreqs }));
            let { app } = store.getState();

            let checked = new Map([
                [ 'may/b/110', null ], [ 'may/b/111', false ], [ 'may/b/112', true ]
            ]);

            let state = { checked };
            let nextProps = { app };

            let got = createChecked(state, nextProps);
            let exp = new Map([
                [ 'may/b/110', null ],
                [ 'may/b/111', false ],
                [ 'may/b/112', true ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should create checked if exists state.app.delreqs', () => {
            let delreqs = [ 'may/b/100', 'may/b/101', 'may/b/102' ];
            store.dispatch(setAppThreads({ url, delreqs }));
            let { app } = store.getState();

            let nextProps = { app };

            let got = createChecked(null, nextProps);
            let exp = new Map([
                [ 'may/b/100', null ],
                [ 'may/b/101', null ],
                [ 'may/b/102', true ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should create checked if pass state and exists state.app.delreqs', () => {
            let delreqs = [ 'may/b/100', 'may/b/101', 'may/b/102',
                            'may/b/110', 'may/b/111', 'may/b/112' ];
            store.dispatch(setAppThreads({ url, delreqs }));
            let { app } = store.getState();

            let checked = new Map([
                [ 'may/b/110', null ], [ 'may/b/111', false ], [ 'may/b/112', true ]
            ]);

            let state = { checked };
            let nextProps = { app };

            let got = createChecked(state, nextProps);
            let exp = new Map([
                [ 'may/b/100', null ],
                [ 'may/b/101', null ],
                [ 'may/b/102', true ],
                [ 'may/b/110', null ],
                [ 'may/b/111', false ],
                [ 'may/b/112', true ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should create checked (state has priority)', () => {
            let delreqs = [ 'may/b/100', 'may/b/101', 'may/b/102' ];
            store.dispatch(setAppThreads({ url, delreqs }));
            let { app } = store.getState();

            let checked = new Map([
                [ 'may/b/100', null ], [ 'may/b/101', false ], [ 'may/b/102', true ]
            ]);

            let state = { checked };
            let nextProps = { app };

            let got = createChecked(state, nextProps);
            let exp = new Map([
                [ 'may/b/100', null ],
                [ 'may/b/101', false ],
                [ 'may/b/102', true ]
            ]);
            assert.deepStrictEqual(got, exp);
        });

        it('should create checked if no arguments', () => {
            let got = createChecked();
            let exp = new Map();
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('checkedList()', () => {
        const { checkedList } = internal;

        it('should return checked list', () => {
            let checked = new Map([
                [ 'may/b/100', null ], [ 'may/b/101', false ], [ 'may/b/102', true ]
            ]);
            let got = checkedList(checked);
            let exp = [ 'may/b/102' ];
            assert.deepStrictEqual(got, exp);
        });

        it('should return [] if pass empty checked', () => {
            let checked = new Map();
            let got = checkedList(checked);
            let exp = [];
            assert.deepStrictEqual(got, exp);
        });
    });
});
