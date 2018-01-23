'use strict';
import React, { Component } from 'react';
import * as preferences from '../../../model/preferences';

export default class File extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isVisibleVideo: false
        };

        let { post } = props;
        let hasWebmFile = post.hasFile() && post.file.isWebm();
        this._handlers = {
            showVideo: hasWebmFile ? handleSetVisibleVideo.bind(this, true) : null,
            hideVideo: hasWebmFile ? handleSetVisibleVideo.bind(this, false) : null
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

    if (file.isWebm()) {
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

class Video extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isActive: false,
            styleVideo: { display: 'none' }
        };

        this._$video = null;

        let { hideVideo } = this.props;
        let setVideoPrefs = handleSetVideoPrefs.bind(this);

        this._handlers = {
            loadedMetadata: () => {
                this._setVideoAttrs();
                this._adjustSize();
            },
            enter: () => this.setState({ isActive: true }),
            leave: () => {
                setVideoPrefs();
                this.setState({ isActive: false });
            },
            close: event => {
                setVideoPrefs();
                hideVideo(event);
            }
        };
    }

    _setVideoAttrs() {
        if (!this.props.isVisibleVideo) return;
        if (this._$video == null) return;

        let { commit } = this.props;
        let { video } = commit('sync/preferences');

        let { loop, muted, volume } = video;
        this._$video.loop = loop;
        this._$video.muted = muted;
        this._$video.volume = volume;
    }

    _adjustSize() {
        if (!this.props.isVisibleVideo) return;
        if (this._$video == null) return;

        let { left } = this._$video.getBoundingClientRect();
        let $thre = document.querySelector('.gohei-thread');
        let maxWidth = ($thre ? $thre.clientWidth : 800) - left - 60;

        let { videoWidth: w, videoHeight: h } = this._$video;
        if (w > maxWidth) {
            let ratio = maxWidth / w;
            [ w, h ] = [ maxWidth, h * ratio ];
        }

        let styleVideo = {
            display: null, maxWidth: w + 'px', maxHeight: h + 'px'
        };
        this.setState({ styleVideo });
    }

    render() {
        let { commit, file, isVisibleVideo } = this.props;
        let { isActive, styleVideo } = this.state;

        if (!isVisibleVideo) return null;

        let { video } = commit('sync/preferences');
        let { loop, muted, volume } = video;

        let { loadedMetadata, enter, leave, close } = this._handlers;

        let webmUrl = file.url;
        let mp4Url = file.url.replace(/\.webm$/, '.mp4');

        let styleBtn = isActive ? null : { display: 'none' };

        return (
<div className="gohei-video-container" onMouseEnter={enter} onMouseLeave={leave}>
  <video className="gohei-video" style={styleVideo} ref={$el => this._$video = $el}
         autoPlay={true} controls={true} loop={loop} muted={muted} volume={volume}
         onLoadedMetadata={loadedMetadata}>
    <source src={webmUrl} type="video/webm" />
    <source src={mp4Url} type="video/mp4" />
  </video>
  <div className="gohei-button-area" style={styleBtn}>
    <button className="gohei-icon-btn gohei-close-btn gohei-icon-close" onClick={close} />
  </div>
</div>
        );
    }
}

function handleSetVideoPrefs() {
    let { commit } = this.props;
    let { loop, muted, volume } = this._$video;

    let video = { loop, muted, volume };

    let prefs = commit('sync/preferences');
    prefs = preferences.create({ ...prefs, video });

    commit('preferences/set', prefs);

    preferences.store(prefs, 'video');
}

export const internal = {
    Video
};
