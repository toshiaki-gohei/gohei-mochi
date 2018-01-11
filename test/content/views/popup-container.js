'use strict';
import assert from 'assert';
import PopupContainer from '~/content/views/popup-container.jsx';
import { h, render } from 'preact';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('render()', () => {
        it('should render popup container', () => {
            let $el = render(<PopupContainer />);

            let got = $el.outerHTML;
            let exp = '<div class="gohei-popup-container"></div>';
            assert(got === exp);
        });

        it('should render popups', () => {
            const Popup = props => <div {...props}>hoge</div>;
            let popups = new Map([
                [ 'popup01', { component: Popup, id: 'popup01' } ],
                [ 'popup02', { component: Popup, id: 'popup02' } ]
            ]);

            let $el = render(<PopupContainer {...{ popups }} />);

            let got = $el.outerHTML;
            let exp = `
<div class="gohei-popup-container">
<div id="popup01" class="gohei-popup">hoge</div>
<div id="popup02" class="gohei-popup">hoge</div>
</div>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should render popup with props', () => {
            const Popup = ({ text, ...rest }) => <div {...rest}>{text}</div>;
            let popup = {
                component: Popup,
                id: 'popup01',
                props: {
                    class: 'class-name1 class-name2',
                    style: { left: '100px', top: '200px' },
                    text: 'hoge'
                }
            };
            let popups = new Map([ [ 'popup01', popup ] ]);
            let props = { popups };

            let $el = render(<PopupContainer {...props} />);

            let got = $el.outerHTML;
            let exp = `
<div class="gohei-popup-container">
<div id="popup01" class="gohei-popup class-name1 class-name2" style="left: 100px; top: 200px;">hoge</div>
</div>
`.replace(/\n/g, '');
            assert(got === exp);
        });
    });
});
