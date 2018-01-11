'use strict';
import assert from 'assert';
import Body from '~/content/views/thread/post/body.jsx';
import { h, render } from 'preact';
import { setup, teardown } from '@/support/dom';
import { Post } from '~/content/model';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('render()', () => {
        it('should render body', () => {
            let blockquote = '<span class="gohei-quote">&gt;引用文</span><br />通常文';
            let post = new Post({ raw: { blockquote } });
            let $el = render(<Body {...{ post }} />);

            let got = $el.outerHTML;
            let exp = `
<blockquote class="gohei-post-body" style="">
<span class="gohei-quote">&gt;引用文</span><br>通常文
</blockquote>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should render body with file', () => {
            let file = {
                url: 'file-url', name: 'file-name', size: 888,
                thumb: { url: 'thumb-url', width: 250, height: 251 }
            };
            let post = new Post({ file });
            let $el = render(<Body {...{ post }} />);

            let got = $el.outerHTML;
            let exp = `
<blockquote class="gohei-post-body" style="margin-left: 290px;"></blockquote>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should render body if no props', () => {
            let exp = '<blockquote class="gohei-post-body" style=""></blockquote>';

            let $el = render(<Body />);
            let got = $el.outerHTML;
            assert(got === exp);
        });
    });

    describe('replaceNoWithNoQuote()', () => {
        it('should replace no into no quote', () => {
            let blockquote = 'No.123<br />通常文';
            let post = new Post({ raw: { blockquote } });
            let $el = render(<Body {...{ post }} />);

            let got = $el.outerHTML;
            let exp = `
<blockquote class="gohei-post-body" style="">
<span class="gohei-quote">No.123</span><br>通常文
</blockquote>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should replace no into no quote globally', () => {
            let blockquote = 'No.100<br />No.101,No.102';
            let post = new Post({ raw: { blockquote } });
            let $el = render(<Body {...{ post }} />);

            let got = $el.outerHTML;
            let exp = `
<blockquote class="gohei-post-body" style="">
<span class="gohei-quote">No.100</span><br>
<span class="gohei-quote">No.101</span>,<span class="gohei-quote">No.102</span>
</blockquote>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should not replace no inside quote', () => {
            let blockquote = '<span class="gohei-quote">&gt;引用文No.100</span><br />通常文No.101';
            let post = new Post({ raw: { blockquote } });
            let $el = render(<Body {...{ post }} />);

            let got = $el.outerHTML;
            let exp = `
<blockquote class="gohei-post-body" style="">
<span class="gohei-quote">&gt;引用文No.100</span><br>
通常文<span class="gohei-quote">No.101</span>
</blockquote>
`.replace(/\n/g, '');
            assert(got === exp);
        });
    });

    describe('event', () => {
        let handlers;
        beforeEach(() => handlers = {});

        it('should handle popup quote', done => {
            let blockquote = '<span class="gohei-quote">&gt;引用文</span><br />通常文';
            let post = new Post({ raw: { blockquote } });

            handlers.popupQuote = event => {
                let got = event.target.classList.contains('gohei-quote');
                assert(got === true);
                done();
            };

            let $el = render(<Body {...{ post, handlers }} />);

            let $quote = $el.querySelector('.gohei-quote');
            $quote.dispatchEvent(new window.Event('mouseover', { bubbles: true }));
        });
    });
});
