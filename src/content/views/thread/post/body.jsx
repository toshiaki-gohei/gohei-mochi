'use strict';
import React, { Component } from 'react';
import { marginLeftForThumb } from './file.jsx';
import * as util from './util';

export default class Body extends Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps) {
        let { post: prevPost } = this.props;
        let { post: nextPost } = nextProps;

        if (prevPost !== nextPost) return true;
        return false;
    }

    render() {
        let { post, handlers } = this.props;
        let { raw } = post || {};
        let { popupQuote } = handlers || {};

        let { blockquote: bq } = raw || {};
        bq = util.replaceNoWithNoQuote(bq);
        bq = util.replaceLink(bq);

        let __html = bq;
        let style = bqStyle(post);

        // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        return <blockquote className="gohei-post-body" style={style}
                           onMouseOver={popupQuote} dangerouslySetInnerHTML={{ __html }} />;
    }
}

function bqStyle(post) {
    let { file } = post || {};
    let marginLeft = marginLeftForThumb(file);
    let style = marginLeft ? { marginLeft } : null;
    return style;
}
