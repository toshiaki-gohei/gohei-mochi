'use strict';
import { h } from 'preact';
import { CLASS_NAME as CN } from '~/content/constants';

export default function PopupContainer({ commit, popups = new Map() }) {
    let $popups = [];
    for (let [ , popup ] of popups) {
        let { component: Popup, id, props = {} } = popup;
        let style = { ...props.style };
        let classStr = props.class ? `${CN.POPUP} ${props.class}` : CN.POPUP;
        $popups.push(<Popup {...{ commit, id, ...props, class: classStr, style }} key={id} />);
    }

    return <div class="gohei-popup-container">{$popups}</div>;
}
