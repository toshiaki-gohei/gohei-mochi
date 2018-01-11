'use strict';
import assert from 'assert';
import Changeset from '~/content/model/thread/changeset';
import { STATE } from '~/content/model/post';

describe(__filename, () => {
    describe('constructor()', () => {
        it('should create changeset', () => {
            let cs = new Changeset();
            assert(cs);
        });

        it('Object.seal()', done => {
            let cs = new Changeset();
            try { cs.foo = 'bar'; } catch (e) {
                assert(e instanceof TypeError);
                done();
            }
        });

        it('should create changeset with args', () => {
            let changes = [
                { index: 1, no: '12301', userId: 'XXX', userIp: null, state: null },
                { index: 2, no: '12302', userId: null, userIp: '192.168.*(example.net)', state: null },
                null,
                { index: 4, no: '12304', userId: null, userIp: null, state: STATE.DELETE_BY_WRITER }
            ];

            let got = new Changeset({ changes, newPostsCount: 2 });
            let exp = {
                newPostsCount: 2,
                exposedIdPosts: [
                    { index: 1, no: '12301', userId: 'XXX', userIp: null }
                ],
                exposedIpPosts: [
                    { index: 2, no: '12302', userId: null, userIp: '192.168.*(example.net)' }
                ],
                deletedPosts: [
                    { index: 4, no: '12304', userId: null, userIp: null }
                ]
            };
            assert.deepEqual(got, exp);
        });
    });

    describe('countExposedIds()', () => {
        it('should count', () => {
            let exposedIdPosts = [
                { index: 1, no: '12301', userId: 'ID01' },
                { index: 2, no: '12302', userId: 'ID02' },
                { index: 4, no: '12304', userId: 'ID01' }
            ];
            let cs = new Changeset({ exposedIdPosts });

            let got = cs.countExposedIds();
            let exp = { 'ID01': 2, 'ID02': 1 };
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if no expsed ids', () => {
            let cs = new Changeset();
            let got = cs.countExposedIds();
            assert(got === null);
        });
    });

    describe('countExposedIps()', () => {
        it('should count', () => {
            let exposedIpPosts = [
                { index: 1, no: '12301', userIp: '172.16.*(example.net)' },
                { index: 2, no: '12302', userIp: '172.17.*(example.net)' },
                { index: 4, no: '12304', userIp: '172.16.*(example.net)' }
            ];
            let cs = new Changeset({ exposedIpPosts });

            let got = cs.countExposedIps();
            let exp = { '172.16.*(example.net)': 2, '172.17.*(example.net)': 1 };
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if no expsed ips', () => {
            let cs = new Changeset();
            let got = cs.countExposedIps();
            assert(got === null);
        });
    });
});
