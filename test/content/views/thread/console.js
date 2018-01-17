'use strict';
import assert from 'assert';
import Console, { internal } from '~/content/views/thread/console.jsx';
import { h, render } from 'preact';
import { setup, teardown } from '@/support/dom';
import { create as createApp } from '~/content/reducers/app/threads';
import procedures from '~/content/procedures';
import { Changeset } from '~/content/model/thread';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    const thread = {};
    const props = { thread, app: createApp() };

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
            let app = createApp({
                lastUpdatedByUser: new Date('Sun, 01 Jan 2017 01:23:45 GMT'),
                updateHttpRes: { status: 304 }
            });

            let $el = render(<Console {...{ thread, app }} />);

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
            let app = createApp({ isUpdating: true });

            let $el = render(<Console {...{ thread, app }} />);

            let got = $el.querySelector('.gohei-update-btn').outerHTML;
            let exp = `
<button class="gohei-link-btn gohei-update-btn" type="button" disabled="">更新中…</button>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should render update message', () => {
            let app = createApp({
                changeset: new Changeset({
                    newPostsCount: 3,
                    exposedIdPosts: [ { index: 1, no: '12301', userId: 'ID01' } ],
                    exposedIpPosts: [ { index: 2, no: '12302', userIp: 'IP02' } ],
                    deletedPosts: [ { index: 3, no: '12303' } ]
                }),
                lastUpdatedByUser: new Date('Sun, 01 Jan 2017 01:23:45 GMT'),
                updateHttpRes: { status: 200 }
            });

            let $el = render(<Console {...{ thread, app }} />);

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
            assert(got === undefined);
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

    describe('exposedIdMessage()', () => {
        const { exposedIdMessage } = internal;

        it('should return exposed id message', () => {
            let exposedIdPosts = [
                { index: 1, no: '12301', userId: 'ID01' },
                { index: 2, no: '12302', userId: 'ID02' },
                { index: 4, no: '12304', userId: 'ID01' }
            ];
            let cs = new Changeset({ exposedIdPosts });

            let got = exposedIdMessage(cs);
            assert(got === 'ID01(2), ID02(1)');
        });
    });

    describe('exposedIpMessage()', () => {
        const { exposedIpMessage } = internal;

        it('should return exposed ip message', () => {
            let exposedIpPosts = [
                { index: 1, no: '12301', userIp: 'IP01' },
                { index: 2, no: '12302', userIp: 'IP02' },
                { index: 4, no: '12304', userIp: 'IP01' }
            ];
            let cs = new Changeset({ exposedIpPosts });

            let got = exposedIpMessage(cs);
            assert(got === 'IP01(2), IP02(1)');
        });
    });

    describe('Expire()', () => {
        const { Expire } = internal;

        const message = 'expire message';

        it('should render expire message', () => {
            let date = new Date(Date.now() + 1000 * 60 * 35);
            let $el = render(<Expire {...{ message, date }} />);
            let got = $el.outerHTML;
            let exp = '<span class="">expire message</span>';
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

    describe('event', () => {
        it('should commit procedure if click update', done => {
            let mock = procedures(null, {
                'thread/update': done
            });

            let $el = render(<Console {...{ ...props, commit: mock }} />);

            let $btn = $el.querySelector('.gohei-update-btn');
            $btn.dispatchEvent(new window.Event('click'));
        });
    });
});