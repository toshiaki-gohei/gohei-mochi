'use strict';
import assert from 'assert';
import parse from '~/content/parser/catalog/ads';
import parseFromString from '~/content/parser/dom-parser';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('parse()', () => {
        it('should parse ads', () => {
            let html = `
<body>
<p id="hdp"></p>
<hr>
<table width="100%"></table>
<table border="1" align="center"></table>
<hr>
<div align="center">
<div>bottom-ad</div>
<iframe></iframe>
<div></div>
<small>credits</small>
</div>
</body>
`;
            let $doc = parseFromString(html, 'text/html');

            let got = parse($doc.body);
            let exp = {
                bottom: '<div>bottom-ad</div><iframe></iframe><div></div>'
            };
            assert.deepStrictEqual(got, exp);
        });

        it('should not throw exception if cannot parse', () => {
            let $doc = parseFromString('<div>unknown format</div>', 'text/html');
            let got = parse($doc.body);
            let exp = {
                bottom: null
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});
