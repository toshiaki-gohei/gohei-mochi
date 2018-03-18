'use strict';
import assert from 'assert';
import Thread from '~/content/views/thread/thread.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import createStore from '~/content/reducers';
import { setDomainPosts, setDomainThreads, setAppThreads } from '~/content/reducers/actions';
import procedures, { defaultMap } from '~/content/procedures';
import { Post } from '~/content/model';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store, props;
    beforeEach(() => {
        let posts = [ 0, 1, 2 ].map(index => new Post({ id: `may/b/1230${index}`, index }));

        store = createStore();
        store.dispatch(setDomainPosts(posts));
        store.dispatch(setDomainThreads({
            url: URL, posts: [ 'may/b/12300', 'may/b/12301', 'may/b/12302' ]
        }));
        store.dispatch(setAppThreads({ url: URL }));

        let { domain, app } = store.getState();
        let thread = domain.threads.get(URL);
        let appThread = app.threads.get(URL);
        props = { commit: procedures(store), thread, app: appThread };
    });

    const URL = 'http://example.net/thread01';

    describe('render()', () => {
        it('should render thread', () => {
            let $el = render(<Thread {...props} />);

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
            store.dispatch(setAppThreads({
                url: URL,
                changeset: { newPostsCount: 1 }
            }));
            let app = store.getState().app.threads.get(URL);

            let $el = render(<Thread {...{ ...props, app }} />);

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
            store.dispatch(setAppThreads({
                url: URL,
                displayThreshold: 2
            }));
            let app = store.getState().app.threads.get(URL);

            let $el = render(<Thread {...{ ...props, app }} />);

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

        it('should render hidden posts correctly', () => {
            let post = new Post({
                ...store.getState().domain.posts.get('may/b/12301'),
                state: 1
            });
            store.dispatch(setDomainPosts(post));
            store.dispatch(setAppThreads({
                url: URL,
                filters: { isHiddenDeletedPosts: true }
            }));
            let app = store.getState().app.threads.get(URL);

            let $el = render(<Thread {...{ ...props, app }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-thread">
<div class="gohei-post gohei-op">.+?</div>
<div class="gohei-reply-container" style="display: none;">.+?</div>
<div class="gohei-reply-container">.+?</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should not render thread if no props', () => {
            let $el = render(<Thread />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });

    describe('event', () => {
        it('should handle to display more', done => {
            let mock = procedures(store, {
                ...defaultMap(store),
                'thread/setDisplayThreshold': threshold => {
                    assert(threshold === null);
                    done();
                }
            });

            store.dispatch(setAppThreads({
                url: URL,
                displayThreshold: 2
            }));
            let app = store.getState().app.threads.get(URL);

            let $el = render(<Thread {...{ ...props, commit: mock, app }} />);

            let $btn = $el.querySelector('.gohei-display-more-btn');
            simulate.click($btn);
        });
    });
});
