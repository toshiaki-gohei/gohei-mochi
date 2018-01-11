'use strict';
import assert from 'assert';
import { setup, teardown } from '@/support/dom';
import { $, createElement } from '~/content/util/dom';

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
});
