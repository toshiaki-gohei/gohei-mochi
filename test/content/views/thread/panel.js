'use strict';
import assert from 'assert';
import Panel from '~/content/views/thread/panel.jsx';
import { h, render } from 'preact';
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

    describe('render()', () => {
        it('should render icon', () => {
            let { app, ui } = store.getState();
            let $el = render(<Panel {...{ commit, app, ui }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-panel" role="presentation">
<button class="gohei-icon-btn gohei-panel-icon" style="">.+</button>
<div class="gohei-panel-content" style="display: none;">
<button class="gohei-icon-btn gohei-close-btn">.+</button>
<div class="gohei-tab-content">
<div class="gohei-postform" style="display: none;">.+</div>
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
            let $el = render(<Panel {...{ commit, app, ui }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-panel" role="presentation">
<button class="gohei-icon-btn gohei-panel-icon" style="display: none;">.+</button>
<div class="gohei-panel-content" style="">
<button class="gohei-icon-btn gohei-close-btn">.+</button>
<div class="gohei-tab-content">
<div class="gohei-postform" style="">.+</div>
<div class="gohei-delreq" style="display: none;">.+</div>
</div>
<ul class="gohei-tabsbar">.+</ul>
</div>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should not render panel if no props', () => {
            let $el = render(<Panel />);
            let got = $el.outerHTML;
            assert(got === undefined);
        });
    });

    describe('event', () => {
        let props;
        beforeEach(() => {
            let { app, ui } = store.getState();
            props = { commit, app, ui };
        });

        it('should commit procedure if emit open event', done => {
            let mock = procedures(null, {
                'thread/openPanel': done
            });

            let $el = render(<Panel {...{ ...props, commit: mock }} />);

            let $icon = $el.querySelector('.gohei-panel-icon');
            $icon.dispatchEvent(new window.Event('click'));
        });

        it('should commit procedure if emit close event', done => {
            let mock = procedures(null, {
                'thread/closePanel': done
            });

            let $el = render(<Panel {...{ ...props, commit: mock }} />);

            let $btn = $el.querySelector('.gohei-panel .gohei-close-btn');
            $btn.dispatchEvent(new window.Event('click'));
        });
    });
});
