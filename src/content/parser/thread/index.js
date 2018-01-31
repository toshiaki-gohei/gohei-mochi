'use strict';
import parseFromString from '../dom-parser';
import parsePosts from './post';
import parseStaticContents from './static-contents';
import parseAds from './ads';
import { parseTitle } from '../util';
import { parsePostform, parseDelform } from './form';

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
    let posts = parsePosts($body);
    let expire = parseExpire($body);

    let viewer = parseViewer($body);
    let notice = parseNotice($body);
    let warning = parseWarning($body);
    let deletedPostCount = parseDeletedPostCount($body);

    let postform = parsePostform($body);
    let delform = parseDelform($body);

    return {
        thread: {
            title,
            posts,
            expire
        },
        messages: {
            viewer,
            notice, warning, deletedPostCount
        },
        postform,
        delform
    };
}

function parseExpire($body) {
    // could not get $small by #contdisp for document.write('...<span id="contdisp">...');
    // let $small = doc.getElementById('contdisp');
    let $smalls = $body.querySelectorAll('.thre > small');

    let msg = null;
    for (let $small of $smalls) {
        if (/^(.+頃消えます)$/.test($small.textContent)) {
            msg = RegExp.$1;
            break;
        }
    }

    if (msg == null) return null;

    return { message: msg, date: parseExpireDate(msg) };
}

function parseExpireDate(message, now = new Date()) {
    if (!/^(.+)頃消えます$/.test(message)) return null;
    let text = RegExp.$1;

    let year = now.getFullYear(), month = now.getMonth() + 1, date = now.getDate(),
        hour = 0, min = 0;

    if (/(\d+)年/.test(text)) year = 2000 + (+RegExp.$1);
    if (/(\d+)月/.test(text)) [ month, date ] = [ +RegExp.$1, 1 ];
    if (/(\d+)日/.test(text)) date = +RegExp.$1;
    if (/(\d\d):(\d\d)$/.test(text)) [ hour, min ] = [ +RegExp.$1, +RegExp.$2 ];

    let expire = new Date(year, month - 1, date, hour, min);

    if (expire.getTime() >= now.getTime()) return expire;

    if (expire.getDate() < now.getDate()) ++month;

    return new Date(year, month - 1, date, hour, min);
}

function parseViewer($body) {
    let $li = $body.querySelector('.ftbl .chui > ul > li:nth-child(2)');
    if ($li == null) return null;

    if (!/^現在(\d+人くらい)が見てます/.test($li.textContent)) return null;
    let viewer = RegExp.$1;

    return viewer;
}

function parseNotice($body) {
    let $msg = $body.querySelector('.thre > blockquote + font[color="#0000f0"]');
    if ($msg == null) return null;
    return $msg.textContent;
}

function parseWarning($body) {
    let $msg = $body.querySelector('.thre > blockquote + font[color="#f00000"]');
    if ($msg == null) return null;
    return $msg.textContent;
}

function parseDeletedPostCount($body) {
    let $ddnum = $body.querySelector('#ddnum');
    if ($ddnum == null) return null;
    return +$ddnum.textContent;
}

export const internal = {
    parseExpire,
    parseExpireDate,
    parseViewer,
    parseNotice,
    parseWarning,
    parseDeletedPostCount
};
