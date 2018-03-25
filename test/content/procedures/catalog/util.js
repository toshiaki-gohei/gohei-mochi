'use strict';
import assert from 'assert';
import { contains } from '~/content/procedures/catalog/util';

describe(__filename, () => {
    describe('contains()', () => {
        const urls = [
            'http://example.net/thread00',
            'http://example.net/thread01',
            'http://example.net/thread02'
        ];

        it('should return true if contains url', () => {
            let url = 'http://example.net/thread01';
            let got = contains(url, urls);
            assert(got === true);
        });

        it('should return false if dose not contain url', () => {
            let url = 'http://example.net/thread10';
            let got = contains(url, urls);
            assert(got === false);
        });
    });
});
