'use strict';
import parseFromString from '../dom-parser';
import parseAds from './ads';
import { parseTitle } from '../util';
import { tagName } from '~/content/util/dom';

export default {
    parseAll,
    parse
};

export function parseAll(htmlString) {
    let $doc = parseFromString(htmlString, 'text/html');
    let $body = $doc.body;

    let contents = parse($body);
    let staticContents = parseStaticContents($body);
    let ads = parseAds($body);

    return { ...contents, ...staticContents, ads };
}

export function parse($body) {
    if (typeof $body === 'string') {
        let $doc = parseFromString($body, 'text/html');
        $body = $doc.body;
    }

    let title = parseTitle($body);
    let threads = parseThreads($body);

    return {
        catalog: {
            title,
            threads
        }
    };
}

function parseStaticContents($body) {
    let title = parseTitle($body);
    return { title };
}

function parseThreads($body) {
    let $tables = $body.querySelectorAll('body > table');
    let $table = $tables[1];

    if ($table == null) return [];

    let $rows = $table.querySelectorAll('tr');

    let threads = [];
    let rownum = 0, colnum = 0;
    for (let $tr of $rows) {
        ++rownum;
        for (let $td of $tr.children) {
            ++colnum;
            let t = parseThread($td);

            if (t == null) {
                if (process.env.NODE_ENV === 'development') {
                    // eslint-disable-next-line no-console
                    console.error(`could not parse td (colnum: ${colnum}, rownum: ${rownum})`);
                }
                continue;
            }

            threads.push(t);
        }
    }

    return threads;
}

function parseThread($td) {
    if ($td == null) return null;

    let $children = $td.children;
    let $a, $small, $font;

    switch ($children.length) {
    case 5:
        [ $a, , $small, , $font ] = $children;
        break;
    case 3: // no thumb or img-server
        [ $a, , $font ] = $children;
        $small = $a.children[0];
        if (tagName($small) !== 'small') $small = null;
        break;
    default:
        return null;
    }

    if ($a == null || $a.href == null) return null;
    if ($font == null) return null;

    let url = $a.href;
    let title = $small ? $small.textContent : null;
    let thumb = parseThumb($a);
    let postnum = +$font.textContent;

    return { url, title, postnum, thumb };
}

function parseThumb($anchor) {
    if ($anchor == null) return null;

    let $img = $anchor.children[0];
    if ($img == null) return null;
    if (tagName($img) !== 'img') return null;

    let { src: url, width, height } = $img;

    return { url, width, height };
}

export const internal = {
    parseThreads,
    parseThread,
    parseThumb
};
