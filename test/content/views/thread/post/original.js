'use strict';
import assert from 'assert';
import Op from '~/content/views/thread/post/original.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import procedures from '~/content/procedures';
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
<div class="gohei-post-header">.+?</div>
<blockquote class="gohei-post-body"></blockquote>
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
<div class="gohei-post-header">.+?</div>
<blockquote class="gohei-post-body"></blockquote>
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
<div class="gohei-post-header">.+?</div>
<blockquote class="gohei-post-body"></blockquote>
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
<div class="gohei-post-header">.+?</div>
<blockquote class="gohei-post-body"></blockquote>
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
<div class="gohei-post-header">.+?</div>
<blockquote class="gohei-post-body"></blockquote>
<div class="gohei-font-smaller">削除された記事が1件あります。</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render checked checkbox if post is checked', () => {
            let isChecked = true;
            let handlers = { changePostdel: () => {} };
            let $el = render(<Op {...{ post, isChecked, handlers }} />);
            let got = $el.querySelector('.gohei-postdel-checkbox');
            assert(got.checked === true);
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
<div class="gohei-post-header">.+?</div>
<blockquote class="gohei-post-body"></blockquote>
<button class="gohei-link-btn gohei-display-all-btn" type="button">スレを全て表示</button>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should not render op if no props', () => {
            let $el = render(<Op />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });

    describe('event', () => {
        it('should handle to display all', done => {
            let mock = procedures(null, {
                'thread/setDisplayThreshold': threshold => {
                    assert(threshold === null);
                    done();
                }
            });

            let app = { displayThreshold: 200 };
            let $el = render(<Op {...{ commit: mock, post, app }} />);

            let $btn = $el.querySelector('.gohei-display-all-btn');
            simulate.click($btn);
        });
    });
});
