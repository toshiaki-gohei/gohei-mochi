'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';

export const simulate = Simulate;

export function render($component) {
    let $c = $component;
    if (isFunctional($c)) $c = createWrappedComponent($c);

    let $container = document.createElement('div');

    // eslint-disable-next-line react/no-render-return-value
    let $inst = ReactDOM.render($c, $container);

    return elementify($inst, $container);
}

function isFunctional($component) {
    if (typeof $component.type === 'string') return false;
    if ($component.type.prototype.render) return false;
    return true;
}

function createWrappedComponent({ type: Component, props }) {
    class Wrapper extends React.Component {
        render() {
            return <Component {...props} />;
        }
    }
    return <Wrapper />;
}

function elementify($instance, $container) {
    let $inst = $instance;
    if ($inst instanceof window.HTMLElement) return $inst;

    let $el = $container.firstChild;

    Object.defineProperty($inst, 'outerHTML', {
        get: () => { return $el == null ? null : $el.outerHTML; }
    });

    $inst.querySelector = query => $container.querySelector(query);
    $inst.querySelectorAll = query => $container.querySelectorAll(query);

    return $inst;
}
