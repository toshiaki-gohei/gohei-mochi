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

const C1 = 'a-zA-Z0-9-.'; //domain
const C2 = '-_.!~*\'()a-zA-Z0-9;/?:@&=+\\$,%#'; // url
const URL_CHECK = new RegExp(`h?t?tps?://[${C1}]+`);
const URL_REGEXP = new RegExp(`h?t?tps?://[${C2}]+`, 'g');

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

const SIOKARA = '(?:su|ss|sa|sp|sq|sz)\\d+\\.\\w+';
const SIOKARA_CHECK = new RegExp(SIOKARA);
const SIOKARA_REGEXP = new RegExp(`[${C2}]*${SIOKARA}`, 'g');
const SIOKARA_REGEXP2 = new RegExp(`([${C2}]*)(${SIOKARA})`);
const SIOKARA_IGNORE = new RegExp(`http://www\\.nijibox\\d\\.com/futabafiles/\\w+/src/${SIOKARA}`);

export function replaceSiokaraLink(bq) {
    if (bq == null) return bq;
    if (!SIOKARA_CHECK.test(bq)) return bq;
    return bq.replace(SIOKARA_REGEXP, toSiokaraAnchor);
}

function toSiokaraAnchor(matched) {
    if (SIOKARA_IGNORE.test(matched)) return matched;

    let [ , text, filename ] = matched.match(SIOKARA_REGEXP2);

    let url = getSiokaraUrl(filename);
    if (url == null) return matched;

    return `${text}<a href="${url}" rel="noreferrer">${filename}</a>`;
}

function getSiokaraUrl(filename) {
    let prefix = filename.substr(0, 2);

    switch (prefix) {
    case 'su':
        return `http://www.nijibox5.com/futabafiles/tubu/src/${filename}`;
    case 'ss':
        return `http://www.nijibox5.com/futabafiles/kobin/src/${filename}`;
    case 'sa':
        return `http://www.nijibox6.com/futabafiles/001/src/${filename}`;
    case 'sp':
        return `http://www.nijibox2.com/futabafiles/003/src/${filename}`;
    case 'sq':
        return `http://www.nijibox6.com/futabafiles/mid/src/${filename}`;
    default:
        return null;
    }
}
