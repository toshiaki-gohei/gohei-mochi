'use strict';
import assert from 'assert';
import FormData, { internal } from '~/content/util/form-data';
import { setup, teardown } from '@/support/dom';
import { decode } from '~/content/util/encoding';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('constructor()', () => {
        it('should create form-data', () => {
            let fd = new FormData();
            assert(fd);
            assert.deepStrictEqual(fd._entries, []);
        });
    });

    describe('makeEntry()', () => {
        const { makeEntry } = internal;

        it('should make entry if pass file', () => {
            let file = new window.File([], 'test.txt');
            let got = makeEntry('file', file, 'test.txt');
            let exp = { name: 'file', value: file, filename: 'test.txt' };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('append()', () => {
        it('should append', () => {
            let fd = new FormData();
            fd.append('foo', 'bar');

            let got = fd._entries;
            let exp = [ { name: 'foo', value: 'bar', filename: null } ];
            assert.deepStrictEqual(got, exp);

            fd.append('foo', 'bar');
            got = fd._entries;
            exp = [
                { name: 'foo', value: 'bar', filename: null },
                { name: 'foo', value: 'bar', filename: null }
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should not append if name is null', () => {
            let fd = new FormData();
            fd.append(null, 'hoge');
            assert.deepStrictEqual(fd._entries, []);
        });
    });

    describe('get()', () => {
        it('should get', () => {
            let fd = new FormData();
            fd.append('foo', 'bar1');
            fd.append('foo', 'bar2');

            let got = fd.get('foo');
            assert(got === 'bar1');
        });

        it('should return undefined', () => {
            let fd = new FormData();
            fd.append('foo', 'bar1');
            fd.append('foo', 'bar2');

            let got = fd.get('hoge');
            assert(got === undefined);
        });
    });

    describe('set()', () => {
        it('should set', () => {
            let fd = new FormData();
            fd.set('foo', 'bar');

            let got = fd._entries;
            let exp = [ { name: 'foo', value: 'bar', filename: null } ];
            assert.deepStrictEqual(got, exp);
        });

        it('should remove othre same entries', () => {
            let fd = new FormData();
            fd.append('foo', 'bar');
            fd.append('hoge', 'hogehoge');
            fd.append('foo', 'bar');

            let got = fd._entries;
            let exp = [
                { name: 'foo', value: 'bar', filename: null },
                { name: 'hoge', value: 'hogehoge', filename: null },
                { name: 'foo', value: 'bar', filename: null }
            ];

            fd.set('foo', 'changed');
            got = fd._entries;
            exp = [
                { name: 'foo', value: 'changed', filename: null },
                { name: 'hoge', value: 'hogehoge', filename: null }
            ];
            assert.deepStrictEqual(got, exp);
        });


        it('should not set if name is null', () => {
            let fd = new FormData();
            fd.set(null, 'hoge');
            assert.deepStrictEqual(fd._entries, []);
        });
    });

    describe('_initEntries()', () => {
        it('should initialize entries', () => {
            document.body.innerHTML = `
<form id="form">
<input type="text" name="t" value="foo">
<input type="hidden" name="h" value="bar">
<input type="checkbox" name="c" value="on" checked>
</form>
`.replace(/\n/g, '');

            let fd = new FormData();
            fd._initEntries(document.getElementById('form'));

            let got = fd._entries;
            let exp = [
                { name: 't', value: 'foo', filename: null },
                { name: 'h', value: 'bar', filename: null },
                { name: 'c', value: 'on', filename: null }
            ];
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('_makePart()', () => {
        const fd = new FormData();
        fd._boundary = '--';

        it('should make part', () => {
            let got = fd._makePart('test', 'ascii').join('');
            let exp = `\
----
Content-Disposition: form-data; name="test"

ascii
`.replace(/\n/g, '\r\n');
            assert(got === exp);
        });

        it('should make part of none ascii', () => {
            const body = new Uint8Array([0x83, 0x65, 0x83, 0x58, 0x83, 0x67]); // テスト of sjis

            let got = fd._makePart('test', 'テスト');
            let exp = [
                '----\r\n',
                'Content-Disposition: form-data; name="test"\r\n',
                'Content-Type: text/plain; charset=Shift_JIS\r\n',
                '\r\n',
                body, '\r\n'
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should make part if value is number', () => {
            let got = fd._makePart('num', 10).join('');
            let exp = `\
----
Content-Disposition: form-data; name="num"

10
`.replace(/\n/g, '\r\n');
            assert(got === exp);
        });

        it('should make part of file', () => {
            let file = new window.File([], 'unused.txt', { type: 'text/plain' });

            let got = fd._makePart('test', file, 'test.txt');
            let exp = [
                '----\r\n',
                'Content-Disposition: form-data; name="test"; filename="test.txt"\r\n',
                'Content-Type: text/plain\r\n',
                '\r\n',
                file, '\r\n'
            ];
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('genBoundary()', () => {
        const { genBoundary } = internal;

        it('should generate boundary', () => {
            let got = genBoundary();
            let exp = /^----------gohei-mochi-[a-z0-9]{16}$/;
            assert(exp.test(got));
            assert(got.length === 38);
        });
    });

    describe('filter()', () => {
        const { filter } = internal;

        it('should filter correctly', () => {
            document.body.innerHTML = `
<form id="form">
<input type="text" name="text1" value="TEXT">
<input type="text" name="text2" value="ignored" disabled>

<input type="button" name="button1" value="ignored">

<input type="hidden" name="hidden1">

<input type="checkbox" name="checkbox1">
<input type="checkbox" name="checkbox2" checked>
<input type="checkbox" name="checkbox3" checked disabled>

<input type="radio" name="radio1">
<input type="radio" name="radio2" checked>
<input type="radio" name="radio3" checked disabled>

<input type="file" name="file1">

<input type="text" name="" value="no-name">

<select name="select1">
<option>option1</option>
</select>

<textarea name="textarea1">text area</textarea>
</form>
`.replace(/\n/g, '');

            let $controls = filter(document.getElementById('form'));
            let got = $controls.map($el => $el.name);
            let exp = [
                'text1',
                'hidden1',
                'checkbox2',
                'radio2',
                'file1',
                'select1',
                'textarea1'
            ];
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('headers', () => {
        it('should return headers', () => {
            let fd = new FormData();
            fd._boundary = '--';

            let got = fd.headers;
            let exp = {
                method: 'post',
                'content-type': 'multipart/form-data; boundary=--'
            };
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('entries()', () => {
        it('should return entries', () => {
            document.body.innerHTML = `
<form id="form">
<input type="text" name="t" value="foo">
<input type="hidden" name="h" value="bar">
<input type="checkbox" name="c" value="on" checked>
</form>
`.replace(/\n/g, '');

            let fd = new FormData();
            fd._initEntries(document.getElementById('form'));

            let got = fd.entries();
            let exp = [
                [ 't', 'foo' ], [ 'h', 'bar' ], [ 'c', 'on' ]
            ];
            assert.deepStrictEqual(got, exp);
        });
    });

    describe('blobify()', () => {
        it('should return blob', () => {
            let fd = new FormData();
            fd._boundary = '--';
            fd.append('test', 'テスト');

            let blob = fd.blobify();

            return new Promise(resolve => {
                let reader = new window.FileReader();
                reader.addEventListener('loadend', () => {
                    let arrBuf = reader.result;
                    resolve(Buffer.from(arrBuf));
                });
                reader.readAsArrayBuffer(blob);
            }).then(buffer => {
                let got = decode(buffer);
                let exp = `\
----
Content-Disposition: form-data; name="test"
Content-Type: text/plain; charset=Shift_JIS

テスト
------
`.replace(/\n/g, '\r\n');
                assert(got === exp);
            });
        });
    });
});
