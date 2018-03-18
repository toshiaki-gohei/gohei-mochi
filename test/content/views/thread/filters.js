'use strict';
import assert from 'assert';
import Filters from '~/content/views/thread/filters.jsx';
import React from 'react';
import { render, simulate } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import createStore from '~/content/reducers';
import { setAppThreads } from '~/content/reducers/actions';
import procedures from '~/content/procedures';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store, props;
    beforeEach(() => {
        store = createStore({
            app: { current: { thread: URL } },
            ui: { thread: { panel: { isOpen: true, type: 'FILTERS' } } }
        });
        store.dispatch(setAppThreads({ url: URL }));

        let { app, ui: { thread: { panel } } } = store.getState();
        props = { panel, app };
    });

    const URL = 'https://may.2chan.net/b/res/123456789.htm';

    describe('render()', () => {
        it('should render filters', () => {
            let $el = render(<Filters {...props} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-filters">
<div>フィルタ</div>
<div class="gohei-pane">
<div class="gohei-row">.+</div>
</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should not render filters if no props', () => {
            let $el = render(<Filters />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });

    describe('event', () => {
        it('should change isHiddenDeletedPosts state if click checkbox', done => {
            let mock = procedures(store, {
                'thread/setFilters': filters => {
                    let { isHiddenDeletedPosts } = filters;
                    assert(isHiddenDeletedPosts === false);
                    done();
                }
            });

            let $el = render(<Filters {...{ ...props, commit: mock }} />);

            let $checkbox = $el.querySelector('.gohei-checkbox:nth-child(1)');
            simulate.change($checkbox);
        });
    });
});
