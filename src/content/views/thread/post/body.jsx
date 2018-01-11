'use strict';
import { h, Component } from 'preact';
import { CLASS_NAME as CN } from '~/content/constants';
import { BR_TAG } from '~/content/model/post';
import { marginLeftForThumb } from './file.jsx';

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

    render({ post, handlers }) {
        let { raw } = post || {};
        let { popupQuote } = handlers || {};

        let { blockquote: bq } = raw || {};
        bq = replaceNoWithNoQuote(bq);

        let __html = bq;
        let style = makeStyle(post);

        // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        return <blockquote class="gohei-post-body" style={style}
                           onMouseover={popupQuote} dangerouslySetInnerHTML={{ __html }} />;
    }
}

function makeStyle(post) {
    let { file } = post || {};
    let marginLeft = marginLeftForThumb(file);
    let style = marginLeft ? { marginLeft } : null;
    return style;
}

function replaceNoWithNoQuote(bq) {
    if (bq == null) return bq;
    if (!/No\.\d+/.test(bq)) return bq;

    let lines = bq.split(BR_TAG);
    for (let i = 0, len = lines.length; i < len; ++i) {
        let line = lines[i];
        if (/^<span class="gohei-/.test(line)) continue;
        lines[i] = line.replace(/No\.\d+/g, convertNoIntoQuoteNo);
    }

    return lines.join(BR_TAG);
}

function convertNoIntoQuoteNo(match) {
    return `<span class="${CN.post.QUOTE}">${match}</span>`;
}
