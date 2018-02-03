'use strict';
import { F } from '~/common/util';

export function hasChanged(self, nextProps, nextState) {
    let { props, state } = self;

    for (let prop in nextProps) {
        if (props[prop] !== nextProps[prop]) return true;
    }
    for (let prop in nextState) {
        if (state[prop] !== nextState[prop]) return true;
    }

    return false;
}

export const TASK_STATUS_TEXT = F({
    null: '',
    stanby: '待機中',
    posting: '送信中',
    complete: '完了',
    cancel: 'キャンセル',
    error: 'エラー'
});

export function ellipsisify(text, length) {
    if (text == null) return null;
    if (text.length <= length) return text;
    return `${text.substr(0, length)}...`;
}

export function preventDefault(event) {
    event.preventDefault();
}

export function stopPropagation(event) {
    event.stopPropagation();
}
