'use strict';
import React, { Component } from 'react';
import { CLASS_NAME as CN } from '~/content/constants';
import Header from './header.jsx';
import Body from './body.jsx';
import File from './file.jsx';
import Action from './action.jsx';
import { isThreadLazyDisplay } from '../../util';

export default class OriginalPost extends Component {
    constructor(props) {
        super(props);

        this._displayAll = handleDisplayAll.bind(this);
    }

    render() {
        let { commit, post, expire, app, handlers, isActive = false } = this.props;
        if (post == null) return null;

        let { messages, idipIndex } = app || {};

        let { enter, leave, ...rest } = handlers || {};
        handlers = rest;

        let displayAll = this._displayAll;

        return (
<div className={CLASS_NAME} onMouseEnter={enter} onMouseLeave={leave}>
  <File {...{ commit, post }} />
  <Header {...{ post, idipIndex, handlers }} />
  <Body {...{ post, handlers }} />
  <Action {...{ post, handlers, isActive }} />
  <Expire {...{ expire }} />
  <Notice {...messages} />
  <Warning {...messages} />
  <DeletedPostCount {...messages} />
  <DisplayAllBtn {...{ app, displayAll }} />
</div>
        );
    }
}

const CLASS_NAME = `${CN.POST} gohei-op`;

function Expire({ expire }) {
    if (expire == null || expire.message == null) return null;
    return <div className="gohei-font-smaller">{expire.message}</div>;
}

function Notice({ notice }) {
    if (notice == null) return null;
    return <div className="gohei-text-info">{notice}</div>;
}

function Warning({ warning }) {
    if (warning == null) return null;
    return <div className="gohei-text-danger">{warning}</div>;
}

function DeletedPostCount({ deletedPostCount: count }) {
    if (count == null) return null;
    return <div className="gohei-font-smaller">削除された記事が{count}件あります。</div>;
}

function DisplayAllBtn({ app, displayAll }) {
    if (!isThreadLazyDisplay(app)) return null;
    return <button className="gohei-link-btn gohei-display-all-btn" type="button"
                   onClick={displayAll}>スレを全て表示</button>;
}

function handleDisplayAll() {
    let { commit } = this.props;
    commit('thread/setDisplayThreshold', null);
}
