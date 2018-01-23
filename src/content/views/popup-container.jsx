'use strict';
import React from 'react';
import { CLASS_NAME as CN } from '~/content/constants';

export default function PopupContainer({ commit, popups = new Map() }) {
    let $popups = [];
    for (let [ , popup ] of popups) {
        let { component: Popup, id, props = {} } = popup;
        let { className, style, ...rest } = props;
        className = className ? `${CN.POPUP} ${className}` : CN.POPUP;
        $popups.push(<Popup {...{ commit, id, className, style, ...rest }} key={id} />);
    }

    return <div className="gohei-popup-container">{$popups}</div>;
}
