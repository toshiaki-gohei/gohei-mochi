'use strict';
import assert from 'assert';
import * as util from '~/content/parser/util';
import parseFromString from '~/content/parser/dom-parser';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('parseTitle()', () => {
        const { parseTitle } = util;

        it('should parse title', () => {
            let html = `
<div></div>
<p id="hdp">
<span id="tit">タイトル</span>
<span id="hml">[<a href="//example.net/" target="_top">ホーム</a>]</span>
</p>
<hr>
`;
            let $doc = parseFromString(html, 'text/html');

            let got = parseTitle($doc.body);
            let exp = 'タイトル';
            assert(got === exp);
        });

        it('should return null if title does not exist', () => {
            let html = '<div></div>';
            let $doc = parseFromString(html, 'text/html');
            let got = parseTitle($doc.body);
            assert(got === null);
        });
    });
});
