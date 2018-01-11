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

    retrieve(idOrIp, postIndex) {
        if (idOrIp == null || postIndex == null) return null;
        let indexes = this[map].get(idOrIp);
        if (indexes == null || indexes.length === 0) return null;

        let count = 1;
        for (let index of indexes) {
            if (index === postIndex) break;
            ++count;
        }

        let total = indexes.length;
        if (count > total) return null;

        return { current: count, total };
    }

    lookup(idOrIp) {
        if (idOrIp == null) return [];
        return this[map].get(idOrIp) || [];
    }

    update(posts = []) {
        let start = this[loadedPostCount];

        for (let i = start, len = posts.length; i < len; ++i) {
            let { index, userId, userIp } = posts[i];
            if (userId != null) this._add(userId, index);
            if (userIp != null) this._add(userIp, index);
            ++this[loadedPostCount];
        }
    }

    _add(idOrIp, postIndex) {
        if (idOrIp == null) return;
        if (this[map].get(idOrIp) == null) this[map].set(idOrIp, []);
        this[map].get(idOrIp).push(postIndex);
    }
}
