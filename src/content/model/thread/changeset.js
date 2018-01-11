'use strict';

export default class Changeset {
    constructor({ changes, ...opts } = {}) {
        let { newPostsCount, exposedIdPosts, exposedIpPosts, deletedPosts } = opts || {};

        this.newPostsCount = newPostsCount || 0;
        this.exposedIdPosts = exposedIdPosts || [];
        this.exposedIpPosts = exposedIpPosts || [];
        this.deletedPosts = deletedPosts || [];

        this._init(changes);

        Object.seal(this);
    }

    _init(changes = []) {
        for (let change of changes) {
            if (change == null) continue; // e.g. when soudane increased

            let { index, no, userId, userIp, state } = change;
            let post = { index, no, userId, userIp };

            if (userId != null) this.exposedIdPosts.push(post);
            if (userIp != null) this.exposedIpPosts.push(post);
            if (state != null) this.deletedPosts.push(post);
        }
    }

    countExposedIds() {
        let posts = this.exposedIdPosts;
        if (posts.length === 0) return null;

        let counts = posts.reduce((counts, post) => {
            let { userId } = post;
            if (counts[userId] == null) counts[userId] = 0;
            counts[userId] += 1;
            return counts;
        }, {});

        return counts;
    }

    countExposedIps() {
        let posts = this.exposedIpPosts;
        if (posts.length === 0) return null;

        let counts = posts.reduce((counts, post) => {
            let { userIp } = post;
            if (counts[userIp] == null) counts[userIp] = 0;
            counts[userIp] += 1;
            return counts;
        }, {});

        return counts;
    }
}
