'use strict';
import assert from 'assert';
import Catalog from '~/content/views/catalog/catalog.jsx';
import { h, render } from 'preact';
import { setup, teardown } from '@/support/dom';
import procedures from '~/content/procedures';
import createStore from '~/content/reducers';
import { preferences as pref } from '~/content/model';

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

            let preferences = pref.create({ catalog: { colnum: 3, rownum: 2 } });
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

            preferences = pref.create({ catalog: { colnum: 4, rownum: 3 } });
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

        it('should not render catalog if no props', () => {
            let $el = render(<Catalog />);
            let got = $el.outerHTML;
            assert(got === undefined);
        });
    });
});
