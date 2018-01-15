'use strict';
import assert from 'assert';
import Action from '~/content/views/thread/post/action.jsx';
import { h, render } from 'preact';
import { setup, teardown } from '@/support/dom';
import { Post } from '~/content/model';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('render()', () => {
        it('should render action', () => {
            let post = new Post({ index: 1 });
            let $el = render(<Action {...{ post }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post-action">
<span class="gohei-inline-icon gohei-icon-edit"></span>
<button class="gohei-link-btn" type="button">No\\.</button>
<button class="gohei-link-btn" type="button">コメント</button>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render action by post with file', () => {
            let post = new Post({ index: 1, file: { url: 'file url' } });
            let $el = render(<Action {...{ post }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post-action">
<span class="gohei-inline-icon gohei-icon-edit"></span>
<button class="gohei-link-btn" type="button">No\\.</button>
<button class="gohei-link-btn" type="button">コメント</button>
<button class="gohei-link-btn" type="button">ファイル</button>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should not render action if is not active', () => {
            let $el = render(<Action {...{ isActive: false }} />);
            let got = $el.outerHTML;
            assert(got === undefined);
        });
    });

    describe('event', () => {
        const post = new Post({ index: 1, file: { url: 'file url' } });

        let handlers;
        beforeEach(() => handlers = {});

        it('should handle to quote by no button', done => {
            handlers.quoteNo = () => done();
            let $el = render(<Action {...{ post, handlers }} />);

            let $btn = $el.querySelectorAll('.gohei-post-action button')[0];
            $btn.dispatchEvent(new window.Event('click'));
        });

        it('should handle to quote by comment button', done => {
            handlers.quoteComment = () => done();
            let $el = render(<Action {...{ post, handlers }} />);

            let $btn = $el.querySelectorAll('.gohei-post-action button')[1];
            $btn.dispatchEvent(new window.Event('click'));
        });

        it('should handle to quote by file button', done => {
            handlers.quoteFile = () => done();
            let $el = render(<Action {...{ post, handlers }} />);

            let $btn = $el.querySelectorAll('.gohei-post-action button')[2];
            $btn.dispatchEvent(new window.Event('click'));
        });
    });
});
