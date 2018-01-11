'use strict';
import assert from 'assert';
import * as commons from '~/content/views/commons';
import { setup, teardown } from '@/support/dom';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    describe('nav()', () => {
        const { nav } = commons;

        it('should return catalog nav', () => {
            let url = 'https://may.2chan.net/b/futaba.php?mode=cat&sort=3';

            let got = nav({ url });
            let exp = `
<nav class="gohei-header-nav">
[<a href="https://may.2chan.net/b/futaba.htm">掲示板に戻る</a>]
[<a href="https://www.2chan.net/">ホーム</a>]
</nav>
`.replace(/\n/g, '');
            assert(got === exp);
        });

        it('should return thread nav', () => {
            let url = 'https://may.2chan.net/b/res/123456789.htm';

            let got = nav({ url });
            let exp = `
<nav class="gohei-header-nav">
[<a href="https://may.2chan.net/b/futaba.htm">掲示板に戻る</a>]
[<a href="https://www.2chan.net/">ホーム</a>]
</nav>
`.replace(/\n/g, '');
            assert(got === exp);
        });
    });

    describe('footer()', () => {
        const { footer } = commons;

        it('should return footer', () => {
            let got = footer();
            let exp = `<footer class="gohei-footer">
<div class="gohei-credits">- <a href="http://php.s3.to" rel="external">GazouBBS</a> + <a href="https://www.2chan.net/">futaba</a> / <a href="https://toshiaki-gohei.github.io/gohei-mochi/" rel="external">gohei-mochi</a> -</div>
</footer>`;
            assert(got === exp);
        });
    });
});
