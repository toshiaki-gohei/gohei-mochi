'use strict';
import assert from 'assert';
import Bootstrap, { internal } from '~/content/app/bootstrap';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    beforeEach(() => {
        document.head.innerHTML = '';
        document.body.innerHTML = '';
    });

    describe('constructor()', () => {
        it('should create bootstrap', () => {
            let got = new Bootstrap();
            assert(got);
        });
    });

    describe('_enableHiddenBody()', () => {
        it('should enable hidden body', () => {
            let b = new Bootstrap();

            b._enableHiddenBody();
            let $el = document.getElementById('gohei-hidden-body');
            assert($el);

            let got = document.head.innerHTML;
            let exp = `
<style type="text/css" id="gohei-hidden-body">body { display: none; }</style>
`.replace(/\n/g, '');
            assert(got === exp);
        });
    });

    describe('_disableHiddenBody()', () => {
        it('should disable hidden body', () => {
            let b = new Bootstrap();
            b._enableHiddenBody();

            b._disableHiddenBody();
            let got = document.head.innerHTML;
            assert(got === '');
        });
    });

    describe('checkPage()', () => {
        const { checkPage } = internal;

        it('should check page correctly', () => {
            document.head.innerHTML = '<title></title>';

            document.title = '404 File Not Found';
            let got = checkPage();
            assert(got === false);
            document.title = 'foo';
            got = checkPage();
            assert(got === true);
            document.title = '404 File Not Found | error';
            got = checkPage();
            assert(got === true);

            document.title = 'Website is offline | 522: Connection timed out';
            got = checkPage();
            assert(got === false);
            document.title = 'may.2chan.net | 522: Connection timed out';
            got = checkPage();
            assert(got === false);
            document.title = 'Website is offline | 522: Connection timed out | error';
            got = checkPage();
            assert(got === true);
            document.title = 'may.2chan.net | 522: Connection timed out | error';
            got = checkPage();
            assert(got === true);

            document.title = 'Website is offline | 524: A timeout occurred';
            got = checkPage();
            assert(got === false);
            document.title = 'Website is offline | 524: A timeout occurred | error';
            got = checkPage();
            assert(got === true);
        });
    });
});
