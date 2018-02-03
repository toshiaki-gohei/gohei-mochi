'use strict';
import React, { Component } from 'react';
import Post from './post/index.jsx';
import { isThreadLazyDisplay } from './util';
import { DISPLAY_THRESHOLD } from '../../constants';

export default class Thread extends Component {
    constructor(props) {
        super(props);

        this._handlers = {
            displayMore: handleDisplayMore.bind(this)
        };

        this._intersection = {
            $target: null,
            setTarget: $el => this._intersection.$target = $el
        };

        this._observer = createIntersectionObserver(this);
    }

    componentDidMount() { this._observe(); }
    componentDidUpdate() { this._observe(); }
    componentWillUnmount() { this._dispose(); }

    _observe() {
        if (this._observer == null) return;

        this._observer.disconnect();

        let { $target } = this._intersection;
        if ($target == null) return;

        this._observer.observe($target);
    }

    _dispose() {
        if (this._observer == null) return;
        this._observer.disconnect();
        this._observer = null;
    }

    render() {
        let { commit, thread, app } = this.props;
        if (commit == null || thread == null) return null;
        app = app || {};

        let props = { commit, thread, app };

        if (isThreadLazyDisplay(app)) {
            let handlers = this._handlers;
            let intersection = this._intersection;
            return <ThreadLazyDisplay {...{ ...props, handlers, intersection }} />;
        }
        return <ThreadNormal {...props} />;
    }
}

function ThreadNormal({ commit, thread, app }) {
    let { posts } = thread;
    let { changeset } = app;

    let newPostsCount = changeset ? changeset.newPostsCount : 0;

    let boundary = posts.length - newPostsCount;
    let oldPosts = posts.slice(0, boundary);
    let newPosts = posts.slice(boundary, posts.length);

    let props = { commit, thread, app };

    return (
<div className="gohei-thread">
  {renderPosts(oldPosts, props)}
  <NewPostMessage {...{ newPostsCount }} />
  {renderPosts(newPosts, props)}
</div>
    );
}

function ThreadLazyDisplay({ commit, thread, app, handlers, intersection }) {
    let { posts } = thread;
    let { displayThreshold } = app;

    let postIds = posts.slice(0, displayThreshold);

    let props = { commit, thread, app };

    return (
<div className="gohei-thread">
  {renderPosts(postIds, props)}
  <DisplayMore {...{ handlers, intersection }} />
</div>
    );
}

function renderPosts(postIds, { commit, thread, app }) {
    return postIds.map(postId => {
        let post = commit('sync/post', postId);
        let props = { commit, post, thread, app };
        if (post.index === 0) return <Post {...props} key={post.index} />;
        return <PostWithLeftMark {...props} key={post.index} />;
    });
}

function PostWithLeftMark(props) {
    return (
<div className="gohei-reply-container">
  <div className="gohei-reply-left-mark">...</div>
  <Post {...props} />
</div>
    );
}

function NewPostMessage({ newPostsCount }) {
    if (newPostsCount === 0) return null;
    return <div className="gohei-newpost-msg">新着レス{newPostsCount}件</div>;
}

function DisplayMore({ handlers, intersection }) {
    let { displayMore } = handlers;
    let { setTarget } = intersection;

    return (
<div className="gohei-display-more" ref={setTarget}>
  <button className="gohei-link-btn gohei-display-more-btn" type="button"
          onClick={displayMore}>さらに表示</button>
</div>
    );
}

function createIntersectionObserver(ctx) {
    if (typeof IntersectionObserver === 'undefined') return null;

    let fn = handleIntersection.bind(ctx);
    let opts = { rootMargin: DISPLAY_THRESHOLD.ROOT_MARGIN };

    let observer = null;
    try {
        observer = new IntersectionObserver(fn, opts);
    } catch (e) {
        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.error('failed to create IntersectionObserver:', e.message);
        }
    }

    return observer;
}

function handleIntersection(entries) {
    let [ entry ] = entries;
    let { intersectionRatio } = entry;

    if (intersectionRatio <= 0) return;

    let threshold = incrementDisplayThreshold(this.props);

    if (threshold == null) this._dispose();
}

function incrementDisplayThreshold(props) {
    let { commit, thread, app } = props;

    let { posts } = thread;
    let { displayThreshold: threshold } = app;

    threshold += DISPLAY_THRESHOLD.INCREMENT;

    if (posts.length < threshold) threshold = null;

    commit('thread/setDisplayThreshold', threshold);

    return threshold;
}

function handleDisplayMore() {
    incrementDisplayThreshold(this.props);
}
