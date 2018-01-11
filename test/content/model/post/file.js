'use strict';
import assert from 'assert';
import File from '~/content/model/post/file';

describe(__filename, () => {
    describe('construtor()', () => {
        it('should create file', () => {
            let file = new File();
            assert(file);

            assert(file.thumb === null);
        });

        it('should be freeze', () => {
            let file = new File();

            let got = 0;
            try { file.url = 'http://example.net'; } catch (e) {
                assert(e instanceof TypeError);
                ++got;
            }
            try { file.thumb.url = 'http://example.net'; } catch (e) {
                assert(e instanceof TypeError);
                ++got;
            }
            assert(got === 2);
        });

        it('should create file with opts', () => {
            let file = new File({ url: 'http://example.net' });
            assert(file.url === 'http://example.net');
        });

        it('should not set unknown opts', () => {
            let file = new File({ url: 'http://example.net', unknown: true });
            assert('unknown' in file === false);
        });
    });

    describe('object()', () => {
        it('should return object', () => {
            let file = new File({ url: 'file-url' });

            let got = file.object();
            let exp = {
                url: 'file-url', name: null, size: null,
                thumb: null
            };
            assert(got instanceof File === false);
            assert.deepStrictEqual(got, exp);
        });

        it('should handle thumb property correctly', () => {
            let file = new File({ url: 'file-url', thumb: null });

            let got = file.object();
            let exp = {
                url: 'file-url', name: null, size: null,
                thumb: null
            };
            assert.deepEqual(got, exp);

            file = new File({ url: 'file-url', thumb: { url: 'thumb-url' } });

            got = file.object();
            exp = {
                url: 'file-url', name: null, size: null,
                thumb: { url: 'thumb-url', width: null, height: null }
            };
            assert.deepStrictEqual(got, exp);
            assert(got.thumb !== file.thumb);
        });
    });
});
