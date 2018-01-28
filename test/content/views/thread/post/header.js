'use strict';
import assert from 'assert';
import Header from '~/content/views/thread/post/header.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown, tidy } from '@/support/dom';
import { Post, thread } from '~/content/model';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let post;
    beforeEach(() => post = new Post({
        id: 'post01', index: 1,
        subject: '無念', name: 'としあき', mailto: null,
        date: '17/01/01(日)01:23:45', no: '123000001', userId: null, userIp: null,
        del: 'del', sod: 2
    }));

    describe('render()', () => {
        it('should render header', () => {
            let $el = render(<Header {...{ post }} />);

            let got = tidy($el.outerHTML);
            let exp = tidy(`
<div class="gohei-post-header">
<span class="gohei-index">1</span>
<span class="gohei-subject">無念</span>
<span class="gohei-name">としあき</span>
<span class="gohei-date">17/01/01(日)01:23:45</span>
<span class="gohei-no">No.123000001</span>
<button class="gohei-del gohei-link-btn" type="button">del</button>
<button class="gohei-sod gohei-link-btn" type="button">そうだねx2</button>
</div>
`.replace(/\n/g, ''));
            assert(got === exp);
        });

        it('should render op header', () => {
            post = new Post({ ...post, index: 0 });
            let $el = render(<Header {...{ post }} />);

            let got = tidy($el.outerHTML);
            let exp = tidy(`
<div class="gohei-post-header">
<span class="gohei-subject">無念</span>
<span class="gohei-name">としあき</span>
<span class="gohei-date">17/01/01(日)01:23:45</span>
<span class="gohei-no">No.123000001</span>
<button class="gohei-del gohei-link-btn" type="button">del</button>
<button class="gohei-sod gohei-link-btn" type="button">そうだねx2</button>
</div>
`.replace(/\n/g, ''));
            assert(got === exp);
        });

        it('should render header with file', () => {
            let file = {
                url: 'file-url', name: 'file-name', size: 888,
                thumb: { url: 'thumb-url', width: 250, height: 251 }
            };
            post = new Post({ ...post, index: 1, file });
            let $el = render(<Header {...{ post }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post-header">
<span class="gohei-index">1</span>
.+?
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render op header with file', () => {
            let file = {
                url: 'file-url', name: 'file-name', size: 888,
                thumb: { url: 'thumb-url', width: 250, height: 251 }
            };
            post = new Post({ ...post, index: 0, file });
            let $el = render(<Header {...{ post }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post-header" style="margin-left: 290px;">
<span class="gohei-subject">無念</span>
.+?
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render header with mailto and userId, userIp', () => {
            post = new Post({
                ...post, mailto: 'メアド', userId: 'XXXXXXXX', userIp: '192.168.*(example.net)'
            });
            let $el = render(<Header {...{ post }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post-header">
.+
<span class="gohei-name">としあき</span>
<span class="gohei-mailto">\\[メアド\\]</span>
<span class="gohei-date">17/01/01\\(日\\)01:23:45</span>
<span class="gohei-no">No\\.123000001</span>
<span class="gohei-id">ID:XXXXXXXX</span>
<span class="gohei-ip">IP:192\\.168\\.\\*\\(example\\.net\\)</span>
.+
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render header with id and ip counter', () => {
            let post1 = new Post({
                ...post, userId: 'XXXXXXXX', userIp: '192.168.*(example.net)'
            });
            let post2 = new Post({ id: 'post02', index: 2, userIp: '192.168.*(example.net)' });
            let idipIndex = new thread.IdipIndex([ post1, post2 ]);

            let $el = render(<Header {...{ post: post1, idipIndex }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post-header">
.+
<span class="gohei-no">No\\.123000001</span>
<span class="gohei-id">ID:XXXXXXXX</span>
<span class="gohei-counter">\\[1/1\\]</span>
<span class="gohei-ip">IP:192\\.168\\.\\*\\(example\\.net\\)</span>
<span class="gohei-counter">\\[1/2\\]</span>
.+
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render header if img server style (no subject, name, mailto)', () => {
            post = new Post({ ...post, subject: null, name: null, mailto: null });
            let $el = render(<Header {...{ post }} />);

            let got = tidy($el.outerHTML);
            let exp = tidy(`
<div class="gohei-post-header">
<span class="gohei-index">1</span>
<span class="gohei-date">17/01/01(日)01:23:45</span>
<span class="gohei-no">No.123000001</span>
<button class="gohei-del gohei-link-btn" type="button">del</button>
<button class="gohei-sod gohei-link-btn" type="button">そうだねx2</button>
</div>
`.replace(/\n/g, ''));
            assert(got === exp);
        });

        it('should render op header if img server style (no subject, name, mailto)', () => {
            post = new Post({ ...post, index: 0, subject: null, name: null, mailto: null });
            let $el = render(<Header {...{ post }} />);

            let got = tidy($el.outerHTML);
            let exp = tidy(`
<div class="gohei-post-header">
<span class="gohei-date">17/01/01(日)01:23:45</span>
<span class="gohei-no">No.123000001</span>
<button class="gohei-del gohei-link-btn" type="button">del</button>
<button class="gohei-sod gohei-link-btn" type="button">そうだねx2</button>
</div>
`.replace(/\n/g, ''));
            assert(got === exp);
        });

        it('should render header if no props', () => {
            let $el = render(<Header />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post-header">.+</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });
    });

    describe('event', () => {
        let handlers;
        beforeEach(() => handlers = {});

        it('should handle to popup posts by userId if mouse enter counter', done => {
            handlers.popupPostsById = () => done();

            post = new Post({ ...post, userId: 'XXXXXXXX' });
            let idipIndex = new thread.IdipIndex([ post ]);

            let $el = render(<Header {...{ post, idipIndex, handlers }} />);

            let $counter = $el.querySelector('.gohei-counter');
            simulate.mouseEnter($counter);
        });

        it('should handle to popup posts by userIp if mouse enter counter', done => {
            handlers.popupPostsByIp = () => done();

            post = new Post({ ...post, userIp: '192.168.*(example.net)' });
            let idipIndex = new thread.IdipIndex([ post ]);

            let $el = render(<Header {...{ post, idipIndex, handlers }} />);

            let $counter = $el.querySelector('.gohei-counter');
            simulate.mouseEnter($counter);
        });

        it('should handle delreq if click del', done => {
            handlers.delreq = () => done();
            let $el = render(<Header {...{ post, handlers }} />);

            let $del = $el.querySelector('.gohei-del');
            simulate.click($del);
        });

        it('should handle soudane if click sod', done => {
            handlers.soudane = () => done();
            let $el = render(<Header {...{ post, handlers }} />);

            let $sod = $el.querySelector('.gohei-sod');
            simulate.click($sod);
        });
    });
});
