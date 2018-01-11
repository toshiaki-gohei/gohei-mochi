'use strict';
import { parseTitle } from '../util';

export default function parse($body) {
    let title = parseTitle($body);
    let notice = parseNotice($body);

    return { title, notice };
}

function parseNotice($body) {
    let $list = $body.querySelectorAll('.chui > ul > li');
    if ($list == null) return null;

    let raw = [];
    for (let $li of $list) {
        raw.push($li.innerHTML);
    }

    return { raw };
}

export const internal = {
    parseNotice
};
