'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import { Simulate } from 'react-dom/test-utils';

export const simulate = Simulate;

export function render($component, $container) {
    $container = $container || document.createElement('div');

    let $c = $component;
    if (isFunctional($c)) $c = createWrappedComponent($c);

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

    let $el = $container.firstElementChild;

    Object.defineProperties($inst, {
        'outerHTML': {
            get: () => { return $el == null ? null : $el.outerHTML; }
        },
        'parentElement': {
            get: () => { return $el == null ? null : $el.parentElement; }
        }
    });

    $inst.querySelector = query => $container.querySelector(query);
    $inst.querySelectorAll = query => $container.querySelectorAll(query);

    return $inst;
}

export function mount($component) {
    document.body.innerHTML = '<div></div>';
    return render($component, document.body.firstElementChild);
}

export function unmount($el) {
    if ($el == null) return;
    ReactDOM.unmountComponentAtNode($el.parentElement);
    document.body.innerHTML = '';
}
