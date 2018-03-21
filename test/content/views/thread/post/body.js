'use strict';
import assert from 'assert';
import Body from '~/content/views/thread/post/body.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import { Post, post } from '~/content/model';

const BR = post.BR_TAG;

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('render()', () => {
        it('should render body', () => {
            let blockquote = `<span class="gohei-quote">&gt;引用文</span>${BR}通常文`;
            let post = new Post({ raw: { blockquote } });
            let $el = render(<Body {...{ post }} />);

            let got = $el.outerHTML;
            let exp = `
<blockquote class="gohei-post-body">
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

        it('should replace targets', () => {
            let blockquote = `
No.12345${BR}
https://may.2chan.net/b/res/546730074.htm${BR}
su1230001.jpg${BR}
`.replace(/\n/g, '');

            let post = new Post({ raw: { blockquote } });
            let $el = render(<Body {...{ post }} />);

            let got = $el.outerHTML;
            let exp = `
<blockquote class="gohei-post-body">
<span class="gohei-quote">No.12345</span><br>
<a href="https://may.2chan.net/b/res/546730074.htm" rel="noreferrer">https://may.2chan.net/b/res/546730074.htm</a><br>
<a href="http://www.nijibox5.com/futabafiles/tubu/src/su1230001.jpg" rel="noreferrer">su1230001.jpg</a><br>
</blockquote>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should render body if no props', () => {
            let $el = render(<Body />);
            let got = $el.outerHTML;
            let exp = '<blockquote class="gohei-post-body"></blockquote>';
            assert(got === exp);
        });
    });

    describe('event', () => {
        let handlers;
        beforeEach(() => handlers = {});

        it('should handle to popup quote', done => {
            let blockquote = `<span class="gohei-quote">&gt;引用文</span>${BR}通常文`;
            let post = new Post({ raw: { blockquote } });

            handlers.popupQuote = event => {
                let got = event.target.classList.contains('gohei-quote');
                assert(got === true);
                done();
            };

            let $el = render(<Body {...{ post, handlers }} />);

            let target = $el.querySelector('.gohei-quote');
            simulate.mouseOver($el.querySelector('blockquote'), { target });
        });
    });
});
