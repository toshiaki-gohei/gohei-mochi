'use strict';
import assert from 'assert';
import * as util from '~/content/util/html';

describe(__filename, () => {
    describe('removeTagsSimply()', () => {
        const fn = util.removeTagsSimply;

        it('should return removed rags string', () => {
            assert(fn('<span>foo</span>') === 'foo');
            assert(fn('<div><span>foo</span></div>') === 'foo');
            assert(fn('<div><span>foo</span>bar</div>') === 'foobar');
        });

        it('should remove simply', () => {
            assert(fn('<span>foo > bar</span>') === 'foo > bar');
            assert(fn('<span>foo < bar</span>') === 'foo ');

            assert(fn('<span class="a">foo</span>') === 'foo');
            assert(fn('<span class=">">foo</span>') === '">foo');
            assert(fn('<span class="<">foo</span>') === 'foo');
        });
    });

    describe('escape()', () => {
        it('should return escaped string', () => {
            let got = util.escape('& < > " \' `');
            let exp = '&amp; &lt; &gt; &quot; &#x27; &#x60;';
            assert(got === exp);
        });
    });

    describe('unescape()', () => {
        it('should return unescaped string', () => {
            let got = util.unescape('&amp; &lt; &gt; &quot; &#x27; &#x60;');
            let exp = '& < > " \' `';
            assert(got === exp);
        });
    });

    describe('textify()', () => {
        it('should return text', () => {
            let got = util.textify('<font>&gt;引用文</font>');
            assert(got === '>引用文');
        });
    });

    describe('removeQuoteMark()', () => {
        const removeQuoteMark = util.removeQuoteMark;

        it('should return quote removed mark', () => {
            let got = removeQuoteMark('>引用文');
            assert(got === '引用文');
            got = removeQuoteMark('>>引用文');
            assert(got === '>引用文');

            got = removeQuoteMark('> 引用文');
            assert(got === '引用文');
            got = removeQuoteMark('> >引用文');
            assert(got === '>引用文');
            got = removeQuoteMark('> ');
            assert(got === ' ');

            got = removeQuoteMark('>引用文\n');
            assert(got === '引用文\n');
        });
    });
});
