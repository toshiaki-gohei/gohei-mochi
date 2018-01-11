'use strict';
import assert from 'assert';
import * as actions from '~/content/reducers/actions';

describe(__filename, () => {
    describe('setDomainPosts()', () => {
        const { setDomainPosts } = actions;

        it('should create action', () => {
            let got = setDomainPosts([ 'payload' ]);
            let exp = { type: 'SET_DOMAIN_POSTS', posts: [ 'payload' ] };
            assert.deepStrictEqual(got, exp);

            got = setDomainPosts('payload');
            exp = { type: 'SET_DOMAIN_POSTS', post: 'payload' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('setDomainThreads()', () => {
        const { setDomainThreads } = actions;

        it('should create action', () => {
            let got = setDomainThreads([ 'payload' ]);
            let exp = { type: 'SET_DOMAIN_THREADS', threads: [ 'payload' ] };
            assert.deepStrictEqual(got, exp);

            got = setDomainThreads('payload');
            exp = { type: 'SET_DOMAIN_THREADS', thread: 'payload' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('setDomainCatalogs()', () => {
        const { setDomainCatalogs } = actions;

        it('should create action', () => {
            let got = setDomainCatalogs([ 'payload' ]);
            let exp = { type: 'SET_DOMAIN_CATALOGS', catalogs: [ 'payload' ] };
            assert.deepStrictEqual(got, exp);

            got = setDomainCatalogs('payload');
            exp = { type: 'SET_DOMAIN_CATALOGS', catalog: 'payload' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('setAppCurrent()', () => {
        const { setAppCurrent } = actions;

        it('should create action', () => {
            let got = setAppCurrent('payload');
            let exp = { type: 'SET_APP_CURRENT', current: 'payload' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('setAppThreads()', () => {
        const { setAppThreads } = actions;

        it('should create action', () => {
            let got = setAppThreads([ 'payload' ]);
            let exp = { type: 'SET_APP_THREADS', apps: [ 'payload' ] };
            assert.deepStrictEqual(got, exp);

            got = setAppThreads('payload');
            exp = { type: 'SET_APP_THREADS', app: 'payload' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('setAppCatalogs()', () => {
        const { setAppCatalogs } = actions;

        it('should create action', () => {
            let got = setAppCatalogs([ 'payload' ]);
            let exp = { type: 'SET_APP_CATALOGS', apps: [ 'payload' ] };
            assert.deepStrictEqual(got, exp);

            got = setAppCatalogs('payload');
            exp = { type: 'SET_APP_CATALOGS', app: 'payload' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('setAppDelreqs()', () => {
        const { setAppDelreqs } = actions;

        it('should create action', () => {
            let got = setAppDelreqs([ 'payload' ]);
            let exp = { type: 'SET_APP_DELREQS', delreqs: [ 'payload' ] };
            assert.deepStrictEqual(got, exp);

            got = setAppDelreqs('payload');
            exp = { type: 'SET_APP_DELREQS', delreq: 'payload' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('setAppWorkers()', () => {
        const { setAppWorkers } = actions;

        it('should create action', () => {
            let got = setAppWorkers({ worker01: 'payload01' });
            let exp = { type: 'SET_APP_WORKERS', worker01: 'payload01' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('clearAppWorkerId()', () => {
        const { clearAppWorkerId } = actions;

        it('should create action', () => {
            let got = clearAppWorkerId('payload');
            let exp = { type: 'CLEAR_APP_WORKER_ID', worker: 'payload' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('setUiThread()', () => {
        const { setUiThread } = actions;

        it('should create action', () => {
            let got = setUiThread('payload');
            let exp = { type: 'SET_UI_THREAD', ui: 'payload' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('setUiPreferences()', () => {
        const { setUiPreferences } = actions;

        it('should create action', () => {
            let got = setUiPreferences('payload');
            let exp = { type: 'SET_UI_PREFERENCES', preferences: 'payload' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('setUiPopups()', () => {
        const { setUiPopups } = actions;

        it('should create action', () => {
            let got = setUiPopups('payload');
            let exp = { type: 'SET_UI_POPUPS', popups: 'payload' };
            assert.deepStrictEqual(got, exp);
        });
    });
});
