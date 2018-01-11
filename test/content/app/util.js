'use strict';
import assert from 'assert';
import * as util from '~/content/app/util';
import { setup, teardown, isBrowser } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    (isBrowser ? describe.skip : describe)('sendMessage()', () => {
        const { sendMessage } = util;

        let backup;
        before(() => backup = chrome.runtime.sendMessage);
        after(() => chrome.runtime.sendMessage = backup);

        if (typeof global.browser !== 'undefined') throw new Error('browser is defined');
        beforeEach(() => delete global.browser);

        it('should send message on Firefox', async () => {
            global.browser = {};
            chrome.runtime.sendMessage = ({ msg })=> {
                assert(msg === 'test message');
                return Promise.resolve('response');
            };

            let got = await sendMessage({ msg: 'test message' });
            assert(got === 'response');
        });

        it('should send message on Chrome', async () => {
            chrome.runtime.sendMessage = ({ msg }, resolve)=> {
                assert(msg === 'test message');
                resolve('response');
            };

            let got = await sendMessage({ msg: 'test message' });
            assert(got === 'response');
        });
    });

    describe('initializeBodyStyle()', () => {
        const { initializeBodyStyle } = util;

        it('should initialize body style', () => {
            document.body.innerHTML = `
<body bgcolor="#FFFFEE" text="#800000" link="#0000EE" vlink="#0000EE" alink="#FF0000">
<h1>title</h1>
<div>content</div>
</body>
`.replace(/\n/g, '');

            initializeBodyStyle(document.body);

            let got = document.body.outerHTML;
            let exp = `
<body class="gohei">
<h1>title</h1>
<div>content</div>
</body>
`.replace(/\n/g, '');
            assert(got === exp);
        });
    });

    describe('removeChildNodes()', () => {
        const { removeChildNodes } = util;

        it('should remove child nodes', () => {
            document.body.innerHTML = `
<div>removed</div>
removed
<div id="gohei-skipped">id with gohei prefix is not removed</div>
<div class="gohei-not-skipped">class with gohei prefix is removed</div>
<!-- removed -->
`.replace(/\n/g, '');

            let removed = removeChildNodes(document.body);

            let got = document.body.innerHTML;
            let exp = `
<div id="gohei-skipped">id with gohei prefix is not removed</div>
`.replace(/\n/g, '');
            assert(got === exp);

            got = removed.map($el => $el.outerHTML);
            exp = [
                '<div>removed</div>',
                '<div class="gohei-not-skipped">class with gohei prefix is removed</div>'
            ];
            assert.deepStrictEqual(got, exp);
        });
    });
});
