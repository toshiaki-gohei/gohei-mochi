'use strict';
import { h, Component } from 'preact';

export default class Console extends Component {
    constructor({ commit, thread, app }) {
        super({ thread, app });

        this._handleUpdate = () => commit('thread/update', thread.url);
    }

    render({ thread, app }) {
        if (thread == null || app == null) return null;
        let { expire } = thread;
        let { viewer } = app.messages;

        return (
<div class="gohei-console">
  <div class="gohei-msg">
    <span>{viewer}</span><span>/</span><Expire {...expire} />
  </div>
  <div class="gohei-thread-action">
    <UpdateBtn {...{ app, handler: this._handleUpdate }} />
    <LastUpdated {...app} />
    <StatusMessage {...app} />
    <UpdateDetail {...app} />
  </div>
</div>
        );
    }
}

function Expire(expire = {}) {
    let { message, date } = expire;
    if (message == null || date == null) return null;

    let time = date.getTime() - Date.now();
    if (time < 0) time = 0;
    let isTextDanger = (time / 1000 / 60 < 30) ? true : false;

    let css = isTextDanger ? 'gohei-text-danger' : null;

    return <span class={css}>{message}</span>;
}

function UpdateBtn({ app, handler }) {
    let { isUpdating } = app;

    let label = isUpdating ? '更新中…' : '最新に更新';
    let isDisabled = isUpdating ? true : false;

    return <button class="gohei-link-btn gohei-update-btn" type="button"
                   disabled={isDisabled} onClick={handler}>{label}</button>;
}

function LastUpdated({ lastUpdatedByUser: date }) {
    let str = hms(date);
    return <span class="gohei-last-updated">{ str ? `(${str})` : null }</span>;
}

function hms(date) {
    if (date == null) return null;

    let h = date.getHours(), m = date.getMinutes(), s = date.getSeconds();

    let hour = h < 10 ? '0' + h : h,
        min = m < 10 ? '0' + m : m,
        sec = s < 10 ? '0' + s : s;

    return [ hour, min, sec ].join(':');
}

function StatusMessage({ updateHttpRes, changeset }) {
    let { status, statusText } = updateHttpRes || {};
    let { newPostsCount } = changeset || {};
    let msg = statusMessage({ status, statusText, newPostsCount });
    return <span class="gohei-status-msg">{msg}</span>;
}

function statusMessage({ status, statusText, newPostsCount }) {
    if (status == null) return null;

    let sm = `(${status} ${statusText})`;
    let newly = newPostsCount == null ? null : `新着: ${newPostsCount}`;

    switch (status) {
    case 200:
        return newly;
    case 304:
        return '更新はありません';
    case 404:
        return `スレッドが消えたようです${sm}`;
    default:
        return sm;
    }
}

function UpdateDetail({ changeset }) {
    let $msgs = [];

    let idsMsg = exposedIdMessage(changeset);
    if (idsMsg) $msgs.push(<span class="gohei-msg">ID: {idsMsg}</span>);

    let ipsMsg = exposedIpMessage(changeset);
    if (ipsMsg) $msgs.push(<span class="gohei-msg">IP: {ipsMsg}</span>);

    let deletedMsg = deletedMessage(changeset);
    if (deletedMsg) $msgs.push(<span class="gohei-msg">削除: {deletedMsg}</span>);

    return <span class="gohei-update-detail">{$msgs}</span>;
}

function exposedIdMessage(changeset) {
    if (changeset == null) return null;

    let counter = changeset.countExposedIds();
    if (counter == null) return null;

    return Object.entries(counter).map(([ id, count ]) => `${id}(${count})`).join(', ');
}

function exposedIpMessage(changeset) {
    if (changeset == null) return null;

    let counter = changeset.countExposedIps();
    if (counter == null) return null;

    return Object.entries(counter).map(([ ip, count ]) => `${ip}(${count})`).join(', ');
}

function deletedMessage(changeset) {
    if (changeset == null) return null;

    let { deletedPosts } = changeset;
    let deletedMsg = deletedPosts.map(post => `No.${post.no}`).join(',');

    return deletedMsg;
}

export const internal = {
    Expire,
    statusMessage,
    exposedIdMessage,
    exposedIpMessage
};
