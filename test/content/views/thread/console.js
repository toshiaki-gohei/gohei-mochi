'use strict';
import assert from 'assert';
import Console, { internal } from '~/content/views/thread/console.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import createStore from '~/content/reducers';
import { setDomainThreads, setAppThreads } from '~/content/reducers/actions';
import procedures from '~/content/procedures';
import { Changeset } from '~/content/model/thread';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store, props;
    beforeEach(() => {
        store = createStore();
        store.dispatch(setDomainThreads({ url: URL }));
        store.dispatch(setAppThreads({ url: URL }));

        let { domain, app } = store.getState();
        let thread = domain.threads.get(URL);
        let appThread = app.threads.get(URL);
        props = { thread, app: appThread };
    });

    const URL = 'http://example.net/thread01';

    describe('render()', () => {
        it('should render console', () => {
            let $el = render(<Console {...props} />);

            let got = $el.outerHTML;
            let exp = `
<div class="gohei-console">
<div class="gohei-msg">
<span></span>
<span>/</span>
</div>
<div class="gohei-thread-action">
<button class="gohei-link-btn gohei-update-btn" type="button">最新に更新</button>
<span class="gohei-last-updated"></span>
<span class="gohei-status-msg"></span>
<span class="gohei-update-detail"></span>
</div>
</div>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should render action', () => {
            store.dispatch(setAppThreads({
                url: URL,
                updatedAt: new Date('Sun, 01 Jan 2017 01:23:45 GMT'),
                updateHttpRes: { status: 304 }
            }));
            let app = store.getState().app.threads.get(URL);

            let $el = render(<Console {...{ ...props, app }} />);

            let got = $el.querySelector('.gohei-thread-action').innerHTML;
            let exp = `
<button class="gohei-link-btn gohei-update-btn" type="button">最新に更新</button>
<span class="gohei-last-updated">(10:23:45)</span>
<span class="gohei-status-msg">更新はありません</span>
<span class="gohei-update-detail"></span>

`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should render updating message if thread is updating', () => {
            store.dispatch(setAppThreads({
                url: URL,
                isUpdating: true
            }));
            let app = store.getState().app.threads.get(URL);

            let $el = render(<Console {...{ ...props, app }} />);

            let got = $el.querySelector('.gohei-update-btn').outerHTML;
            let exp = `
<button class="gohei-link-btn gohei-update-btn" type="button" disabled="">更新中…</button>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should render update message', () => {
            store.dispatch(setAppThreads({
                url: URL,
                changeset: new Changeset({
                    newPostsCount: 3,
                    exposedIdPosts: [ { index: 1, no: '12301', userId: 'ID01' } ],
                    exposedIpPosts: [ { index: 2, no: '12302', userIp: 'IP02' } ],
                    deletedPosts: [ { index: 3, no: '12303' } ]
                }),
                updatedAt: new Date('Sun, 01 Jan 2017 01:23:45 GMT'),
                updateHttpRes: { status: 200 }
            }));
            let app = store.getState().app.threads.get(URL);

            let $el = render(<Console {...{ ...props, app }} />);

            let got = $el.querySelector('.gohei-thread-action').innerHTML;
            let exp = `
<button class="gohei-link-btn gohei-update-btn" type="button">最新に更新</button>
<span class="gohei-last-updated">(10:23:45)</span>
<span class="gohei-status-msg">新着: 3</span>
<span class="gohei-update-detail">
<span class="gohei-msg">ID: ID01(1)</span>
<span class="gohei-msg">IP: IP02(1)</span>
<span class="gohei-msg">削除: No.12303</span>
</span>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should not render console if no props', () => {
            let $el = render(<Console />);
            let got = $el.outerHTML;
            assert(got === null);
        });

    });

    describe('Expire()', () => {
        const { Expire } = internal;

        const message = 'expire message';

        it('should render expire message', () => {
            let date = new Date(Date.now() + 1000 * 60 * 35);
            let $el = render(<Expire {...{ message, date }} />);
            let got = $el.outerHTML;
            let exp = '<span>expire message</span>';
            assert(got === exp);
        });

        it('should render expire message with danger if expire is near', () => {
            let date = new Date(Date.now() + 1000 * 60 * 25);
            let $el = render(<Expire {...{ message, date }} />);
            let got = $el.outerHTML;
            let exp = '<span class="gohei-text-danger">expire message</span>';
            assert(got === exp);
        });
    });

    describe('statusMessage()', () => {
        const { statusMessage } = internal;

        it('should return message correctly', () => {
            let got = statusMessage({ status: 200, newPostsCount: 1 });
            let exp = '新着: 1';
            assert(got === exp);

            got = statusMessage({ status: 200 });
            assert(got === null);

            got = statusMessage({ status: 304 });
            exp = '更新はありません';
            assert(got === exp);

            got = statusMessage({ status: 404, statusText: 'Not Found' });
            exp = 'スレッドが消えたようです(404 Not Found)';
            assert(got === exp);

            got = statusMessage({ status: 499, statusText: 'なんかエラーだって' });
            exp = '(499 なんかエラーだって)';
            assert(got === exp);
        });

        it('should return null if status is null', () => {
            let got = statusMessage({ status: null });
            assert(got === null);
            got = statusMessage({});
            assert(got === null);
        });
    });

    describe('ExposedIdMessage()', () => {
        const { ExposedIdMessage } = internal;

        it('should render exposed id message', () => {
            let exposedIdPosts = [
                { index: 1, no: '12301', userId: 'ID01' },
                { index: 2, no: '12302', userId: 'ID02' },
                { index: 4, no: '12304', userId: 'ID01' }
            ];
            let changeset = new Changeset({ exposedIdPosts });

            let $el = render(<ExposedIdMessage {...{ changeset }} />);

            let got = $el.outerHTML;
            let exp = '<span class="gohei-msg">ID: ID01(2), ID02(1)</span>';
            assert(got === exp);
        });

        it('should not render exposed id message if changeset is empty', () => {
            let changeset = new Changeset();
            let $el = render(<ExposedIdMessage {...{ changeset }} />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });

    describe('ExposedIpMessage()', () => {
        const { ExposedIpMessage } = internal;

        it('should render exposed ip message', () => {
            let exposedIpPosts = [
                { index: 1, no: '12301', userIp: 'IP01' },
                { index: 2, no: '12302', userIp: 'IP02' },
                { index: 4, no: '12304', userIp: 'IP01' }
            ];
            let changeset = new Changeset({ exposedIpPosts });

            let $el = render(<ExposedIpMessage {...{ changeset }} />);

            let got = $el.outerHTML;
            let exp = '<span class="gohei-msg">IP: IP01(2), IP02(1)</span>';
            assert(got === exp);
        });

        it('should not render exposed ip message if changeset is empty', () => {
            let changeset = new Changeset();
            let $el = render(<ExposedIpMessage {...{ changeset }} />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });

    describe('DeletedMessage()', () => {
        const { DeletedMessage } = internal;

        it('should render deleted message', () => {
            let deletedPosts = [
                { index: 1, no: '12301' },
                { index: 2, no: '12302' }
            ];
            let changeset = new Changeset({ deletedPosts });

            let $el = render(<DeletedMessage {...{ changeset }} />);

            let got = $el.outerHTML;
            let exp = '<span class="gohei-msg">削除: No.12301, No.12302</span>';
            assert(got === exp);
        });

        it('should not render deleted message if changeset is empty', () => {
            let changeset = new Changeset();
            let $el = render(<DeletedMessage {...{ changeset }} />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });

    describe('event', () => {
        it('should commit procedure if click update', done => {
            let mock = procedures(null, {
                'thread/update': () => done()
            });

            let $el = render(<Console {...{ ...props, commit: mock }} />);

            let $btn = $el.querySelector('.gohei-update-btn');
            simulate.click($btn);
        });
    });
});
