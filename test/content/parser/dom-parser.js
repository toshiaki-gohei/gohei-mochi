'use strict';
import assert from 'assert';
import parseFromString from '~/content/parser/dom-parser';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('export', () => {
        it('should export function', () => {
            assert(typeof parseFromString === 'function');
        });
    });

    describe('parsing specification', () => {
        it('should have innerHTML', () => {
            let doc = parseFromString('<div>test</div>', 'text/html');
            let div = doc.body.firstChild;
            let got = div.innerHTML;
            assert(got === 'test');
        });

        it('should have getElementsByTagName()', () => {
            let doc = parseFromString('<div>test</div>', 'text/html');
            let div = doc.body.getElementsByTagName('div')[0];
            let got = div.textContent;
            assert(got === 'test');
        });

        it('should have getElementsByClassName()', () => {
            let doc = parseFromString('<div class="foo">test</div>', 'text/html');
            let div = doc.body.getElementsByClassName('foo')[0];
            let got = div.textContent;
            assert(got === 'test');
        });

        it('should have querySelector()', () => {
            let doc = parseFromString('<div class="foo">test</div>', 'text/html');
            let div = doc.body.querySelector('.foo');
            let got = div.textContent;
            assert(got === 'test');
        });

        it('should decode entities', () => {
            let doc = parseFromString('<span>abc&©あ</span>', 'text/html');
            let got = doc.body.innerHTML;
            assert(got === '<span>abc&amp;©あ</span>');
            got = doc.body.textContent;
            assert(got === 'abc&©あ');
        });

        it('should remove \\n in tags', () => {
            let doc = parseFromString('<span\nclass="foo">bar</span>', 'text/html');
            let got = doc.body.innerHTML;
            assert(got === '<span class="foo">bar</span>');
        });
    });
});
