'use strict';
import assert from 'assert';
import Popup from '~/content/views/thread/popup-posts.jsx';
import { h, render } from 'preact';
import { setup, teardown } from '@/support/dom';
import procedures from '~/content/procedures';
import { Post } from '~/content/model';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('render()', () => {
        it('should render popup', () => {
            let props = {
                id: 'popup1',
                class: 'class1',
                style: { left: '100px' },
                posts: [ new Post({ index: 1 }) ]
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
            let props = {
                posts: [ 1, 0, 2 ].map(index => new Post({ index }))
            };
            let $el = render(<Popup {...props} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post-popup" style="">
<div class="gohei-post gohei-reply">.+?</div>
<div class="gohei-post gohei-op">.+?</div>
<div class="gohei-post gohei-reply">.+?</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render popup if posts is empty', () => {
            let props = { posts: [] };
            let $el = render(<Popup {...props} />);

            let got = $el.outerHTML;
            let exp = '<div class="gohei-post-popup" style=""></div>';
            assert(got === exp);
        });

        it('should render popup if no props', () => {
            let $el = render(<Popup />);

            let got = $el.outerHTML;
            let exp = '<div class="gohei-post-popup" style=""></div>';
            assert(got === exp);
        });
    });

    describe('event', () => {
        const makeProps = index => {
            return { id: `popup${index}`, class: 'gohei-popup', posts: [ new Post({ index }) ] };
        };

        it('should commit procedure if left mouse', done => {
            let mock = procedures(null, {
                'thread/clearPostsPopup': done
            });
            let props = { commit: mock, ...makeProps(1) };

            let $el = render(<div><Popup {...props} /></div>);

            let $popup1 = $el.querySelector('#popup1');
            $popup1.dispatchEvent(new window.Event('mouseleave'));
        });

        it('should commit procedure if mouse went back from popup to previous(under) popup', done => {
            let mock = procedures(null, {
                'thread/closePostsPopup': done
            });
            let props1 = { ...makeProps(1) };
            let props2 = { commit: mock, ...makeProps(2) };

            let $el = render(<div><Popup {...props1} /><Popup {...props2} /></div>);

            let $popup2 = $el.querySelector('#popup2');
            let event = new window.Event('mouseleave');
            event.relatedTarget = $el.querySelector('#popup1 .gohei-post-body');
            $popup2.dispatchEvent(event);
        });

        it('should not commit procedure if mouse moved from popup to next(overlap) popup', done => {
            let mock = procedures(null, {
                'thread/closePostsPopup': () => { throw new Error('not commit close'); },
                'thread/clearPostsPopup': () => { throw new Error('not commit clear'); }
            });
            let props1 = { commit: mock, ...makeProps(1) };
            let props2 = { commit: mock, ...makeProps(2) };

            let $el = render(<div><Popup {...props1} /><Popup {...props2} /></div>);

            let $popup2 = $el.querySelector('#popup2');
            let event = new window.Event('mouseleave');
            event.relatedTarget = $el.querySelector('#popup1');
            $popup2.dispatchEvent(event);

            setTimeout(done, 10);
        });
    });
});
