'use strict';
import { h } from 'preact';

export default function Action({ post, handlers, isActive = true }) {
    if (!isActive) return null;
    if (post == null) return null;
    let { quoteNo, quoteComment, quoteFile } = handlers || {};

    return (
<div class="gohei-post-action">
  <span class="gohei-inline-icon gohei-icon-edit" />
  <button class="gohei-link-btn" type="button" onClick={quoteNo}>No.</button>
  <button class="gohei-link-btn" type="button" onClick={quoteComment}>コメント</button>
  <QuoteFileBtn {...{ post, quoteFile }} />
</div>
    );
}

function QuoteFileBtn({ post, quoteFile }) {
    if (!post.hasFile()) return null;
    return <button class="gohei-link-btn" type="button" onClick={quoteFile}>ファイル</button>;
}
