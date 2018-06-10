'use strict';
import React, { Component } from 'react';
import Video from './video.jsx';

export default class File extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isVisibleVideo: false
        };

        let { post } = props;
        let hasVideo = post.hasFile() && post.file.isVideo();
        this._handlers = {
            showVideo: hasVideo ? handleSetVisibleVideo.bind(this, true) : null,
            hideVideo: hasVideo ? handleSetVisibleVideo.bind(this, false) : null
        };
    }

    render() {
        let { commit, post } = this.props;
        let { isVisibleVideo } = this.state;

        if (!post.hasFile()) return null;

        let { index, file } = post;
        let { showVideo, hideVideo } = this._handlers;

        let label = index === 0 ? '画像ファイル名：' : null;

        return (
<div className="gohei-post-file">
  <div>
    {label}
    <a href={file.url} className="gohei-file-name" download={file.name}>
      <Icon {...post}/>
      {file.name}
    </a>
    <span className="gohei-file-size">({file.size} B)</span>
  </div>
  <Thumb {...{ file, isVisibleVideo, showVideo }} />
  <Video {...{ commit, file, isVisibleVideo, hideVideo }} />
</div>
        );
    }
}

function Icon({ index }) {
    if (index === 0) return null;
    return <span className="gohei-inline-icon gohei-icon-download" />;
}

function Thumb({ file, isVisibleVideo, showVideo }) {
    if (file.thumb == null) return null;
    if (isVisibleVideo) return null;

    let $img = <ThumbImage {...{ file }} />;

    if (file.isVideo()) {
        return <a href={file.url} onClick={showVideo}>{$img}</a>;
    }
    return <a href={file.url} target="_blank">{$img}</a>;
}

function ThumbImage({ file }) {
    let { url, width, height } = file.thumb;
    width = width + 'px';
    height = height + 'px';

    // eslint-disable-next-line jsx-a11y/alt-text
    return <img className="gohei-thumb-image" src={url} style={{ width, height }} />;
}

function handleSetVisibleVideo(isVisibleVideo, event) {
    event.preventDefault();
    this.setState({ isVisibleVideo });
}

export function marginLeftForThumb(file) {
    if (file == null || file.thumb == null) return null;
    if (file.thumb.width == null) return null;

    let width = file.thumb.width || 0;
    let marginLeft = width + 40;

    return marginLeft + 'px';
}
