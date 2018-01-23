'use strict';
import assert from 'assert';
import Main from '~/content/views/catalog/index.jsx';
import React from 'react';
import { render } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import createStore from '~/content/reducers';
import { setDomainCatalogs, setAppCatalogs, setAppCurrent } from '~/content/reducers/actions';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store, commit;
    beforeEach(() => {
        let url = 'http://example.net';
        store = createStore();
        store.dispatch(setDomainCatalogs({ url }));
        store.dispatch(setAppCatalogs({ url }));
        store.dispatch(setAppCurrent({ catalog: url }));
        commit = () => {};
    });

    describe('render()', () => {
        it('should render main content', () => {
            let $el = render(<main><Main {...{ store, commit } } /></main>);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<main>
<nav class="gohei-nav">.+?</nav>
<h2 class="gohei-mode-title">カタログモード</h2>
<ol class="gohei-catalog">.*?</ol>
</main>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should throw exception if no store', () => {
            let got;
            try { render(<main><Main /></main>); } catch (e) { got = e.message; }
            assert(got === 'store is required');
        });
    });
});
