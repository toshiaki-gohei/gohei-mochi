'use strict';
import React, { Component } from 'react';
import Postform from './form-post/index.jsx';
import Delreq from './delreq.jsx';
import { CLASS_NAME as CN, THREAD_PANEL_TYPE as P_TYPE } from '~/content/constants';

export default class Panel extends Component {
    constructor(props) {
        super(props);

        let { commit } = this.props;
        if (commit == null) throw new TypeError('commit is required');

        this._handlers = {
            open: handleOpen.bind(this),
            close: handleClose.bind(this),

            formPost: handleTab.bind(this, P_TYPE.FORM_POST),
            delreq: handleTab.bind(this, P_TYPE.DELREQ)
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
    let { formPost, delreq } = handlers;

    return (
<ul className="gohei-tabsbar">
  <li className={css.formPost} onClick={formPost} onKeyPress={formPost} role="tab">レス</li>
  <li className={css.delreq} onClick={delreq} onKeyPress={delreq} role="tab">削除依頼</li>
</ul>
    );
}

function TabContent({ commit, panel, app }) {
    let url = app.current.thread;
    let { postform } = app.threads.get(url);

    return (
<div className="gohei-tab-content">
  <Postform {...{ commit, panel, postform }} />
  <Delreq {...{ commit, panel, app }} />
</div>
    );
}

function tabCss(panel) {
    let formPost, delreq;
    formPost = delreq = 'gohei-tab';

    let active = ' gohei-active';

    switch (panel.type) {
    case P_TYPE.FORM_POST:
        formPost += active;
        break;
    case P_TYPE.DELREQ:
        delreq += active;
        break;
    }

    return { formPost, delreq };
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
    if ($el.classList.contains(CN.post.POSTDEL_CHECKBOX)) return;

    let { commit } = this.props;
    await commit('thread/closePanel'); // async/await for avoid errors on browser tests
}

function handleTab(type, event) {
    event.stopPropagation();
    let { commit } = this.props;
    commit('thread/openPanel', type);
}
