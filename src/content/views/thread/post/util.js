'use strict';
import { CLASS_NAME as CN } from '~/content/constants';
import { BR_TAG } from '~/content/model/post';

export function replaceNoWithNoQuote(bq) {
    if (bq == null) return bq;
    if (!/No\.\d+/.test(bq)) return bq;

    let lines = bq.split(BR_TAG);
    for (let i = 0, len = lines.length; i < len; ++i) {
        let line = lines[i];
        if (/^<span class="gohei-/.test(line)) continue;
        lines[i] = line.replace(/No\.\d+/g, toQuoteNo);
    }

    return lines.join(BR_TAG);
}

function toQuoteNo(matched) {
    return `<span class="${CN.post.QUOTE}">${matched}</span>`;
}

const c1 = 'a-zA-Z0-9-.'; //domain
const c2 = '-_.!~*\'()a-zA-Z0-9;/?:@&=+\\$,%#'; // url
const URL_CHECK = new RegExp(`h?t?tps?://[${c1}]+`);
const URL_REGEXP = new RegExp(`h?t?tps?://[${c2}]+`, 'g');

export function replaceLink(bq) {
    if (bq == null) return bq;
    if (!URL_CHECK.test(bq)) return bq;
    return bq.replace(URL_REGEXP, toAnchor);
}

function toAnchor(matched) {
    let url = matched.replace(/^h?t?tps?:/, '');
    if (/^h?t?tps:/.test(matched)) url = `https:${url}`;
    if (/^h?t?tp:/.test(matched)) url = `http:${url}`;

    return `<a href="${url}" rel="noreferrer">${matched}</a>`;
}
