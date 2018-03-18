'use strict';
import React, { Component } from 'react';
import { THREAD_PANEL_TYPE as P_TYPE } from '~/content/constants';

export default class Filters extends Component {
    constructor(props) {
        super(props);

        this._handlers = {
            changeIsHiddenDeletedPosts: handleChangeIsHiddenDeletedPosts.bind(this)
        };
    }

    render() {
        let { panel, app } = this.props;
        if (panel == null || app == null) return null;

        let { current, threads } = app;
        let { filters } = threads.get(current.thread);

        let handlers = this._handlers;

        let style = panel.type === P_TYPE.FILTERS ? null : { display: 'none' };

        return (
<div className="gohei-filters" style={style}>
  <div>フィルタ</div>
  <Pane {...{ filters, handlers }} />
</div>
        );
    }
}

function Pane({ filters, handlers }) {
    let { isHiddenDeletedPosts } = filters;
    let { changeIsHiddenDeletedPosts } = handlers;

    return (
<div className="gohei-pane">
  <div className="gohei-row">
    <label className="gohei-label">
      <input type="checkbox" className="gohei-checkbox"
             checked={!isHiddenDeletedPosts} onChange={changeIsHiddenDeletedPosts} />
      削除されたレスを表示する
    </label>
  </div>
</div>
    );
}

function handleChangeIsHiddenDeletedPosts(event) {
    let { commit } = this.props;
    let { checked } = event.target;
    commit('thread/setFilters', { isHiddenDeletedPosts: !checked });
}
