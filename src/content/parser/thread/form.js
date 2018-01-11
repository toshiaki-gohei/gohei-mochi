'use strict';

export function parsePostform($body) {
    let $form = $body.querySelector('#fm');
    if ($form == null) return null;

    let action = $form.action;

    let $inputs = $body.querySelectorAll('#fm > input[type="hidden"]');
    let hiddens = [];
    for (let $input of $inputs) {
        let { name, value } = $input;
        hiddens.push({ name, value });
    }

    return { action, hiddens };
}

export function parseDelform($body) {
    // because delform url is the same as postform url, use postform url that is easy to parse
    let $form = $body.querySelector('#fm');
    if ($form == null) return null;

    let action = $form.action;

    return { action };
}
