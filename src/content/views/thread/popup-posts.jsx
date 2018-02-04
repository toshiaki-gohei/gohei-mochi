'use strict';
import React, { Component } from 'react';
import { CLASS_NAME as CN } from '~/content/constants';
import Post from './post/index.jsx';

export default class Popup extends Component {
    constructor(props) {
        super(props);

        let { event, style } = this.props;

        this.state = { style };

        this._$el = null;
        this._event = event;
        this._$quote = event ? event.target : null;

        // workaround: emit funny mouseover event on Firefox
        this._vanishes = checkWorkaround(event) ? true : false;

        this._handleClose = handleClose.bind(this);
    }

    componentDidMount() {
        this._adjustPosition();
        if (this._$quote) this._$quote.addEventListener('mouseleave', this._handleClose);
    }
    componentWillUnmount() {
        if (this._$quote) this._$quote.removeEventListener('mouseleave', this._handleClose);
    }

    _adjustPosition() {
        if (this._event == null) return;
        let [ event, $el ] = [ this._event, this._$el ];
        let x = calcX({ event, $el });
        let y = calcY({ event, $el });
        let style = { ...this.state.style, ...x, ...y };
        this.setState({ style });
    }

    render() {
        let { commit, id, className, posts = [], thread: threadUrl } = this.props;
        let { style } = this.state;

        if (this._vanishes) {
            style = { ...style, display: 'none' };
        }

        let thread = commit('sync/thread', threadUrl);
        let app = commit('sync/appThread', threadUrl);

        let $posts = posts.map(postId => {
            let post = commit('sync/post', postId);
            return <Post {...{ commit, post, app, thread }} key={post.index} />;
        });

        className = `${className || ''} gohei-post-popup`.trim();

        return (
<div id={id} className={className} style={style}
     onMouseLeave={this._handleClose} ref={$el => this._$el = $el}>
{$posts}
</div>
        );
    }
}

function handleClose(event) {
    let $related = event.relatedTarget;
    let { commit } = this.props;

    // mouse moved from popup to next(overlap) popup
    if ($related && $related.classList && $related.classList.contains(CN.POPUP)) return;

    // mouse went back from popup to previous(under) popup
    if (isOnPopup($related)) {
        commit('thread/closePostsPopup');
        return;
    }

    commit('thread/clearPostsPopup');
}

const OVERHANG_WIDTH = 40;

function calcX({ event: { pageX }, $el: { offsetWidth } }) {
    let { innerWidth: ww } = window;

    let style = {};
    if (pageX + offsetWidth - OVERHANG_WIDTH < ww) {
        style.left = (pageX - OVERHANG_WIDTH) + 'px';
    } else {
        style.right = '0px';
    }

    return style;
}

function calcY({ event: { target: $target }, $el: { offsetHeight } }) {
    let { top, bottom } = $target.getBoundingClientRect();
    let { pageYOffset } = window;

    // ceil(): overlap rect and $popup slightly for mouseleave event
    let y = Math.ceil(top + pageYOffset);

    y -= offsetHeight; // display above
    if (y < 0) y = Math.floor(bottom + pageYOffset); // display below

    return { top: y + 'px' };
}

function isOnPopup($el) {
    while ($el) {
        if ($el.classList && $el.classList.contains(CN.POPUP)) return true;
        if ($el === document.body) return false;
        $el = $el.parentNode;
    }
    return false;
}

function checkWorkaround(event) {
    if (event == null || event.target == null) return false;

    let rect = event.target.getBoundingClientRect();
    let { width, height, top, right, bottom, left } = rect;

    let isSize0 = width === 0 && height === 0;
    let isPosition0 = top === 0 && right === 0 && bottom === 0 && left === 0;
    let isFunny = isSize0 && isPosition0;

    if (isFunny) return true;
    return false;
}
