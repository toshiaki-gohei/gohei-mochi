'use strict';
import assert from 'assert';
import Delform from '~/content/views/thread/form-del.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown, disposePreferences, tidy, isBrowser } from '@/support/dom';
import createStore from '~/content/reducers';
import { setDomainPosts, setAppThreads } from '~/content/reducers/actions';
import procedures, { defaultMap } from '~/content/procedures';
import jsCookie from 'js-cookie';
import { pluckFromMap as pluck } from '@/support/util';
import { sleep } from '~/content/util';

describe(__filename, () => {
    before(() => setup({ url: URL }));
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

    afterEach(() => disposePreferences());

    const URL = 'https://may.2chan.net/b/res/123456789.htm';

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
<div class="gohei-pane gohei-left-pane">.+</div>
<div class="gohei-pane gohei-right-pane">.+</div>
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

            let got = tidy($el.querySelector('.gohei-left-pane .gohei-list').outerHTML);
            let exp = tidy(`
<table class="gohei-list gohei-selectable-list">
<tbody>
<tr class="gohei-tr" data-post-id="may/b/100">
<td class="gohei-td gohei-text-center"><input type="checkbox"></td>
<td class="gohei-td">0</td><td class="gohei-td">No.100</td>
</tr>
<tr class="gohei-tr" data-post-id="may/b/101">
<td class="gohei-td gohei-text-center"><input type="checkbox"></td>
<td class="gohei-td">1</td><td class="gohei-td">No.101</td>
</tr>
<tr class="gohei-tr" data-post-id="may/b/102">
<td class="gohei-td gohei-text-center"><input type="checkbox"></td>
<td class="gohei-td">2</td><td class="gohei-td">No.102</td>
</tr>
</tbody>
</table>
`.replace(/\n/g, ''));
            assert(got === exp);
        });

        it('should render with cookie data', () => {
            jsCookie.set('pwdc', 'cookie pwd');

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
        it('should change delform state if click target list', async () => {
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

        it('should clear target list if click clear button', done => {
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

            let { app, ui: { thread: { panel } } } = store.getState();
            props = { panel, app };
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

            $el = render(<Delform {...{ commit: mock, ...props }} />);

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
                })
            ]);
        });

        (isBrowser ? it.skip : it)('should set cookie', () => {
            let update;
            let p = new Promise(resolve => update = resolve);

            let mock = procedures(null, {
                ...defaultMap(store),
                'thread/submitDel': () => ({ ok: true }),
                'thread/clearDelformTargets': () => {},
                'thread/update': update
            });

            $el = render(<Delform {...{ commit: mock, ...props }} />);

            $el.querySelector('.gohei-input-password').value = 'test pwd';

            let $btn = $el.querySelector('.gohei-submit-btn');
            simulate.click($btn);

            return p.then(() => {
                let got = jsCookie.get('pwdc');
                assert(got === 'test pwd');
            });
        });
    });
});
