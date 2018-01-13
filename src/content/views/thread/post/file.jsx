'use strict';
import { h } from 'preact';
import { Download } from '../../feather-icons.jsx';

export default function File({ post }) {
    if (!post.hasFile()) return null;
    let { index, file } = post;

    let label = index === 0 ? '画像ファイル名：' : null;

    return (
<div class="gohei-post-file">
  <div>
    {label}
    <a href={file.url} class="gohei-file-name" target="_blank" download={file.name}>
      <Icon {...post}/>
      {file.name}
    </a>
    <span class="gohei-file-size">({file.size} B)</span>
  </div>
  <Thumb {...{ file }} />
</div>
    );
}

function Icon({ index }) {
    if (index === 0) return null;
    return <span class="gohei-inline-icon"><Download /></span>;
}

function Thumb({ file }) {
    if (file.thumb == null) return null;

    let { url, width, height } = file.thumb;
    width = width + 'px';
    height = height + 'px';

    // eslint-disable-next-line jsx-a11y/alt-text
    let $img = <img class="gohei-file-thumb" src={url} style={{ width, height }} />;

    return <a href={file.url} target="_blank">{$img}</a>;
}

export function marginLeftForThumb(file) {
    if (file == null || file.thumb == null) return null;
    if (file.thumb.width == null) return null;

    let width = file.thumb.width || 0;
    let marginLeft = width + 40;

    return marginLeft + 'px';
}
