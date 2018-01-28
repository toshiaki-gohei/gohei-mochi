'use strict';
import React, { Component } from 'react';
import * as preferences from '../../../model/preferences';

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
