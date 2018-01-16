'use strict';

const map = Symbol();
const loadedPostCount = Symbol();

export default class Index {
    constructor(posts) {
        this[map] = new Map();
        this[loadedPostCount] = 0;

        this.update(posts);

        Object.seal(this);
    }

    get map() { return this[map]; }
    get loadedPostCount() { return this[loadedPostCount]; }

    retrieve(idOrIp) {
        if (idOrIp == null) return [];
        return this[map].get(idOrIp) || [];
    }

    countUp(idOrIp, postId) {
        if (idOrIp == null || postId == null) return null;
        let ids = this.retrieve(idOrIp);
        if (ids == null || ids.length === 0) return null;

        let count = 1;
        for (let id of ids) {
            if (id === postId) break;
            ++count;
        }

        let total = ids.length;
        if (count > total) return null;

        return { current: count, total };
    }

    update(posts = []) {
        let start = this[loadedPostCount];

        for (let i = start, len = posts.length; i < len; ++i) {
            let { id, userId, userIp } = posts[i];
            if (userId != null) this._add(userId, id);
            if (userIp != null) this._add(userIp, id);
            ++this[loadedPostCount];
        }
    }

    _add(idOrIp, postId) {
        if (idOrIp == null) return;
        if (this[map].get(idOrIp) == null) this[map].set(idOrIp, []);
        this[map].get(idOrIp).push(postId);
    }
}
