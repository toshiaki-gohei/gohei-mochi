'use strict';
import assert from 'assert';
import Popup from '~/content/views/thread/popup-posts.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import procedures, { defaultMap } from '~/content/procedures';
import createStore from '~/content/reducers';
import * as actions from '~/content/reducers/actions';
import { Post } from '~/content/model';

const { setDomainPosts, setDomainThreads, setAppThreads, setAppCurrent } = actions;

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store, commit;
    beforeEach(() => {
        let url = 'url-thread01';
        store = createStore();
        store.dispatch(setDomainThreads({ url }));
        store.dispatch(setAppThreads({ url }));
        store.dispatch(setAppCurrent({ thread: url }));

        commit = procedures(store);
    });

    const newPosts = ids => ids.map(index => new Post({ id: `post0${index}`, index }));

    describe('render()', () => {
        it('should render popup', () => {
            let post01 = new Post({ id: 'post01', index: 1 });
            store.dispatch(setDomainPosts(post01));

            let props = {
                commit,
                id: 'popup1',
                className: 'class1',
                style: { left: '100px' },
                posts: [ 'post01' ],
                thread: 'url-thread01'
            };
            let $el = render(<Popup {...props} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div id="popup1" class="class1 gohei-post-popup" style="left: 100px;">
<div class="gohei-post gohei-reply">.+?</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render popup containing posts', () => {
            let posts = newPosts([ 1, 0, 2 ]);
            store.dispatch(setDomainPosts(posts));

            let props = {
                commit,
                posts: posts.map(({ id }) => id),
                thread: 'url-thread01'
            };
            let $el = render(<Popup {...props} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post-popup">
<div class="gohei-post gohei-reply">.+?</div>
<div class="gohei-post gohei-op">.+?</div>
<div class="gohei-post gohei-reply">.+?</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render popup if posts is empty', () => {
            let props = {
                commit,
                posts: [],
                thread: 'url-thread01'
            };
            let $el = render(<Popup {...props} />);

            let got = $el.outerHTML;
            let exp = '<div class="gohei-post-popup"></div>';
            assert(got === exp);
        });

        it('should throw exception if no props', done => {
            try { render(<Popup />); } catch (e) {
                done();
            }
        });
    });

    describe('event', () => {
        const makeProps = index => {
            let posts = newPosts([ index ]);
            store.dispatch(setDomainPosts(posts));
            let postIds = posts.map(({ id }) => id);
            let thread = 'url-thread01';
            return { id: `popup${index}`, className: 'gohei-popup', posts: postIds, thread };
        };

        it('should commit procedure if left mouse', done => {
            let mock = procedures(store, {
                ...defaultMap(store),
                'thread/clearPostsPopup': done
            });
            let props = { commit: mock, ...makeProps(1) };

            let $el = render(<div><Popup {...props} /></div>);

            let $popup1 = $el.querySelector('#popup1');
            simulate.mouseLeave($popup1);
        });

        it('should commit procedure if mouse went back from popup to previous(under) popup', done => {
            let mock = procedures(store, {
                ...defaultMap(store),
                'thread/closePostsPopup': done
            });
            let props1 = { commit: mock, ...makeProps(1) };
            let props2 = { commit: mock, ...makeProps(2) };

            let $el = render(<div><Popup {...props1} /><Popup {...props2} /></div>);

            let $popup2 = $el.querySelector('#popup2');
            let relatedTarget = $el.querySelector('#popup1 .gohei-post-body');
            simulate.mouseLeave($popup2, { relatedTarget });
        });

        it('should not commit procedure if mouse moved from popup to next(overlap) popup', done => {
            let mock = procedures(store, {
                ...defaultMap(store),
                'thread/closePostsPopup': () => { done('not reach here'); },
                'thread/clearPostsPopup': () => { done('not reach here'); }
            });
            let props1 = { commit: mock, ...makeProps(1) };
            let props2 = { commit: mock, ...makeProps(2) };

            let $el = render(<div><Popup {...props1} /><Popup {...props2} /></div>);

            let $popup2 = $el.querySelector('#popup2');
            let relatedTarget = $el.querySelector('#popup1');
            simulate.mouseLeave($popup2, { relatedTarget });

            setTimeout(done, 10);
        });
    });
});
