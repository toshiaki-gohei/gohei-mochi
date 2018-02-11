'use strict';
import assert from 'assert';
import Catalog, { internal } from '~/content/views/catalog/catalog.jsx';
import React from 'react';
import { render } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import procedures from '~/content/procedures';
import createStore from '~/content/reducers';
import { preferences as prefs } from '~/content/model';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    const urls = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ].map(i => `url-thread0${i}.htm`);
    const threads = urls.reduce((map, url, index) => {
        let thread = { url, title: `thread${index + 1}` };
        map.set(url, thread);
        return map;
    }, new Map());

    const store = createStore({ domain: { threads } });
    const commit = procedures(store);

    describe('render()', () => {
        it('should render catalog', () => {
            let $el = render(<Catalog {...{ commit }} />);

            let got = $el.outerHTML;
            let exp = '<ol class="gohei-catalog"></ol>';
            assert(got === exp);
        });

        it('should render catalog correctly', () => {
            let catalog = { threads: urls };

            let preferences = prefs.create({ catalog: { colnum: 3, rownum: 2 } });
            let $el = render(<Catalog {...{ commit, catalog, preferences }} />);

            let got = $el.outerHTML;
            let attr = 'class="gohei-catalog-item" style="width: 33.33%;"';
            let exp = new RegExp(`^
<ol class="gohei-catalog">
<li ${attr}>.+?</li><li ${attr}>.+?</li><li ${attr}>.+?</li>
<li ${attr}>.+?</li><li ${attr}>.+?</li><li ${attr}>.+?</li>
</ol>
$`.replace(/\n/g, ''));
            assert(exp.test(got));

            preferences = prefs.create({ catalog: { colnum: 4, rownum: 3 } });
            $el = render(<Catalog {...{ commit, catalog, preferences }} />);
            got = $el.outerHTML;
            attr = 'class="gohei-catalog-item" style="width: 25%;"';
            exp = new RegExp(`^
<ol class="gohei-catalog">
<li ${attr}>.+?</li><li ${attr}>.+?</li><li ${attr}>.+?</li><li ${attr}>.+?</li>
<li ${attr}>.+?</li><li ${attr}>.+?</li><li ${attr}>.+?</li><li ${attr}>.+?</li>
<li ${attr}>.+?</li><li ${attr}>.+?</li>
</ol>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render catalog title correctly', () => {
            let catalog = { threads: urls };

            let preferences = prefs.create({
                catalog: { colnum: 1, rownum: 1, title: { length: 2 } }
            });
            let $el = render(<Catalog {...{ commit, catalog, preferences }} />);
            let got = $el.querySelector('.gohei-thread-title').textContent;
            assert(got === 'thre');

            preferences = prefs.create({
                catalog: { colnum: 1, rownum: 1, title: { length: 4 } }
            });
            $el = render(<Catalog {...{ commit, catalog, preferences }} />);
            got = $el.querySelector('.gohei-thread-title').textContent;
            assert(got === 'thread1');
        });

        it('should not render catalog if no props', () => {
            let $el = render(<Catalog />);
            let got = $el.outerHTML;
            assert(got === null);
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
