'use strict';
import assert from 'assert';
import { isBrowser } from '@/support/dom';

(isBrowser ? describe.skip : describe)(__filename, () => {
    let jsdom, jscode;
    before(() => {
        const JSDOM = require('jsdom').JSDOM;
        jsdom = new JSDOM('', { runScripts: 'dangerously' });

        const fs = require('fs');
        const path = require('path');
        let jspath = path.resolve(__dirname, '../../src/resources/js-error-preventer.js');
        jscode = fs.readFileSync(jspath, 'utf8');
    });

    const { Script } = require('vm');

    describe('prevent js errors', () => {
        it('should define dummy functions', () => {
            let script = new Script(jscode);
            jsdom.runVMScript(script);

            let { window } = jsdom;
            let got = [ 'l', 'ucount', 'setoebtn', 'scrll', 'reszk' ].every(name => {
                return typeof window[name] === 'function';
            });
            assert(got === true);
        });
    });
});
