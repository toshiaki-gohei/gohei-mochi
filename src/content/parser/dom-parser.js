'use strict';

export default function parseFromString(htmlString, type = 'text/html') {
    const parser = new window.DOMParser();
    return parser.parseFromString(htmlString, type);
}
