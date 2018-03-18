'use strict';
import React, { Component } from 'react';
import { CLASS_NAME as CN, THREAD_PANEL_TYPE as P_TYPE } from '~/content/constants';
import OriginalPost from './original.jsx';
import Reply from './reply.jsx';
import Popup from '../popup-posts.jsx';
import { hasChanged } from '../../util';

export default class Post extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isActive: false
        };

        this._handlers = makeHandlers.bind(this)();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return hasChanged(this, nextProps, nextState);
    }

    render() {
        let { commit, post, app, thread, isHidden = false } = this.props;
        let { isActive } = this.state;

        if (post == null) return null;

        let { expire } = thread || {};
        let { delform, idipIndex } = app || {};

        let handlers = this._handlers;
        let isChecked = isPostChecked(post, delform);

        let props = { commit, post, handlers, isChecked, isActive };

        if (post.index !== 0) return <Reply {...{ ...props, idipIndex, isHidden }} />;
        return <OriginalPost {...{ ...props, expire, app }} />;
    }
}

function makeHandlers() {
    let { post } = this.props;
    if (post == null) return null;

    let popupPostsById = handlePopupPostsById.bind(this);
    let popupPostsByIp = handlePopupPostsByIp.bind(this);
    let popupQuote = handlePopupQuote.bind(this);

    let quoteNo = handleQuote.bind(this, 'no');
    let quoteComment = handleQuote.bind(this, 'comment');
    let quoteFile = handleQuote.bind(this, 'file');

    let changeCheckBox = handleChangeCheckBox.bind(this);

    let delreq = handleDelreq.bind(this);
    let soudane = handleSoudane.bind(this);

    let enter = () => this.setState({ isActive: true });
    let leave = () => this.setState({ isActive: false });

    return {
        popupPostsById, popupPostsByIp, popupQuote,
        quoteNo, quoteComment, quoteFile,
        delreq, soudane,
        changeCheckBox,
        enter, leave
    };
}

function isPostChecked(post, delform) {
    let { targets } = delform || {};
    if (targets == null) return false;
    return targets.has(post.id) ? true : false;
}

function handlePopupPostsById(event) {
    let { commit, post, app } = this.props;
    event = pickSyntheticEvent(event);
    let posts = app.idipIndex.retrieve(post.userId);
    commit('thread/openPostsPopup', { component: Popup, posts, event });
}

function handlePopupPostsByIp(event) {
    let { commit, post, app } = this.props;
    event = pickSyntheticEvent(event);
    let posts = app.idipIndex.retrieve(post.userIp);
    commit('thread/openPostsPopup', { component: Popup, posts, event });
}

function handlePopupQuote(event) {
    let $el = event.target;
    if (!$el.classList.contains(CN.post.QUOTE)) return;

    let { commit, post } = this.props;
    event = pickSyntheticEvent(event);

    let { index } = post;
    let quote = $el.textContent.trim();

    let opts = { component: Popup, index, quote, event };
    commit('thread/openQuotePopup', opts);
}

function handleQuote(type, event) {
    let $el = event.target;
    if (!$el.classList.contains('gohei-link-btn')) return;
    event.stopPropagation();

    let { commit, post } = this.props;
    let { id } = post;
    commit('thread/quote', { type, id });
    commit('thread/openPanel', P_TYPE.FORM_POST);
}

function handleChangeCheckBox(event) {
    let $el = event.target;
    if (!$el.classList.contains(CN.post.DELFORM_CHECKBOX)) return;
    event.stopPropagation();

    let { commit, post, thread } = this.props;
    let { url } = thread;

    if (!$el.checked) {
        commit('thread/removeDelformTargets', { url, postId: post.id });
        return;
    }

    commit('thread/addDelformTargets', { url, postId: post.id });
    commit('thread/openPanel', P_TYPE.FORM_DEL);
}

function handleDelreq(event) {
    let $el = event.target;
    if (!$el.classList.contains('gohei-del')) return;
    event.stopPropagation();

    let { commit, post, thread } = this.props;
    let { url } = thread;
    commit('thread/addDelreqTargets', { url, postId: post.id });

    commit('thread/openPanel', P_TYPE.DELREQ);
}

async function handleSoudane(event) {
    let $el = event.target;
    if (!$el.classList.contains('gohei-sod')) return;
    event.stopPropagation();

    let { commit, post } = this.props;
    let { id } = post;
    let res = await commit('thread/soudane', { id });

    if (!res.ok) {
        console.error(res.status, res.statusText); // eslint-disable-line no-console
    }
}

function pickSyntheticEvent(event) {
    let { target, pageX, pageY } = event;
    return { target, pageX, pageY };
}
