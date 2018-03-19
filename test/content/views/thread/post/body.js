'use strict';
import assert from 'assert';
import Body from '~/content/views/thread/post/body.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
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

        it('should render body if no props', () => {
            let exp = '<blockquote class="gohei-post-body"></blockquote>';

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
<blockquote class="gohei-post-body">
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
<blockquote class="gohei-post-body">
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
<blockquote class="gohei-post-body">
<span class="gohei-quote">&gt;引用文No.100</span><br>
通常文<span class="gohei-quote">No.101</span>
</blockquote>
`.replace(/\n/g, '');
            assert(got === exp);
        });
    });

    describe('replaceLink()', () => {
        it('should replace a string like URL with link', () => {
            let blockquote = 'https://may.2chan.net/b/res/546730074.htm<br />通常文';
            let post = new Post({ raw: { blockquote } });
            let $el = render(<Body {...{ post }} />);

            let got = $el.outerHTML;
            let exp = `
<blockquote class="gohei-post-body">
<a href="https://may.2chan.net/b/res/546730074.htm" rel="noreferrer">https://may.2chan.net/b/res/546730074.htm</a><br>
通常文
</blockquote>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should replace strings like URL with link', () => {
            let blockquote = `
<span class="gohei-quote">
&gt;引用文 https://addons.mozilla.org/ja/firefox/addon/gohei-mochi/
</span><br />
通常文 https://addons.mozilla.org/ja/firefox/addon/gohei-mochi/<br />
<span class="gohei-quote">
&gt;ttp://example.net/foo/bar ttps://example.net/hoge/fuga
</span><br />
ttp://example.net/foo/bar ttps://example.net/hoge/fuga
`.replace(/\n/g, '');
            let post = new Post({ raw: { blockquote } });
            let $el = render(<Body {...{ post }} />);

            let got = $el.outerHTML;
            let exp = `
<blockquote class="gohei-post-body">
<span class="gohei-quote">
&gt;引用文 <a href="https://addons.mozilla.org/ja/firefox/addon/gohei-mochi/" rel="noreferrer">https://addons.mozilla.org/ja/firefox/addon/gohei-mochi/</a>
</span><br>
通常文 <a href="https://addons.mozilla.org/ja/firefox/addon/gohei-mochi/" rel="noreferrer">https://addons.mozilla.org/ja/firefox/addon/gohei-mochi/</a><br>
<span class="gohei-quote">
&gt;<a href="http://example.net/foo/bar" rel="noreferrer">ttp://example.net/foo/bar</a> <a href="https://example.net/hoge/fuga" rel="noreferrer">ttps://example.net/hoge/fuga</a></span><br>
<a href="http://example.net/foo/bar" rel="noreferrer">ttp://example.net/foo/bar</a> <a href="https://example.net/hoge/fuga" rel="noreferrer">ttps://example.net/hoge/fuga</a>
</blockquote>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should replace protocol correctly', () => {
            let blockquote = `
http://example.net/url1 ttp://example.net/url2 tp://example.net/url3<br />
https://example.net/url1 ttps://example.net/url2 tps://example.net/url3
`.replace(/\n/g, '');
            let post = new Post({ raw: { blockquote } });
            let $el = render(<Body {...{ post }} />);

            let got = $el.outerHTML;
            let exp = `
<blockquote class="gohei-post-body">
<a href="http://example.net/url1" rel="noreferrer">http://example.net/url1</a> <a href="http://example.net/url2" rel="noreferrer">ttp://example.net/url2</a> <a href="http://example.net/url3" rel="noreferrer">tp://example.net/url3</a><br>
<a href="https://example.net/url1" rel="noreferrer">https://example.net/url1</a> <a href="https://example.net/url2" rel="noreferrer">ttps://example.net/url2</a> <a href="https://example.net/url3" rel="noreferrer">tps://example.net/url3</a>
</blockquote>
`.replace(/\n/g, '');
            assert(got === exp);
        });
    });

    describe('event', () => {
        let handlers;
        beforeEach(() => handlers = {});

        it('should handle to popup quote', done => {
            let blockquote = '<span class="gohei-quote">&gt;引用文</span><br />通常文';
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
