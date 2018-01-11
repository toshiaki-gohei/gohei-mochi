'use strict';

export function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
}

export function textify(htmlString) {
    let text = removeTagsSimply(htmlString);
    text = unescape(text);
    return text;
}

export function removeTagsSimply(htmlString) {
    return htmlString.replace(/<.+?>/g, '');
}

const escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#x27;',
    '`': '&#x60;'
};
const unescapeMap = (() => {
    let map = {};
    for (let key in escapeMap) map[escapeMap[key]] = key;
    return map;
})();
function converter(map) {
    let pattern = `(?:${Object.keys(map).join('|')})`;
    let tRegExp = new RegExp(pattern);
    let rRegExp = new RegExp(pattern, 'g');
    let fn = match => map[match];
    return (str = '') => { return tRegExp.test(str) ? str.replace(rRegExp, fn) : str; };
}
export const escape = converter(escapeMap);
export const unescape = converter(unescapeMap);

export function removeQuoteMark(quoteLine) {
    let ql = quoteLine;
    ql = /^> \S/.test(ql) ? ql.replace(/^> /, '') : ql.replace(/^>/, '');
    return ql;
}
