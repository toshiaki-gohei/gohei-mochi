'use strict';
import { h, Component } from 'preact';
import Postform from './form-post.jsx';
import Delreq from './delreq.jsx';
import { Menu, X } from '../feather-icons.jsx';
import { THREAD_PANEL_TYPE as P_TYPE } from '~/content/constants';

export default class Panel extends Component {
    constructor(props) {
        super(props);

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

    render({ commit, app, ui }) {
        if (app == null || ui == null) return null;
        let { panel } = ui.thread;

        let handlers = this._handlers;

        return (
// eslint-disable-next-line jsx-a11y/click-events-have-key-events
<div class="gohei-panel" onClick={stopPropagation} role="presentation">
  <Icon {...{ panel, url: this._iconUrl, open: handlers.open }} />
  <Content {...{ commit, panel, app, handlers }} />
</div>
        );
    }
}

function Icon({ panel, open }) {
    let style = panel.isOpen ? { display: 'none' } : null;
    return <button class="gohei-icon-btn gohei-panel-icon" style={style}
                   onClick={open}><Menu /></button>;
}

function Content({ commit, panel, app, handlers }) {
    let style = panel.isOpen ? null : { display: 'none' };

    let { close, ...rest } = handlers;
    handlers = rest;

    return(
<div class="gohei-panel-content" style={style}>
  <button class="gohei-icon-btn gohei-close-btn" onClick={close}><X /></button>
  <TabContent {...{ commit, panel, app }} />
  <TabsBar {...{ panel, handlers }} />
</div>
    );
}

function TabsBar({ panel, handlers }) {
    let css = tabCss(panel);
    let { formPost, delreq } = handlers;

    return (
<ul class="gohei-tabsbar">
  <li class={css.formPost} onClick={formPost} onKeyPress={formPost} role="tab">レス</li>
  <li class={css.delreq} onClick={delreq} onKeyPress={delreq} role="tab">削除依頼</li>
</ul>
    );
}

function TabContent({ commit, panel, app }) {
    let url = app.current.thread;
    let { postform } = app.threads.get(url);

    return (
<div class="gohei-tab-content">
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

function handleClickBody(event) {
    let $el = event.target;
    if ($el.classList.contains('gohei-link-btn')) return;
    let { commit } = this.props;
    commit('thread/closePanel');
}

function handleTab(type) {
    let { commit } = this.props;
    commit('thread/openPanel', type);
}

function stopPropagation(event) {
    event.stopPropagation();
}
