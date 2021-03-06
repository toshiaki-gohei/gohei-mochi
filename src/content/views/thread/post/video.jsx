'use strict';
import React, { Component, Fragment } from 'react';

export default class Video extends Component {
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

        let styleBtn = isActive ? null : { display: 'none' };

        return (
<div className="gohei-video-container" onMouseEnter={enter} onMouseLeave={leave}>
  <video className="gohei-video" style={styleVideo} ref={$el => this._$video = $el}
         autoPlay={true} controls={true} loop={loop} muted={muted} volume={volume}
         onLoadedMetadata={loadedMetadata}>
    <Sources {...{ file }} />
  </video>
  <div className="gohei-button-area" style={styleBtn}>
    <button className="gohei-icon-btn gohei-close-btn gohei-icon-close" onClick={close} />
  </div>
</div>
        );
    }
}

function Sources({ file }) {
    if (file.isWebm()) {
        let mp4Url = file.url.replace(/\.webm$/, '.mp4');
        return (
<Fragment>
  <source src={file.url} type="video/webm" />
  <source src={mp4Url} type="video/mp4" />
</Fragment>
        );
    } else if (file.isMp4()) {
        return <source src={file.url} type="video/mp4" />;
    }

    return null;
}

function handleSetVideoPrefs() {
    let { commit } = this.props;
    let { loop, muted, volume } = this._$video;

    let video = { loop, muted, volume };
    commit('preferences/save', { video });
}
