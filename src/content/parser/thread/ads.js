'use strict';
import { tagName } from '~/content/util/dom';

export default function parse($body) {
    let top = parseTop($body);
    let underPostForm = parseUnderPostForm($body);
    let onThread = parseOnThread($body);
    let right = parseRight($body);
    let onDelForm = parseOnDelForm($body);
    let bottom = parseBottom($body);

    return { top, underPostForm, onThread, right, onDelForm, bottom };
}

function parseTop($body) {
    let $div = $body.firstElementChild;
    if ($div == null) return null;
    if (tagName($div) !== 'div') return null;

    let $iframe = $div.firstElementChild;
    if ($iframe == null) return null;
    if (tagName($iframe) !== 'iframe') return null;

    return $div.outerHTML;
}

function parseUnderPostForm($body) {
    let $div = $body.querySelector('#fm + div');
    if ($div == null) return null;
    if ($div.style.cssText !== 'width: 728px; margin: 2px auto;') return null;
    return $div.outerHTML;
}

function parseOnThread($body) {
    let $div = $body.querySelector('.tue');
    if ($div == null) return null;
    return $div.innerHTML;
}

function parseRight($body) {
    let $div = $body.querySelector('#rightadfloat');
    if ($div == null) return null;
    return $div.innerHTML;
}

function parseOnDelForm($body) {
    let $div = $body.querySelector('#rightad + hr + div');
    if ($div == null) return null;
    if ($div.style.cssText !== 'width: 728px; height: 90px; margin: 2px auto;') return null;
    return $div.outerHTML;
}

function parseBottom($body) {
    let $div = $body.lastElementChild;
    if ($div == null) return null;
    if ($div.align !== 'center') return null;

    let $iframe = $div.firstElementChild;
    if ($iframe == null) return null;
    if (tagName($iframe) !== 'iframe') return null;

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
