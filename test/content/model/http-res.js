'use strict';
import assert from 'assert';
import HttpRes from '~/content/model/http-res';

describe(__filename, () => {
    describe('constructor()', () => {
        it('should create httpRes', () => {
            let res = new HttpRes();
            assert(res);
        });

        it('should be freeze', done => {
            let res = new HttpRes();
            try { res.status = 200; } catch (e) {
                assert(e instanceof TypeError);
                done();
            }
        });

        it('should create httpRes if pass opts', () => {
            let opts = {
                status: 200, statusText: 'OK',
                lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT',
                etag: '"123000"'
            };
            let got = new HttpRes(opts);
            assert.deepEqual(got, opts);
        });

        it('should create httpRes if opts is like fetch() response', () => {
            let opts = {
                status: 200, statusText: 'OK',
                headers: {
                    'last-modified': 'Sun, 01 Jan 2017 01:23:45 GMT',
                    'etag': '"123000"',
                    get(name) { return this[name]; }
                }
            };
            let got = new HttpRes(opts);
            let exp = {
                status: 200, statusText: 'OK',
                lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT',
                etag: '"123000"'
            };
            assert.deepEqual(got, exp);
        });

        it('should create httpRes if format is document.lastModified', () => {
            let opts = { lastModified: '01/01/2017 10:23:45' };
            let res = new HttpRes(opts);
            assert(res.lastModified === 'Sun, 01 Jan 2017 01:23:45 GMT');
        });
    });

    describe('accessors', () => {
        it('should return reqHeaders', () => {
            let res = new HttpRes({
                headers: {
                    'last-modified': 'Sun, 01 Jan 2017 01:23:45 GMT',
                    'etag': '"123000"',
                    get(name) { return this[name]; }
                }
            });

            let got = res.reqHeaders;
            let exp = {
                'if-modified-since': 'Sun, 01 Jan 2017 01:23:45 GMT',
                'if-none-match': '"123000"'
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('unify()', () => {
        it('should unify', () => {
            let res = new HttpRes({
                status: 200, statusText: 'OK',
                lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT',
                etag: '"123000"'
            });

            let opts = { status: 304, statusText: 'Not Modified' };
            let got = res.unify(opts);
            let exp = {
                status: 304, statusText: 'Not Modified',
                lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT',
                etag: '"123000"'
            };
            assert.deepEqual(got, exp);
        });

        it('should unify if opts is like fetch() response', () => {
            let res = new HttpRes();

            let opts = {
                status: 200, statusText: 'OK',
                headers: {
                    'last-modified': 'Sun, 01 Jan 2017 01:23:45 GMT',
                    'etag': '"123000"',
                    get(name) { return this[name]; }
                }
            };
            let got = res.unify(opts);
            let exp = {
                status: 200, statusText: 'OK',
                lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT',
                etag: '"123000"'
            };
            assert.deepEqual(got, exp);
        });

        it('should unify if no args', () => {
            let res = new HttpRes({
                status: 200, statusText: 'OK',
                lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT',
                etag: '"123000"'
            });

            let got = res.unify();
            let exp = {
                status: 200,
                statusText: 'OK',
                lastModified: 'Sun, 01 Jan 2017 01:23:45 GMT',
                etag: '"123000"'
            };
            assert.deepEqual(got, exp);
            assert(got !== res);
        });
    });
});
