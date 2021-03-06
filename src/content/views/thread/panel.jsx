'use strict';
import React, { Component } from 'react';
import Postform from './form-post/index.jsx';
import Delform from './form-del.jsx';
import Delreq from './delreq.jsx';
import Filters from './filters.jsx';
import { CLASS_NAME as CN, THREAD_PANEL_TYPE as P_TYPE } from '~/content/constants';

export default class Panel extends Component {
    constructor(props) {
        super(props);

        let { commit } = this.props;
        if (commit == null) throw new TypeError('commit is required');

        this._handlers = {
            open: handleOpen.bind(this),
            close: handleClose.bind(this),

            showPostform: handleTab.bind(this, P_TYPE.FORM_POST),
            showDelform: handleTab.bind(this, P_TYPE.FORM_DEL),
            showDelreq: handleTab.bind(this, P_TYPE.DELREQ),
            showFilters: handleTab.bind(this, P_TYPE.FILTERS)
        };
        this._handleClickBody = handleClickBody.bind(this);
    }

    componentDidMount() {
        document.body.addEventListener('click', this._handleClickBody);
    }
    componentWillUnmount() {
        document.body.removeEventListener('click', this._handleClickBody);
    }

    render() {
        let { commit, app, ui = {} } = this.props;

        // do not return null because must detach listener on componentWillUnmount()
        //if (app == null || ui == null) return null;

        let { panel } = ui.thread || {};
        let handlers = this._handlers;

        return (
// eslint-disable-next-line jsx-a11y/click-events-have-key-events
<div className={CN_PANEL} role="presentation">
  <Icon {...{ panel, open: handlers.open }} />
  <Content {...{ commit, panel, app, handlers }} />
</div>
        );
    }
}

const CN_PANEL = 'gohei-panel';

function Icon({ panel, open }) {
    if (panel == null) return null;
    let style = panel.isOpen ? { display: 'none' } : null;
    return <button className="gohei-icon-btn gohei-panel-icon gohei-icon-menu"
                   style={style} onClick={open} />;
}

function Content({ commit, panel, app, handlers }) {
    if (app == null || panel == null) return null;

    let style = panel.isOpen ? null : { display: 'none' };

    let { close, ...rest } = handlers;
    handlers = rest;

    return(
<div className="gohei-panel-content" style={style}>
  <button className="gohei-icon-btn gohei-close-btn gohei-icon-close" onClick={close} />
  <TabContent {...{ commit, panel, app }} />
  <TabsBar {...{ panel, handlers }} />
</div>
    );
}

function TabsBar({ panel, handlers }) {
    let css = tabCss(panel);
    let { showPostform, showDelform, showDelreq, showFilters } = handlers;

    return (
<ul className="gohei-tabsbar">
  <li className={css.postform} onClick={showPostform} onKeyPress={showPostform} role="tab">レス</li>
  <li className={css.delform} onClick={showDelform} onKeyPress={showDelform} role="tab">レス削除</li>
  <li className={css.delreq} onClick={showDelreq} onKeyPress={showDelreq} role="tab">DEL</li>
  <li className={css.filters} onClick={showFilters} onKeyPress={showFilters} role="tab">フィルタ</li>
</ul>
    );
}

function TabContent({ commit, panel, app }) {
    let url = app.current.thread;
    let { postform } = app.threads.get(url);

    return (
<div className="gohei-tab-content">
  <Postform {...{ commit, panel, postform }} />
  <Delform {...{ commit, panel, app }} />
  <Delreq {...{ commit, panel, app }} />
  <Filters {...{ commit, panel, app }} />
</div>
    );
}

function tabCss(panel) {
    let postform, delform, delreq, filters;
    postform = delform = delreq = filters = 'gohei-tab';

    let active = ' gohei-active';

    switch (panel.type) {
    case P_TYPE.FORM_POST:
        postform += active;
        break;
    case P_TYPE.FORM_DEL:
        delform += active;
        break;
    case P_TYPE.DELREQ:
        delreq += active;
        break;
    case P_TYPE.FILTERS:
        filters += active;
        break;
    }

    return { postform, delform, delreq, filters };
}

function isOnPanel($el) {
    while ($el) {
        if ($el.classList.contains(CN_PANEL)) return true;
        if ($el === document.body) return false;
        $el = $el.parentNode;
    }
    return false;
}

function handleOpen(event) {
    event.stopPropagation();
    let { commit } = this.props;
    commit('thread/openPanel');
}

function handleClose(event) {
    event.stopPropagation();
    let { commit } = this.props;
    commit('thread/closePanel');
}

async function handleClickBody(event) {
    let $el = event.target;
    if (isOnPanel($el)) return;
    if ($el.classList.contains(CN.post.DELFORM_CHECKBOX)) return;

    let { commit } = this.props;
    await commit('thread/closePanel'); // async/await for avoid errors on browser tests
}

function handleTab(type, event) {
    event.stopPropagation();
    let { commit } = this.props;
    commit('thread/openPanel', type);
}
