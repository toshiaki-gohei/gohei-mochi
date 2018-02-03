'use strict';
import assert from 'assert';
import Delform from '~/content/views/thread/form-del.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown, tidy } from '@/support/dom';
import createStore from '~/content/reducers';
import { setDomainPosts, setAppThreads } from '~/content/reducers/actions';
import procedures, { defaultMap } from '~/content/procedures';
import cookie from 'js-cookie';
import { pluckFromMap as pluck } from '@/support/util';
import { sleep } from '~/content/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store, props;
    beforeEach(() => {
        store = createStore({
            app: { current: { thread: URL } },
            ui: { thread: { panel: { isOpen: true, type: 'FORM_DEL' } } }
        });
        store.dispatch(setAppThreads({ url: URL }));

        let { app, ui: { thread: { panel } } } = store.getState();
        props = { panel, app };
    });
    beforeEach(() => dispose());

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

        it('should render delform', () => {
            let $el = render(<Delform {...props} />);
            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-delform">
<div>レス削除</div>
<div class="gohei-left-pane">.+</div>
<div class="gohei-right-pane">.+</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render left target list', () => {
            let delform = {
                targets: new Map([
                    [ 'may/b/100', { post: 'may/b/100', checked: true } ],
                    [ 'may/b/101', { post: 'may/b/101', checked: true } ],
                    [ 'may/b/102', { post: 'may/b/102', checked: false } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delform }));

            let commit = procedures(store);
            let { app, ui: { thread: { panel } } } = store.getState();
            let $el = render(<Delform {...{ commit, panel, app }} />);

            let tdCss = 'gohei-td gohei-selectable';

            let got = tidy($el.querySelector('.gohei-left-pane .gohei-list').outerHTML);
            let exp = tidy(`
<table class="gohei-list">
<tbody>
<tr class="gohei-tr" data-post-id="may/b/100">
<td class="gohei-td gohei-text-center gohei-selectable"><input type="checkbox" value="on"></td>
<td class="${tdCss}">0</td><td class="${tdCss}">No.100</td>
</tr>
<tr class="gohei-tr" data-post-id="may/b/101">
<td class="gohei-td gohei-text-center gohei-selectable"><input type="checkbox" value="on"></td>
<td class="${tdCss}">1</td><td class="${tdCss}">No.101</td>
</tr>
<tr class="gohei-tr" data-post-id="may/b/102">
<td class="gohei-td gohei-text-center gohei-selectable"><input type="checkbox" value="on"></td>
<td class="${tdCss}">2</td><td class="${tdCss}">No.102</td>
</tr>
</tbody>
</table>
`.replace(/\n/g, ''));
            assert(got === exp);
        });

        it('should render with cookie data', () => {
            cookie.set('pwdc', 'cookie pwd');

            let $el = render(<Delform {...props} />);

            let got = $el.querySelector('.gohei-input-password').value;
            let exp = 'cookie pwd';
            assert(got === exp);
        });

        it('should render error message if set state.errmsg', () => {
            let $el = render(<Delform {...props} />);

            $el.setState({ errmsg: 'test errmsg' }, () => {
                let got = $el.querySelector('.gohei-text-error').innerHTML;
                assert(got === 'test errmsg');
            });
        });

        it('should not render delform if no props', () => {
            let $el = render(<Delform />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });

    describe('event', () => {
        it('should change delform state if click postdel list', async () => {
            store.dispatch(setDomainPosts(createPosts([ '100' ])));
            let delform = {
                targets: new Map([
                    [ 'may/b/100', { post: 'may/b/100', checked: true } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delform }));

            let commit = procedures(store);
            let { app, ui: { thread: { panel } } } = store.getState();
            let $el = render(<Delform {...{ commit, panel, app }} />);

            let $rows = $el.querySelectorAll('.gohei-list .gohei-tr');
            simulate.click($rows[0]);

            await sleep(1);

            let { targets } = store.getState().app.threads.get(URL).delform;
            let got = pluck(targets, 'post', 'checked');
            let exp = [ { post: 'may/b/100', checked: false } ];
            assert.deepStrictEqual(got, exp);
        });

        it('should clear postdel list if click clear button', done => {
            let mock = procedures(store, {
                ...defaultMap(store),
                'thread/clearDelformTargets': () => done()
            });

            let { app, ui: { thread: { panel } } } = store.getState();
            let $el = render(<Delform {...{ commit: mock, panel, app }} />);

            let $btn = $el.querySelector('.gohei-clear-btn');
            simulate.click($btn);
        });
    });

    describe('submit event', () => {
        let $el;

        beforeEach(() => {
            let posts = createPosts([ '100', '101', '102' ]);
            store.dispatch(setDomainPosts(posts));
            let delform = {
                action: 'http://example.net/submit-url',
                targets: new Map([
                    [ 'may/b/100', { post: 'may/b/100', checked: true } ],
                    [ 'may/b/101', { post: 'may/b/101', checked: true } ],
                    [ 'may/b/102', { post: 'may/b/102', checked: false } ]
                ])
            };
            store.dispatch(setAppThreads({ url: URL, delform }));
        });

        it('should submit correctly', () => {
            let submit, clear, update;
            let p1 = new Promise(resolve => {
                submit = async args => {
                    await sleep(1);
                    let { isSubmitting, errmsg } = $el.state;
                    resolve({ args, isSubmitting, errmsg });
                    return { ok: true };
                };
            });
            let p2 = new Promise(resolve => clear = resolve);
            let p3 = new Promise(resolve => update = resolve);

            let mock = procedures(null, {
                ...defaultMap(store),
                'thread/submitDel': submit,
                'thread/clearDelformTargets': clear,
                'thread/update': update
            });

            let { app, ui: { thread: { panel } } } = store.getState();
            $el = render(<Delform {...{ commit: mock, panel, app }} />);

            $el.querySelector('.gohei-input-password').value = 'test pwd';

            $el.setState({ errmsg: 'test errmsg' }, () => {
                let $btn = $el.querySelector('.gohei-submit-btn');
                simulate.click($btn);
            });

            return Promise.all([
                p1.then(({ args, isSubmitting, errmsg }) => {
                    let { url, ...form } = args;
                    assert(url === 'http://example.net/submit-url');
                    let got = form;
                    let exp = {
                        posts: [ 'may/b/100', 'may/b/101' ],
                        mode: 'usrdel',
                        onlyimgdel: null,
                        pwd: 'test pwd'
                    };
                    assert.deepStrictEqual(got, exp);
                    assert(isSubmitting === true);
                    assert(errmsg === null);
                }),
                p2,
                p3.then(() => {
                    let { isSubmitting } = $el.state;
                    assert(isSubmitting === false);
                    let got = cookie.get('pwdc');
                    assert(got === 'test pwd');
                })
            ]);
        });
    });
});

function dispose() {
    cookie.remove('pwdc');
}
