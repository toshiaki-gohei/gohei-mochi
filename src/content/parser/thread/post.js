'use strict';
import { CLASS_NAME as CN } from '../../constants';
import { PROPS, STATE, BR_TAG } from '../../model/post';
import { removeTagsSimply } from '../../util/html';

export default function parsePosts($body) {
    let op = parseOriginalPost($body);
    if (op == null) return [];

    let replies = parseReplies($body);
    let posts = [ op ].concat(replies);

    return posts;
}

function parseReplies($body) {
    let replies = [];

    let $tables = $body.querySelectorAll('.thre > table');

    for (let i = 0, len = $tables.length; i < len; ++i) {
        let reply = parseReply($tables[i]);
        if (reply == null) continue;
        replies.push(reply);
    }

    return replies;
}

function parseReply($table) {
    let $rtd = $table.getElementsByClassName('rtd')[0];
    let html = $rtd == null ? '' : $rtd.innerHTML;

    let raw = divide(html);
    let reply = parse(raw);

    return reply;
}

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

function parseOriginalPost($body) {
    let $thre = $body.getElementsByClassName('thre')[0];
    if ($thre == null) return null;

    let html = '';
    for (let $node of $thre.childNodes) {
        let node;
        if ($node.nodeType === TEXT_NODE)  node = $node.textContent;
        if ($node.nodeType === ELEMENT_NODE) node = $node.outerHTML;

        if (node == null) continue;
        if (/(?:<table|<div style="clear)/.test(node)) break;

        html += node;
    }

    let raw = divideOP(html);
    let op = parse(raw);

    return op;
}

function divide(html) {
    let header = null, body = null, fileH = null, fileT = null;

    if (/^([\s\S]+?<br>)([\s\S]+?<br>)(<a [\s\S]+<\/a>)(<blockquote[\s\S]+)$/.test(html)) {
        header = RegExp.$1;
        fileH = RegExp.$2;
        fileT = RegExp.$3;
        body = RegExp.$4;
    } else if (/^([\s\S]+?)(<blockquote[\s\S]+)$/.test(html)) {
        header = RegExp.$1;
        body = RegExp.$2;
    }

    return { header, body, fileH, fileT };
}

function divideOP(html) {
    let header = null, body = null, fileH = null, fileT = null;

    if (/^([\s\S]+?<br>)(<a [\s\S]+?<\/a>)([\s\S]+?)(<blockquote[\s\S]+)$/.test(html)) {
        fileH = RegExp.$1;
        fileT = RegExp.$2;
        header = RegExp.$3;
        body = RegExp.$4;
    } else if (/^([\s\S]+?)(<blockquote[\s\S]+)$/.test(html)) {
        header = RegExp.$1;
        body = RegExp.$2;
    }

    return { header, body, fileH, fileT };
}

function parse({ header, body, fileH, fileT }) {
    let post = create();

    let h = parseHeader(header);
    for (let key in h) post[key] = h[key];

    post.file = parseFile(fileH, fileT);

    let blockquote = parseBlockquote(body);
    post.raw = { header, body, fileH, fileT, blockquote };

    post.state = parseState(post.raw.body);

    return post;
}

function parseHeader(header) {
    let subject, name, mailto, date, no, userId, userIp, del, sod;
    subject = name = mailto = date = no = userId = userIp = del = sod = null;

    header = header ? header.replace(/\n/g, '') : '';

    // e.g. <font></font> Name <font></font> 17/01/01(日)01:23:45 ID:XXX No.123
    if (/<font.*?>(.+?)<\/font>.*?<font.*?>(.+?)<\/font>/.test(header)) {
        subject = RegExp.$1;
        name = RegExp.$2;
    }

    if (/<a href="mailto:(.+?)">/.test(name)) mailto = RegExp.$1;

    if (subject) subject = removeTagsSimply(subject).trim();
    if (name) name = removeTagsSimply(name).trim();

    let dateNo = '';
    if (/<\/font>.+?<\/font>(.+?)<a/.test(header)) {
        dateNo = RegExp.$1;
    } else if (/<input (?=.*type="checkbox").*?>(.+?)<a/.test(header)) {
        dateNo = RegExp.$1; // img-server
    }

    if (/(\d\d\/\d\d\/\d\d\(.+?\)\d\d:\d\d:\d\d)/.test(dateNo)) {
        date = RegExp.$1;
    }
    if (/ No\.(\d+)/.test(dateNo)) no = RegExp.$1;
    if (/ ID:(.+?) /.test(dateNo)) userId = RegExp.$1;
    if (/ IP:(.+?) /.test(dateNo)) userIp = RegExp.$1;

    if (/<a .*?class="del".*?>(.+?)<\/a>/.test(header)) del = RegExp.$1;
    if (/<a .*?class="sod".*?>(.+?)<\/a>/.test(header)) sod = parseSoudane(RegExp.$1);

    return { subject, name, mailto, date, no, userId, userIp, del, sod };
}

function parseBlockquote(body) {
    if (!/<blockquote.*?>([\s\S]+?)<\/blockquote>/.test(body)) return null;
    let blockquote = RegExp.$1;

    let bqlines = blockquote.split('<br>');
    let lines = [];

    for (let line of bqlines) {
        // collapse sequences of whitespace for display blockquote with { white-space: normal; }
        line = collapseWhitespaces(line);

        line = parseLine(line);
        lines.push(line);
    }

    return lines.join(BR_TAG);
}

function collapseWhitespaces(line) {
    if (line == null) return line;
    return line.replace(/ +/g, ' ');
}

function parseLine(line) {
    let dm = parseDeleteMessage(line);
    if (dm != null) return dm;

    let ql = parseQuoteLine(line);
    if (ql != null) return ql;

    line = parseLineWithFont(line);
    return line;
}

function parseDeleteMessage(line) {
    switch (line) {
    case '<font color="#ff0000">書き込みをした人によって削除されました</font>':
        return `<span class="${CN.post.DELETE}">書き込みをした人によって削除されました</span>`;
    case '<font color="#ff0000">スレッドを立てた人によって削除されました</font>':
        return `<span class="${CN.post.DELETE}">スレッドを立てた人によって削除されました</span>`;
    case '<font color="#ff0000"><b>なー</b></font>':
        return `<span class="${CN.post.DELETE_NA}">なー</span>`;
    default:
        return null;
    }
}

function parseQuoteLine(line) {
    if (!/^<font color="#789922">(.+?)<\/font>$/.test(line)) return null;
    return `<span class="${CN.post.QUOTE}">${RegExp.$1}</span>`;
}

function parseLineWithFont(line) {
    if (line == null) return line;

    // [・3・], dice
    return line.replace(/<font color="(.+?)">(.+?)<\/font>/g,
                        '<span style="color: $1;">$2</span>');
}

function parseState(body) {
    switch (true) {
    case /<blockquote><font color="#ff0000">書き込みをした人によって削除されました<\/font>/.test(body):
        return STATE.DELETE_BY_WRITER;
    case /<blockquote><font color="#ff0000">スレッドを立てた人によって削除されました<\/font>/.test(body):
        return STATE.DELETE_BY_THREAKI;
    case /<blockquote><font color="#ff0000"><b>なー<\/b><\/font>/.test(body):
        return STATE.DELETE_BY_DELETER;
    default:
        return null;
    }
}

function parseSoudane(sod) {
    if (sod == null) return null;
    if (sod === '+') return 0;
    if (/そうだねx(\d+)/.test(sod)) return +RegExp.$1;
    return null;
}

function parseFile(fileH, fileT) {
    let name, url, size, thumb;
    name = url = size = thumb = null;

    if (/<a href="(.+?)".+?>(.+?)<\/a>-\((\d+) B\)/.test(fileH)) {
        url = RegExp.$1;
        name = RegExp.$2;
        size = +RegExp.$3;
    }

    if (url == null || name == null) return null;

    if (/<img src="(.+?)" (.+?)>/.test(fileT)) {
        let thumbUrl = RegExp.$1;
        let attrs = RegExp.$2;

        let [ , w ] = attrs.match(/width="(\d+)"/);
        let [ , h ] = attrs.match(/height="(\d+)/);

        thumb = { url: thumbUrl, width: +w, height: +h };
    }

    return { url, name, size, thumb };
}

function create() {
    let post = {};
    for (let prop of PROPS) post[prop] = null;
    post.raw = {};

    Object.seal(post);

    return post;
}

export const internal = {
    parseReply,
    parseOriginalPost,
    parseHeader,
    parseBlockquote,
    parseQuoteLine,
    parseLineWithFont,
    parseState,
    parseSoudane,
    parseFile,
    create
};
