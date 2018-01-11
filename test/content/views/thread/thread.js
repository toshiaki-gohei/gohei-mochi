'use strict';
import assert from 'assert';
import Thread from '~/content/views/thread/thread.jsx';
import { h, render } from 'preact';
import { setup, teardown } from '@/support/dom';
import procedures from '~/content/procedures';
import { Post } from '~/content/model';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    const posts = [ 0, 1, 2 ].reduce((map, index) => {
        let id = `may/b/1230${index}`;
        map.set(id, new Post({ id, index }));
        return map;
    }, new Map());
    const thread = {
        posts: [ 'may/b/12300', 'may/b/12301', 'may/b/12302' ]
    };

    const funs = {
        'sync/post': id => posts.get(id)
    };
    const mock = procedures(null, funs);

    describe('render()', () => {
        it('should render thread', () => {
            let $el = render(<Thread {...{ commit: mock, thread }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-thread">
<div class="gohei-post gohei-op">.+?</div>
<div class="gohei-reply-container">
<div class="gohei-reply-left-mark">...</div>
<div class="gohei-post gohei-reply">.+?</div>
</div>
<div class="gohei-reply-container">
<div class="gohei-reply-left-mark">...</div>
<div class="gohei-post gohei-reply">.+?</div>
</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render new post message', () => {
            let app = {
                changeset: { newPostsCount: 1 }
            };
            let $el = render(<Thread {...{ commit: mock, thread, app }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-thread">
<div class="gohei-post gohei-op">.+?</div>
<div class="gohei-reply-container">.+?</div>
<div class="gohei-newpost-msg">新着レス1件</div>
<div class="gohei-reply-container">.+?</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render thread with lazy display', () => {
            let app = { displayThreshold: 2 };
            let $el = render(<Thread {...{ commit: mock, thread, app }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-thread">
<div class="gohei-post gohei-op">.+?</div>
<div class="gohei-reply-container">.+?</div>
<div class="gohei-display-more">.+?</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should not render thread if no props', () => {
            let $el = render(<Thread />);
            let got = $el.outerHTML;
            assert(got === undefined);
        });
    });

    describe('event', () => {
        it('should handle display more', done => {
            let mock = procedures(null, {
                ...funs,
                'thread/setDisplayThreshold': threshold => {
                    assert(threshold === null);
                    done();
                }
            });

            let app = { displayThreshold: 2 };
            let $el = render(<Thread {...{ commit: mock, thread, app }} />);

            let $btn = $el.querySelector('.gohei-display-more-btn');
            $btn.dispatchEvent(new window.Event('click'));
        });
    });
});
