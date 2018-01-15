'use strict';
import { h, Component } from 'preact';
import { CLASS_NAME as CN, THREAD_PANEL_TYPE as P_TYPE } from '~/content/constants';
import OriginalPost from './original.jsx';
import Reply from './reply.jsx';
import Popup from '../popup.jsx';
import { hasChanged } from '../../util';

export default class Post extends Component {
    constructor(props) {
        super(props);

        this.state = { isActive: false };

        this._handlers = {
            popupQuote: handlePopupQuote.bind(this),

            quoteNo: handleQuote.bind(this, 'no'),
            quoteComment: handleQuote.bind(this, 'comment'),
            quoteFile: handleQuote.bind(this, 'file'),

            delreq: handleDelreq.bind(this),
            soudane: handleSoudane.bind(this),

            displayAll: handleDisplayAll.bind(this),

            enter: () => this.setState({ isActive: true }),
            leave: () => this.setState({ isActive: false })
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return hasChanged(this, nextProps, nextState);
    }

    render({ post, app, thread }, state) {
        if (post == null) return null;
        let { isActive } = state;

        let handlers = this._handlers;

        let props = { post, app, handlers, isActive };
        let { expire } = thread || {};

        if (post.index === 0) return <OriginalPost {...{ ...props, expire }} />;
        return <Reply {...props} />;
    }
}

function handlePopupQuote(event) {
    let $el = event.target;
    if (!$el.classList.contains(CN.post.QUOTE)) return;

    let { commit, post } = this.props;

    let { index } = post;
    let quote = $el.textContent.trim();

    let opts = { component: Popup, index, quote, event };
    commit('thread/openQuotePopup', opts);
}

function handleQuote(type, event) {
    let $el = event.target;
    if (!$el.classList.contains('gohei-link-btn')) return;

    let { commit, post } = this.props;
    let { id } = post;
    commit('thread/quote', { type, id });
    commit('thread/openPanel', P_TYPE.FORM_POST);
}

function handleDelreq(event) {
    let $el = event.target;
    if (!$el.classList.contains('gohei-del')) return;

    let { commit, post, thread } = this.props;
    let { url } = thread;
    commit('thread/addDelreqs', { url, id: post.id });

    commit('thread/openPanel', P_TYPE.DELREQ);
}

async function handleSoudane(event) {
    let $el = event.target;
    if (!$el.classList.contains('gohei-sod')) return;

    let { commit, post } = this.props;
    let { id } = post;
    let res = await commit('thread/soudane', { id });

    if (!res.ok) {
        console.error(res.status, res.statusText); // eslint-disable-line no-console
    }
}

function handleDisplayAll() {
    let { commit } = this.props;
    commit('thread/setDisplayThreshold', null);
}