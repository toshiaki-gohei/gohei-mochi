'use strict';
import assert from 'assert';
import DropBox from '~/content/views/thread/form-post/drop-box.jsx';
import React from 'react';
import { simulate, mount, unmount } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import { sleep } from '~/content/util';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let $el;
    afterEach(() => unmount($el));

    describe('render()', () => {
        it('should render drop box', () => {
            $el = mount(<DropBox />);
            let got = $el.outerHTML;
            let exp = '<div class="gohei-drop-box">ここにファイルをドロップ</div>';
            assert(got === exp);
        });
    });

    describe('event', () => {
        it('should handle drop event', done => {
            let setFiles = files => {
                assert(files === 'dummy files');
                done();
            };

            $el = mount(<DropBox {...{ setFiles }} />);
            let dataTransfer = { files: 'dummy files' };
            simulate.drop($el.querySelector('.gohei-drop-box'), { dataTransfer });
        });

        it('should set state correctly if dragenter -> dragover -> dragleave', async () => {
            $el = mount(<DropBox />);

            assert($el._isInsideDragArea === false);
            assert($el._isInsideChildren === false);
            assert($el.state.isVisible === false);

            // dragenter($body) ->
            // dragover: dragenter($dropbox) -> dragleave($body) ->
            // dragover: dragenter($body) -> dragleave($dropbox) ->
            // dragleave($body)
            let $body = document.body;
            let $box = $el.querySelector('.gohei-drop-box');

            $body.dispatchEvent(new window.Event('dragenter'));
            await sleep(1);
            assert($el._isInsideDragArea === true);
            assert($el._isInsideChildren === false);
            assert($el.state.isVisible === true);

            $box.dispatchEvent(new window.Event('dragenter', { bubbles: true }));
            await sleep(1);
            assert($el._isInsideDragArea === true);
            assert($el._isInsideChildren === true);
            assert($el.state.isVisible === true);

            $body.dispatchEvent(new window.Event('dragleave'));
            await sleep(1);
            assert($el._isInsideDragArea === true);
            assert($el._isInsideChildren === false);
            assert($el.state.isVisible === true);

            $body.dispatchEvent(new window.Event('dragenter'));
            await sleep(1);
            assert($el._isInsideDragArea === true);
            assert($el._isInsideChildren === true);
            assert($el.state.isVisible === true);

            $box.dispatchEvent(new window.Event('dragleave', { bubbles: true }));
            await sleep(1);
            assert($el._isInsideDragArea === true);
            assert($el._isInsideChildren === false);
            assert($el.state.isVisible === true);

            $body.dispatchEvent(new window.Event('dragleave'));
            await sleep(1);
            assert($el._isInsideDragArea === false);
            assert($el._isInsideChildren === false);
            assert($el.state.isVisible === false);
        });
    });
});
