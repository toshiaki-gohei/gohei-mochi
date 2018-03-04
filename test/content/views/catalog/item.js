'use strict';
import assert from 'assert';
import Item, { internal } from '~/content/views/catalog/item.jsx';
import React from 'react';
import { render } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import { preferences as prefs } from '~/content/model';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('render()', () => {
        let thread;
        beforeEach(() => {
            thread = { url: 'url-thread01', title: 'thread01', replynum: 10 };
        });

        let preferences = prefs.load();

        it('should render item', () => {
            thread = { ...thread, newReplynum: 5 };
            let $el = render(<Item {...{ thread, preferences }} />);

            let got = $el.outerHTML;
            let exp = `
<li class="gohei-catalog-item" style="width: 7.14%;">
<div class="gohei-border-container">
<a href="url-thread01" target="_blank" class="gohei-thread-thumb" style="width: 50px; height: 50px;"></a>
<div class="gohei-thread-title">thread01</div>
<div class="gohei-font-smaller">
<span class="gohei-thread-replynum">10</span><span class="gohei-thread-newreplynum">+5</span>
</div>
</div>
</li>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should render item as new', () => {
            thread = { ...thread, newReplynum: null };
            let $el = render(<Item {...{ thread, preferences }} />);

            let got = $el.outerHTML;
            let exp = `
<li class="gohei-catalog-item" style="width: 7.14%;">
<div class="gohei-border-container">
<a href="url-thread01" target="_blank" class="gohei-thread-thumb" style="width: 50px; height: 50px;"></a>
<div class="gohei-thread-title">thread01</div>
<div class="gohei-font-smaller">
<span class="gohei-thread-replynum">10</span><span class="gohei-thread-newreplynum">new</span>
</div>
</div>
</li>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should render catalog title correctly', () => {
            thread = { ...thread, title: '0123456789' };

            preferences = prefs.create({ catalog: { title: { length: 2 } } });
            let $el = render(<Item {...{ thread, preferences }} />);
            let got = $el.querySelector('.gohei-thread-title').textContent;
            assert(got === '0123');

            preferences = prefs.create({ catalog: { title: { length: 4 } } });
            $el = render(<Item {...{ thread, preferences }} />);
            got = $el.querySelector('.gohei-thread-title').textContent;
            assert(got === '01234567');
        });
    });

    describe('substr()', () => {
        const { substr } = internal;

        it('should count correctly', () => {
            assert(substr('abcd', 2) === 'abcd');
            assert(substr('abcde', 2) === 'abcd');

            assert(substr('あいう', 3) === 'あいう');
            assert(substr('あいうe', 3) === 'あいう');
            assert(substr('あいうえ', 3) === 'あいう');

            assert(substr('abcd', 2) === 'abcd');
            assert(substr('abcあ', 2) === 'abc');
        });

        it('should count correctly if contains surrogate pairs', () => {
            assert(substr('abc𐐀', 2) === 'abc');
            assert(substr('abc𐐀', 3) === 'abc𐐀');

            assert(substr('ab𠮷', 2) === 'ab𠮷');
            assert(substr('abc𠮷', 2) === 'abc');
        });

        it('should return str as it is if length is none', () => {
            let str = 'abc';
            let got = substr(str);
            assert(got === str);
        });
    });
});
