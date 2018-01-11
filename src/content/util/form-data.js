'use strict';
import { encode, isAscii } from './encoding';

// Unfortunately, can not create shift-jis data(not a file) in Web API FormData.
// e.g. formdata.append('name', <shift-jis data>)  // <- can not do this
// (don't convert all strings to numeric character reference and send them
// because transfer amount increases)
export default class FormData {
    constructor($form) {
        this._entries = [];
        this._boundary = genBoundary();

        if ($form) this._initEntries($form);
    }

    append(name, value, filename) {
        if (name == null) return;
        let entry = makeEntry(name, value, filename);
        this._entries.push(entry);
    }

    get(name) {
        for (let entry of this._entries) {
            if (name === entry.name) return entry.value;
        }
        return undefined;
    }

    set(name, value, filename) {
        if (name == null) return;
        let entry = makeEntry(name, value, filename);

        let foundIndex = this._entries.findIndex(e => e.name === name);
        if (foundIndex === -1) {
            this._entries.push(entry);
        } else {
            this._entries[foundIndex] = entry;
            this._entries = this._entries.filter((e, i) => e.name !== name || i === foundIndex);
        }
    }

    // cf. jsdom/lib/jsdom/living/xhr/FormData-impl.js
    //     https://html.spec.whatwg.org/multipage/forms.html#constructing-form-data-set
    _initEntries($form) {
        for (let $el of filter($form)) {
            let { type, name, value } = $el;

            if (type !== 'file') {
                this.append(name, value);
                continue;
            }

            let file = $el.files[0];
            if (file == null) continue;
            this.append(name, file, file.name);
        }
    }

    get headers() {
        return {
            method: 'post',
            'content-type': `multipart/form-data; boundary=${this._boundary}`
        };
    }

    entries() {
        return this._entries.map(entry => [ entry.name, entry.value ]);
    }

    blobify() {
        let entries = this._entries;
        if (entries.length === 0) return null;

        let data = [];
        for (let { name, value, filename } of entries) {
            let part = this._makePart(name, value, filename);
            data = data.concat(part);
        }

        data.push(`--${this._boundary}--\r\n`);

        return new window.Blob(data);
    }

    _makePart(name, value, filename) {
        let boundary = `--${this._boundary}\r\n`;

        let isFile = value instanceof window.File;

        let { header, body } = isFile
            ? this._makePartOfFile(name, value, filename)
            : this._makePartOfParameter(name, `${value}`);

        return [ boundary, ...header, '\r\n', body, '\r\n' ];
    }

    _makePartOfParameter(name, value) {
        let header = [
            `Content-Disposition: form-data; name="${name}"\r\n`
        ];
        let body = value;

        if (!isAscii(value)) {
            body = encode(value);
            header.push('Content-Type: text/plain; charset=Shift_JIS\r\n');
        }

        return { header, body };
    }

    _makePartOfFile(name, file, filename) {
        if (filename == null) filename = file.name;

        let type = file.type || 'application/octet-stream';

        let header = [
            `Content-Disposition: form-data; name="${name}"; filename="${filename}"\r\n`,
            `Content-Type: ${type}\r\n`
        ];
        let body = file;

        return { header, body };
    }
}

function genBoundary() {
    // Firefox: 0.orei357ouz
    // Chrome: 0.u412a83sgczq0ibxn8tpm0a4i
    let b1 = Math.random().toString(36).substr(2, 8);
    let b2 = Math.random().toString(36).substr(2, 8);
    return '----------gohei-mochi-' + b1 + b2;
}

function makeEntry(name, value = null, filename = null) {
    if (name == null) throw new TypeError('name is required');
    if (value instanceof window.File) {
        filename = filename == null ? value.name : filename;
    }
    return { name, value, filename };
}

const submittable = [
    'text', 'hidden', 'number', 'password', 'checkbox', 'radio', 'file',
    'select', 'textarea'
].reduce((obj, type) => { obj[type] = true; return obj; }, {});

function filter($form) {
    let ret = [];
    for (let $el of $form.elements) {
        let { type, name } = $el;

        let tagName = $el.tagName.toLowerCase();
        if (tagName === 'select') type = 'select';
        if (tagName === 'textarea') type = 'textarea';
        if (!submittable[type]) continue;

        if ($el.disabled) continue;
        if (type === 'checkbox' && !$el.checked) continue;
        if (type === 'radio' && !$el.checked) continue;
        if (name == null || name == '') continue;

        ret.push($el);
    }
    return ret;
}

export const internal = {
    genBoundary,
    makeEntry,
    filter
};
