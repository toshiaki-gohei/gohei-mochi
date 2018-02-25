'use strict';
import { F } from '~/common/util';

export default class Query {
    constructor(query) {
        let {
            title = null,
            and = false, or = false
        } = query;

        this.title = title;
        this.and = and;
        this.or = or;

        F(this);
    }

    object() {
        let obj = {};
        let { ...primitives } = this;
        for (let prop in primitives) obj[prop] = primitives[prop];
        return obj;
    }

    isEmpty() {
        let { title } = this;
        if (title == null) return true;
        if (title === '') return true;
        if (/^\s+$/.test(title)) return true;
        return false;
    }
}
