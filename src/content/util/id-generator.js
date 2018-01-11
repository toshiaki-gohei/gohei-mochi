'use strict';

export default function genId() {
    let epoch = Date.now();
    let rand = Math.ceil(Math.random() * 100000000);
    return `${epoch}-${rand}`;
}
