'use strict';
import assert from 'assert';
import { setup, teardown } from '@/support/dom';
import { $, createElement, tagName } from '~/content/util/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    beforeEach(() => document.body.innerHTML = '');

    describe('$()', () => {
        it('should return element by id', () => {
            document.body.innerHTML = '<div id="foo">bar</div>';

            let $el = $('foo');
            assert($el);
            let got = $el.outerHTML;
            let exp = '<div id="foo">bar</div>';
            assert(got === exp);
        });

        it('should return null if id not found', () => {
            let $el = $('foo');
            assert($el === null);
        });
    });

    describe('createElement()', () => {
        it('should return element', () => {
            let $el = createElement('div');
            assert($el);
            let got = $el.outerHTML;
            let exp = '<div></div>';
            assert(got === exp);
        });

        it('should return element with attributes', () => {
            let $el = createElement('div', { id: 'foo', class: 'bar' });
            assert($el);
            let got = $el.outerHTML;
            let exp = '<div id="foo" class="bar"></div>';
            assert(got === exp);
        });
    });

    describe('tagName()', () => {
        it('should return tag name correctly', () => {
            let $container = createElement('div');
            $container.innerHTML = `
<a>anchor tag</a>
<img>
<small>small tag</small>
<br>
foo bar
<!-- comment -->
`.replace(/\n/g, '');
            let [ $a, $img, $small, $br, $text, $comment ] = $container.childNodes;

            assert(tagName($a) === 'a');
            assert(tagName($img) === 'img');
            assert(tagName($small) === 'small');
            assert(tagName($br) === 'br');
            assert(tagName($text) === null);
            assert(tagName($comment) === null);
            assert(tagName(null) === null);
        });
    });
});
