'use strict';
import assert from 'assert';
import * as util from '~/common/url';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('isFutaba()', () => {
        const { isFutaba } = util;

        it('should return true if url is futaba', () => {
            let got = isFutaba('https://may.2chan.net/b/res/123456789.htm');
            assert(got === true);
            got = isFutaba('http://may.2chan.net/b/futaba.php?mode=cat&sort=3');
            assert(got === true);
            got = isFutaba('https://www.2chan.net');
            assert(got === true);
        });

        it('should return false if url is not futaba', () => {
            let got = isFutaba('http://example.net');
            assert(got === false);
            got = isFutaba('http://may.2chan.net.example.net/b/res/123456789.htm');
            assert(got === false);
        });
    });

    describe('type()', () => {
        const { type } = util;

        it('should return "thread" correctly', () => {
            let got = type('https://may.2chan.net/b/res/123456789.htm');
            assert(got === 'thread');
            got = type('http://may.2chan.net/b/res/123456789.htm');
            assert(got === 'thread');

            got = type('https://www.2chan.net/hinan/res/12345.htm');
            assert(got === 'thread');
        });

        it('should return "catalog" correctly', () => {
            let got = type('https://may.2chan.net/b/futaba.php?mode=cat&sort=3');
            assert(got === 'catalog');
            got = type('http://may.2chan.net/b/futaba.php?mode=cat&sort=3');
            assert(got === 'catalog');

            got = type('https://www.2chan.net/hinan/futaba.php?mode=cat');
            assert(got === 'catalog');
            got = type('https://www.2chan.net/hinan/futaba.php?mode=cat&sort=1');
            assert(got === 'catalog');
            got = type('https://may.2chan.net/b/futaba.php?sort=1&mode=cat');
            assert(got === 'catalog');

            got = type('https://may.2chan.net/b/futaba.php?mode=catset');
            assert(got === null);
        });

        it('should return null if url is not futaba', () => {
            let got = type('https://www.example.net/');
            assert(got === null);
        });

        it('should return null if url is unknown pattern', () => {
            let got = type('https://www.2chan.net/');
            assert(got === null);

            got = type('https://may.2chan.net/b/futaba.htm');
            assert(got === null);
        });

        it('should return null if args is null or etc', () => {
            assert(type(null) === null);
            assert(type() === null);
            assert(type('') === null);
        });
    });

    describe('separate()', () => {
        const { separate } = util;

        it('should separate thread url', () => {
            let got = separate('https://may.2chan.net/b/res/123456789.htm');
            let exp = {
                server: 'may',
                boardKey: 'b',
                threadKey: '123456789'
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should separate catalog url', () => {
            let got = separate('https://may.2chan.net/b/futaba.php?mode=cat&sort=3');
            let exp = {
                server: 'may',
                boardKey: 'b',
                threadKey: null
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should throw exception if url is not futaba', () => {
            let got;
            try {
                separate('https://example.net/b/res/123456789.htm');
            } catch (e) { got = e.message; }
            let exp = 'not futaba url: https://example.net/b/res/123456789.htm';
            assert(got === exp);
        });

        it('should throw exception if can not separate url', () => {
            let got;
            try {
                separate('https://may.2chan.net/b/futaba.htm');
            } catch (e) { got = e.message; }
            let exp = 'could not separate url: https://may.2chan.net/b/futaba.htm';
            assert(got === exp);
        });
    });
});
