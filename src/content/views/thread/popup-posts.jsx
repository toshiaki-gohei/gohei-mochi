'use strict';
import { h, Component } from 'preact';
import { CLASS_NAME as CN } from '~/content/constants';
import Post from './post/index.jsx';

export default class Popup extends Component {
    constructor({ event, style, ...rest }) {
        super(rest);

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

    render(props, state) {
        let { commit, id, class: className, posts = [], thread: threadUrl } = props;
        let { style } = state;

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
<div id={id} class={className} style={style}
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
    if ($related && $related.classList.contains(CN.POPUP)) return;

    // mouse went back from popup to previous(under) popup
    if (isOnPopup($related)) {
        commit('thread/closePostsPopup');
        return;
    }

    commit('thread/clearPostsPopup');
}

const OVERHANG_WIDTH = 40;

function calcX({ event: { pageX }, $el: { offsetWidth } }) {
    let style = {};
    let ww = window.innerWidth;

    if (pageX + offsetWidth - OVERHANG_WIDTH < ww) {
        style.left = (pageX - OVERHANG_WIDTH) + 'px';
    } else {
        style.right = '0px';
    }

    return style;
}

function calcY({ event: { target: $target }, $el: { offsetHeight } }) {
    let style = {};
    let rect = $target.getBoundingClientRect();

    // ceil(): overlap rect and $popup slightly for mouseleave event
    let y = Math.ceil(rect.top + window.pageYOffset);
    style.top = (y - offsetHeight) + 'px';

    return style;
}

function isOnPopup($el) {
    while ($el) {
        if ($el.classList.contains(CN.POPUP)) return true;
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
