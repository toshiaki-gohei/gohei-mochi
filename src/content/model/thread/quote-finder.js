'use strict';
import { escapeRegExp } from '../../util/html';

export default function findQuotedPost(posts, quotePost) {
    let quotedPost = null;

    quotedPost = findPostByFullMatch(posts, quotePost);
    if (quotedPost != null) return quotedPost;

    quotedPost = findPostByBeginningOfLineMatch(posts, quotePost);
    if (quotedPost != null) return quotedPost;

    quotedPost = findPostByNo(posts, quotePost);
    if (quotedPost != null) return quotedPost;

    quotedPost = findPostByFilename(posts, quotePost);
    if (quotedPost != null) return quotedPost;

    quotedPost = findPostByMatch(posts, quotePost);

    return quotedPost;
}

function findPostByFullMatch(posts, { index, quote }) {
    let start = index - 1;
    let post = posts[index];
    let fullQuote = post.quote(quote);

    for (let i = start; i >= 0; --i) {
        let post = posts[i];
        let text = post.text();
        if (text === fullQuote) return post;
    }

    return null;
}

function findPostByBeginningOfLineMatch(posts, { index, quote }) {
    let start = index - 1;
    let pattern = new RegExp(`^${escapeRegExp(quote)}`);

    for (let i = start; i >= 0; --i) {
        let post = posts[i];
        let text = post.text();

        for (let line of text.split('\n')) {
            if (pattern.test(line)) return post;
        }
    }

    return null;
}

function findPostByMatch(posts, { index, quote }) {
    let start = index - 1;
    let pattern = new RegExp(`${escapeRegExp(quote)}`);

    for (let i = start; i >= 0; --i) {
        let post = posts[i];
        let text = post.text();
        if (pattern.test(text)) return post;
    }

    return null;
}

function findPostByNo(posts, { index, quote }) {
    let no;
    switch (true) {
    case /No\.(\d+)/.test(quote):
    case /^ ?(\d+)/.test(quote):
        no = RegExp.$1;
        break;
    default:
        return null;
    }

    let start = index - 1;

    for (let i = start; i >= 0; --i) {
        let post = posts[i];
        if (post.no === no) return post;
    }

    return null;
}

function findPostByFilename(posts, { index, quote }) {
    if (!/(\d+\.\w+)/.test(quote)) return null;
    let filename = RegExp.$1;
    let start = index - 1;

    for (let i = start; i >= 0; --i) {
        let post = posts[i];
        if (post.file == null) continue;
        if (post.file.name === filename) return post;
    }

    return null;
}

export const internal = {
    findPostByFullMatch,
    findPostByBeginningOfLineMatch,
    findPostByMatch,
    findPostByNo,
    findPostByFilename
};
