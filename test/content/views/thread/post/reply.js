'use strict';
import assert from 'assert';
import Reply from '~/content/views/thread/post/reply.jsx';
import React from 'react';
import { render } from '@/support/react';
import { setup, teardown } from '@/support/dom';
import { Post } from '~/content/model';

describe(__filename, () => {
    before(() => setup());
    after(() => teardown());

    let post;
    beforeEach(() => post = new Post({ index: 1 }));

    describe('render()', () => {
        it('should render reply', () => {
            let $el = render(<Reply {...{ post }} />);

            let got = $el.outerHTML;
            let exp = new RegExp(`^
<div class="gohei-post gohei-reply">
<div class="gohei-post-header">.+?</div>
<blockquote class="gohei-post-body"></blockquote>
</div>
$`.replace(/\n/g, ''));
            assert(exp.test(got));
        });

        it('should render action if post is active', () => {
            let $el = render(<Reply {...{ post, isActive: true }} />);
            let got = $el.querySelector('.gohei-post-action');
            assert(got);
        });

        it('should not render reply if no props', () => {
            let $el = render(<Reply />);
            let got = $el.outerHTML;
            assert(got === null);
        });
    });
});
