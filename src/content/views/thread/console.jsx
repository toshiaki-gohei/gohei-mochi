'use strict';
import React, { Component } from 'react';

export default class Console extends Component {
    constructor(props) {
        super(props);

        let { commit, thread } = this.props;
        this._handleUpdate = () => commit('thread/update', thread.url);
    }

    render() {
        let { thread, app } = this.props;
        if (thread == null || app == null) return null;
        let { expire } = thread;
        let { viewer } = app.messages;

        return (
<div className="gohei-console">
  <div className="gohei-msg">
    <span>{viewer}</span><span>/</span><Expire {...{ expire, app }} />
  </div>
  <div className="gohei-thread-action">
    <UpdateBtn {...{ app, handler: this._handleUpdate }} />
    <LastUpdated {...app} />
    <StatusMessage {...app} />
    <span className="gohei-update-detail">
      <ExposedIdMessage {...app} />
      <ExposedIpMessage {...app} />
      <DeletedMessage {...app} />
    </span>
  </div>
</div>
        );
    }
}

function Expire({ expire, app }) {
    let { message, date } = expire || {};
    if (message == null || date == null) return null;

    let css = isTextDanger(app) ? 'gohei-text-danger' : null;

    return <span className={css}>{message}</span>;
}

function isTextDanger(app) {
    let { messages: { warning } = {} } = app || {};
    if (/^このスレは古いので/.test(warning)) return true;
    return false;
}

function UpdateBtn({ app, handler }) {
    let { isUpdating } = app;

    let label = isUpdating ? '更新中…' : '最新に更新';
    let isDisabled = isUpdating ? true : false;

    return <button className="gohei-link-btn gohei-update-btn" type="button"
                   disabled={isDisabled} onClick={handler}>{label}</button>;
}

function LastUpdated({ updatedAt }) {
    let str = hms(updatedAt);
    return <span className="gohei-last-updated">{ str ? `(${str})` : null }</span>;
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
    return <span className="gohei-status-msg">{msg}</span>;
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

function ExposedIdMessage({ changeset }) {
    if (changeset == null) return null;

    let counter = changeset.countExposedIds();
    if (counter == null) return null;

    let msg = Object.entries(counter).map(([ id, count ]) => `${id}(${count})`).join(', ');

    return <span className="gohei-msg">ID: {msg}</span>;
}

function ExposedIpMessage({ changeset }) {
    if (changeset == null) return null;

    let counter = changeset.countExposedIps();
    if (counter == null) return null;

    let msg = Object.entries(counter).map(([ ip, count ]) => `${ip}(${count})`).join(', ');

    return <span className="gohei-msg">IP: {msg}</span>;
}

function DeletedMessage({ changeset }) {
    if (changeset == null) return null;

    let { deletedPosts } = changeset;
    if (deletedPosts.length === 0) return null;

    let msg = deletedPosts.map(post => `No.${post.no}`).join(', ');

    return <span className="gohei-msg">削除: {msg}</span>;
}

export const internal = {
    Expire,
    statusMessage,
    ExposedIdMessage,
    ExposedIpMessage,
    DeletedMessage
};
