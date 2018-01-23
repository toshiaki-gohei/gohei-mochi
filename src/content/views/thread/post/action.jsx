'use strict';
import React from 'react';

export default function Action({ post, handlers, isActive = true }) {
    if (!isActive) return null;
    if (post == null) return null;
    let { quoteNo, quoteComment, quoteFile } = handlers || {};

    return (
<div className="gohei-post-action">
  <span className="gohei-inline-icon gohei-icon-edit" />
  <button className="gohei-link-btn" type="button" onClick={quoteNo}>No.</button>
  <button className="gohei-link-btn" type="button" onClick={quoteComment}>コメント</button>
  <QuoteFileBtn {...{ post, quoteFile }} />
</div>
    );
}

function QuoteFileBtn({ post, quoteFile }) {
    if (!post.hasFile()) return null;
    return <button className="gohei-link-btn" type="button" onClick={quoteFile}>ファイル</button>;
}
