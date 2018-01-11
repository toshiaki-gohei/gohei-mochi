'use strict';
import assert from 'assert';
import Main from '~/content/views/thread/index.jsx';
import { h, render } from 'preact';
import { setup, teardown } from '@/support/dom';
import createStore from '~/content/reducers';
import { setDomainThreads, setAppThreads, setAppCurrent } from '~/content/reducers/actions';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store, commit;
    beforeEach(() => {
        let url = 'http://example.net';
        store = createStore();
        store.dispatch(setDomainThreads({ url }));
        store.dispatch(setAppThreads({ url }));
        store.dispatch(setAppCurrent({ thread: url }));
        commit = () => {};
    });

    describe('render()', () => {
        it('should render main content', () => {
            let $el = render(<Main {...{ store, commit } } />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<main>
<div class="gohei-thread"></div>
<div class="gohei-console">.+?</div>
<div class="gohei-panel" role="presentation">.+?</div>
<div class="gohei-popup-container"></div>
</main>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should throw exception if no store', () => {
            let got;
            try { render(<Main />); } catch (e) { got = e.message; }
            assert(got === 'store is required');
        });
    });
});
