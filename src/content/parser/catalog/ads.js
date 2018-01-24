'use strict';
import { tagName } from '~/content/util/dom';

export default function parse($body) {
    let bottom = parseBottom($body);

    return { bottom };
}

function parseBottom($body) {
    let $div = null;
    for (let $el of $body.children) {
        if (tagName($el) !== 'div') continue;
        if ($el.align !== 'center') continue;
        $div = $el;
        break;
    }

    if ($div == null) return null;

    let ret = '';
    for (let $el of $div.children) {
        switch (tagName($el)) {
        case 'iframe':
        case 'div':
            ret += $el.outerHTML;
            break;
        case 'small':
        default:
            break;
        }
    }

    return ret == '' ? null : ret;
}
