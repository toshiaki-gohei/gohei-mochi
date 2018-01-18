'use strict';
import { h, Component } from 'preact';
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

    render({ commit, post, app, thread }, state) {
        if (post == null) return null;
        let { isActive } = state;

        let handlers = this._handlers;

        let props = { commit, post, app, handlers, isActive };
        let { expire } = thread || {};

        if (post.index === 0) return <OriginalPost {...{ ...props, expire }} />;
        return <Reply {...props} />;
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

    let delreq = handleDelreq.bind(this);
    let soudane = handleSoudane.bind(this);

    let enter = () => this.setState({ isActive: true });
    let leave = () => this.setState({ isActive: false });

    return {
        popupPostsById, popupPostsByIp, popupQuote,
        quoteNo, quoteComment, quoteFile,
        delreq, soudane,
        enter, leave
    };
}

function handlePopupPostsById(event) {
    let { commit, post, app } = this.props;
    let posts = app.idipIndex.retrieve(post.userId);
    commit('thread/openPostsPopup', { component: Popup, posts, event });
}

function handlePopupPostsByIp(event) {
    let { commit, post, app } = this.props;
    let posts = app.idipIndex.retrieve(post.userIp);
    commit('thread/openPostsPopup', { component: Popup, posts, event });
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
