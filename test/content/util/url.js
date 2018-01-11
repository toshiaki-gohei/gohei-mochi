'use strict';
import assert from 'assert';
import * as util from '~/content/util/url';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('catalogUrl', () => {
        const { catalogUrl } = util;

        it('should return catalog url correctly', () => {
            let url = 'https://may.2chan.net/b/futaba.php?mode=cat';

            assert(catalogUrl(url, 3) === `${url}&sort=3`);
            assert(catalogUrl(url, 9) === `${url}&sort=9&guid=on`);
            assert(catalogUrl(url, 0) === url);
            assert(catalogUrl(url) === url);
        });

        it('should return null if url is null', () => {
            assert(catalogUrl(null) === null);
        });
    });

    describe('cleanCatalogUrl()', () => {
        const { cleanCatalogUrl } = util;

        it('should return clean catalog url', () => {
            let got = cleanCatalogUrl('https://may.2chan.net/b/futaba.php?mode=cat');
            assert(got === 'https://may.2chan.net/b/futaba.php?mode=cat');

            got = cleanCatalogUrl('https://may.2chan.net/b/futaba.php?mode=cat&sort=3');
            assert(got === 'https://may.2chan.net/b/futaba.php?mode=cat');

            got = cleanCatalogUrl('http://may.2chan.net/b/futaba.php?mode=cat&sort=3');
            assert(got === 'http://may.2chan.net/b/futaba.php?mode=cat');
        });

        it('should return null if not catalog url', () => {
            let got = cleanCatalogUrl('https://www.2chan.net');
            assert(got === null);

            cleanCatalogUrl('https://may.2chan.net/b/res/123456789.htm');
            assert(got === null);

            got = cleanCatalogUrl('https://may.2chan.net/b/futaba.php?mode=cataset');
            assert(got === null);

            got = cleanCatalogUrl('https://example.net/b/futaba.php?mode=cat');
            assert(got === null);
        });
    });
});
