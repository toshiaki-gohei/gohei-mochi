'use strict';
import { h, Component } from 'preact';
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

    render({ commit, post }, state) {
        if (!post.hasFile()) return null;

        let { isVisibleVideo } = state;

        let { index, file } = post;
        let { showVideo, hideVideo } = this._handlers;

        let label = index === 0 ? '画像ファイル名：' : null;

        return (
<div class="gohei-post-file">
  <div>
    {label}
    <a href={file.url} class="gohei-file-name" download={file.name}>
      <Icon {...post}/>
      {file.name}
    </a>
    <span class="gohei-file-size">({file.size} B)</span>
  </div>
  <Thumb {...{ file, isVisibleVideo, showVideo }} />
  <Video {...{ commit, file, isVisibleVideo, hideVideo }} />
</div>
        );
    }
}

function Icon({ index }) {
    if (index === 0) return null;
    return <span class="gohei-inline-icon gohei-icon-download" />;
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
    return <img class="gohei-thumb-image" src={url} style={{ width, height }} />;
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
    constructor({ hideVideo, ...props }) {
        super(props);

        this.state = {
            isActive: false
        };

        this._$video = null;

        let setVideoPrefs = handleSetVideoPrefs.bind(this);

        this._handlers = {
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

    render({ commit, file, isVisibleVideo }, state) {
        if (!isVisibleVideo) return null;
        let { isActive } = state;

        let { video } = commit('sync/preferences');
        let { loop, muted, volume } = video;

        let { enter, leave, close } = this._handlers;

        let webmUrl = file.url;
        let mp4Url = file.url.replace(/\.webm$/, '.mp4');

        let style = isActive ? null : { display: 'none' };

        return (
<div class="gohei-video-container" onMouseenter={enter} onMouseleave={leave}>
  <video class="gohei-video" autoPlay={true} controls={true}
         loop={loop} muted={muted} volume={volume} ref={$el => this._$video = $el}>
    <source src={webmUrl} type="video/webm" />
    <source src={mp4Url} type="video/mp4" />
  </video>
  <div class="gohei-button-area" style={style}>
    <button class="gohei-icon-btn gohei-close-btn gohei-icon-close" onClick={close} />
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
