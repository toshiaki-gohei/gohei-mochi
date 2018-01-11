'use strict';
import Post from '../post';
import Changeset from './changeset';
import IdipIndex from './idip-index';
import findQuotedPost from './quote-finder';
import { separate } from '~/common/url';

export {
    Changeset,
    IdipIndex,
    findQuotedPost
};

export function createPosts(posts, threadUrl) {
    return posts.map((post, index) => {
        let id = genPostId(post, threadUrl);
        return new Post({ ...post, id, index });
    });
}

function genPostId(post, threadUrl) {
    let { server, boardKey } = separate(threadUrl);
    let { no } = post;
    return `${server}/${boardKey}/${no}`;
}

export const internal = {
    genPostId
};
