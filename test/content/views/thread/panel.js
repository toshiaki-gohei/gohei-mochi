'use strict';
import assert from 'assert';
import Panel from '~/content/views/thread/panel.jsx';
import React from 'react';
import { simulate, mount, unmount } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import createStore from '~/content/reducers';
import { setUiThread, setAppThreads } from '~/content/reducers/actions';
import procedures from '~/content/procedures';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let store;
    beforeEach(() => {
        store = createStore({ app: { current: { thread: url } } });
        store.dispatch(setAppThreads({ url }));
    });
    const commit = () => {};
    const url = 'https://may.2chan.net/b/res/123000.htm';

    let $el;
    afterEach(() => {
        unmount($el);
        $el = null;
    });

    describe('render()', () => {
        it('should render icon', () => {
            let { app, ui } = store.getState();
            $el = mount(<Panel {...{ commit, app, ui }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-panel" role="presentation">
<button class="gohei-icon-btn gohei-panel-icon gohei-icon-menu"></button>
<div class="gohei-panel-content" style="display: none;">
<button class="gohei-icon-btn gohei-close-btn gohei-icon-close"></button>
<div class="gohei-tab-content">
<div class="gohei-postform" style="display: none;">.+</div>
<div class="gohei-delform" style="display: none;">.+</div>
<div class="gohei-delreq" style="display: none;">.+</div>
</div>
<ul class="gohei-tabsbar">.+</ul>
</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render panel content', () => {
            store.dispatch(setUiThread({
                panel: { isOpen: true, type: 'FORM_POST' }
            }));

            let { app, ui } = store.getState();
            $el = mount(<Panel {...{ commit, app, ui }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-panel" role="presentation">
<button class="gohei-icon-btn gohei-panel-icon gohei-icon-menu" style="display: none;"></button>
<div class="gohei-panel-content">
<button class="gohei-icon-btn gohei-close-btn gohei-icon-close"></button>
<div class="gohei-tab-content">
<div class="gohei-postform">.+</div>
<div class="gohei-delform" style="display: none;">.+</div>
<div class="gohei-delreq" style="display: none;">.+</div>
</div>
<ul class="gohei-tabsbar">.+</ul>
</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should throw exception if no commit', () => {
            let got;
            try { mount(<Panel />); } catch (e) { got = e.message; }
            assert(got === 'commit is required');
        });

        it('should render panel if no props', () => {
            $el = mount(<Panel {...{ commit }} />);
            let got = $el.outerHTML;
            let exp = '<div class="gohei-panel" role="presentation"></div>';
            assert(got === exp);
        });
    });

    describe('event', () => {
        it('should open panel if click panel icon', done => {
            let { app, ui } = store.getState();
            let mock = procedures(null, {
                'thread/openPanel': done
            });

            $el = mount(<Panel {...{ commit: mock, app, ui }} />);

            let $icon = $el.querySelector('.gohei-panel-icon');
            simulate.click($icon);
        });

        it('should close panel if click close button', done => {
            let { app, ui } = store.getState();
            let mock = procedures(null, {
                'thread/closePanel': done
            });

            $el = mount(<Panel {...{ commit: mock, app, ui }} />);

            let $btn = $el.querySelector('.gohei-panel .gohei-close-btn');
            simulate.click($btn);
        });

        it('should close panel if click body', done => {
            let { app, ui } = store.getState();
            let mock = procedures(null, {
                'thread/closePanel': done
            });

            $el = mount(<Panel {...{ commit: mock, app, ui }} />);

            document.body.dispatchEvent(new window.Event('click'));
        });
    });
});
