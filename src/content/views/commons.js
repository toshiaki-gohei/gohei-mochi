'use strict';
import { separate } from '~/common/url';

export function nav({ url }) {
    let { protocol, hostname } = new window.URL(url);
    let { boardKey } = separate(url);

    let homeUrl = `${protocol}//www.2chan.net/`;
    let boardUrl = `${protocol}//${hostname}/${boardKey}/futaba.htm`;

    return `
<nav class="gohei-header-nav">
[<a href="${boardUrl}">掲示板に戻る</a>]
[<a href="${homeUrl}">ホーム</a>]
</nav>
`.replace(/\n/g, '');
}

export function footer() {
    return`<footer class="gohei-footer">
<div class="gohei-credits">- <a href="http://php.s3.to" rel="external">GazouBBS</a> + <a href="https://www.2chan.net/">futaba</a> / <a href="https://toshiaki-gohei.github.io/gohei-mochi/" rel="external">gohei-mochi</a> -</div>
</footer>`;
}
