'use strict';
import assert from 'assert';
import Op from '~/content/views/thread/post/original.jsx';
import { h, render } from 'preact';
import { setup, teardown } from '@/support/dom';
import { Post } from '~/content/model';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let post;
    beforeEach(() => post = new Post({ index: 0 }));

    describe('render()', () => {
        it('should render op', () => {
            let $el = render(<Op {...{ post }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post gohei-op">
<div class="gohei-post-header" style="">.+?</div>
<blockquote class="gohei-post-body" style=""></blockquote>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render expire', () => {
            let expire = { message: '12:34頃消えます' };
            let $el = render(<Op {...{ post, expire }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post gohei-op">
<div class="gohei-post-header" style="">.+?</div>
<blockquote class="gohei-post-body" style=""></blockquote>
<div class="gohei-font-smaller">12:34頃消えます</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render notice', () => {
            let messages = { notice: 'info message' };
            let $el = render(<Op {...{ post, app: { messages } }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post gohei-op">
<div class="gohei-post-header" style="">.+?</div>
<blockquote class="gohei-post-body" style=""></blockquote>
<div class="gohei-text-info">info message</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render warning', () => {
            let messages = { warning: 'warning message' };
            let $el = render(<Op {...{ post, app: { messages } }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post gohei-op">
<div class="gohei-post-header" style="">.+?</div>
<blockquote class="gohei-post-body" style=""></blockquote>
<div class="gohei-text-danger">warning message</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render deleted post count', () => {
            let messages = { deletedPostCount: 1 };
            let $el = render(<Op {...{ post, app: { messages } }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post gohei-op">
<div class="gohei-post-header" style="">.+?</div>
<blockquote class="gohei-post-body" style=""></blockquote>
<div class="gohei-font-smaller">削除された記事が1件あります。</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render action if post is active', () => {
            let $el = render(<Op {...{ post, isActive: true }} />);
            let got = $el.querySelector('.gohei-post-action');
            assert(got);
        });

        it('should render display all button', () => {
            let app = { displayThreshold: 200 };
            let $el = render(<Op {...{ post, app }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post gohei-op">
<div class="gohei-post-header" style="">.+?</div>
<blockquote class="gohei-post-body" style=""></blockquote>
<button class="gohei-link-btn gohei-display-all-btn" type="button">スレを全て表示</button>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should not render op if no props', () => {
            let $el = render(<Op />);
            let got = $el.outerHTML;
            assert(got === undefined);
        });
    });

    describe('event', () => {
        let handlers;
        beforeEach(() => handlers = {});

        it('should handle display all', done => {
            let app = { displayThreshold: 200 };
            handlers.displayAll = () => done();

            let $el = render(<Op {...{ post, app, handlers }} />);

            let $btn = $el.querySelector('.gohei-display-all-btn');
            $btn.dispatchEvent(new window.Event('click'));
        });
    });
});
