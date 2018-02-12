'use strict';
import assert from 'assert';
import SearchResults from '~/content/views/catalog/search-results.jsx';
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
        it('should render search empty results', () => {
            let $el = render(<SearchResults {...{ commit }} />);

            let got = $el.outerHTML;
            let exp = '<ol class="gohei-catalog gohei-search-results"></ol>';
            assert(got === exp);
        });

        it('should render search results', () => {
            let props = {
                commit,
                searchResults: urls.slice(0, 5),
                preferences: prefs.load()
            };
            let $el = render(<SearchResults {...props} />);

            let $results = $el.querySelectorAll('.gohei-search-results > li.gohei-catalog-item');
            assert($results.length === 5);
        });

        it('should not render search resulsts if no props', () => {
            let $el = render(<SearchResults />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });
});
