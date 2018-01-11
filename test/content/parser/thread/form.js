'use strict';
import assert from 'assert';
import { parsePostform, parseDelform } from '~/content/parser/thread/form';
import parseFromString from '~/content/parser/dom-parser';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('parsePostform()', () => {
        it('should parse postform', () => {
            let html = `
<form action="/b/futaba.php?guid=on" method="POST" enctype="multipart/form-data" id="fm">
<input name="mode" value="regist" type="hidden">
<input name="MAX_FILE_SIZE" value="2048000" type="hidden">
<input id="baseform" name="baseform" value="" type="hidden">
<input id="pthb" name="pthb" value="" type="hidden">
<input id="pthc" name="pthc" value="" type="hidden">
<input id="pthd" name="pthd" value="" type="hidden">
<input id="ptua" name="ptua" value="ptua-value" type="hidden">
<input id="flrv" name="flrv" value="" type="hidden">
<input id="flvv" name="flvv" value="" type="hidden">
<input id="scsz" name="scsz" value="" type="hidden">
<input id="hash" name="hash" value="hash-value" type="hidden">
<input id="js" name="js" value="js-value" type="hidden">
<input name="resto" value="resto-value" type="hidden">
<table class="ftbl" id="ftbl">
<tbody>
<tr><td>おなまえ</td><td><input name="name" size="28" type="text"></td></tr>
<tr><td>ignore</td><td><input name="hidden-in-table" size="28" type="text"></td></tr>
</tbody>
</table>
<table class="ftbl">
<tbody><tr><td colspan="2" class="chui"></td></tr></tbody>
</table>
</form>
`;
            let $doc = parseFromString(html, 'text/html');

            let form = parsePostform($doc.body);

            let got = Object.keys(form).sort();
            let exp = [ 'action', 'hiddens' ].sort();
            assert.deepStrictEqual(got, exp);

            got = form.action;
            assert(got != null); // different values on browsers

            got = form.hiddens;
            exp = [
                { name: 'mode', value: 'regist' },
                { name: 'MAX_FILE_SIZE', value: '2048000' },
                { name: 'baseform', value: '' },
                { name: 'pthb', value: '' },
                { name: 'pthc', value: '' },
                { name: 'pthd', value: '' },
                { name: 'ptua', value: 'ptua-value' },
                { name: 'flrv', value: '' },
                { name: 'flvv', value: '' },
                { name: 'scsz', value: '' },
                { name: 'hash', value: 'hash-value' },
                { name: 'js', value: 'js-value' },
                { name: 'resto', value: 'resto-value' }
            ];
            assert.deepStrictEqual(got, exp);
        });

        it('should return null if cannot parse', () => {
            let $doc = parseFromString('<div>unknown format</div>', 'text/html');
            let got = parsePostform($doc.body);
            assert(got == null);
        });
    });

    describe('parseDelform()', () => {
        it('should parse delform', () => {
            let html = `
<body>
<hr>
<table></table>
<form action="/b/futaba.php?guid=on" method="POST" enctype="multipart/form-data" id="fm">
</form>
<div></div>
<hr>
<form action="/b/futaba.php?guid=on" method="POST"></form>
</body>`;

            let $doc = parseFromString(html, 'text/html');

            let form = parseDelform($doc.body);
            let got = form.action;
            assert(got != null); // different values on browsers
        });

        it('should return null if cannot parse', () => {
            let $doc = parseFromString('<div>unknown format</div>', 'text/html');
            let got = parseDelform($doc.body);
            assert(got == null);
        });
    });
});
