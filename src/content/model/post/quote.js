'use strict';
import { BR_TAG } from './index';
import { textify, removeQuoteMark } from '../../util/html';
import { CLASS_NAME as CN } from '../../constants';

export function bundleQuotes(blockquote) {
    let bundle = [];
    let lines = (blockquote || '').split(BR_TAG);

    for (let i = 0, len = lines.length; i < len; ++i) {
        let quote = [];

        while (i < len) {
            let line = lines[i];
            line = line.trim();
            if (!regexpQuote.test(line)) break;
            let quoteLine = RegExp.$1;
            quoteLine = textify(quoteLine);
            quoteLine = removeQuoteMark(quoteLine);
            quote.push(quoteLine);
            ++i;
        }

        if (quote.length === 0) continue;
        bundle.push(quote.join('\n'));
    }

    return bundle;
}

const regexpQuote = new RegExp(`^<span class="${CN.post.QUOTE}">(.+?)</span>$`);
