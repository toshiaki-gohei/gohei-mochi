'use strict';
import assert from 'assert';
import LocalStorage from '~/content/util/local-storage';
import { setup, teardown, isBrowser } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let storage;
    beforeEach(() => storage = new LocalStorage());
    afterEach(() => window.localStorage.clear());

    describe('constructor()', () => {
        it('should create local storage', () => {
            assert(storage);
            assert(storage.isAvailable === true);
        });
    });

    describe('get()', () => {
        it('should get value', () => {
            window.localStorage.setItem('foo', 'bar');
            let got = storage.get('foo');
            assert(got === 'bar');

            got = storage.get('not exist');
            assert(got === null);
        });
    });

    describe('set()', () => {
        it('should set value', () => {
            storage.set('foo', 'bar');
            let got = window.localStorage.getItem('foo');
            assert(got === 'bar');
        });
    });

    describe('delete()', () => {
        it('should delete value', () => {
            storage.set('foo', 'bar');
            storage.delete('foo');
            let got = storage.get('foo');
            assert(got === null);

            storage.delete('not exist');
        });
    });

    describe('clear()', () => {
        it('should clear storage', () => {
            storage.set('foo', 'bar');
            storage.clear();
            let got = storage.get('foo');
            assert(got === null);

            storage.clear();
        });
    });
});

(isBrowser ? describe.skip : describe)(`${__filename}: enviroment that localStorage is not available`, () => {
    let storage;
    beforeEach(() => storage = new LocalStorage());

    describe('constructor()', () => {
        it('should not throw exception if create local storage', () => {
            assert(storage);
            assert(storage.isAvailable === false);
        });
    });

    describe('get()', () => {
        it('should not throw exception if get value', () => {
            let got = storage.get('foo');
            assert(got === null);
        });
    });

    describe('set()', () => {
        it('should not throw exception if set value', () => {
            storage.set('foo', 'bar');
            let got = storage.get('foo');
            assert(got === null);
        });
    });

});
