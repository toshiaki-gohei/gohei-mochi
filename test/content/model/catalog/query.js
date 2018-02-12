'use strict';
import assert from 'assert';
import Query from '~/content/model/catalog/query';

describe(__filename, () => {
    describe('constructor()', () => {
        it('should create query', () => {
            let q = new Query({ title: 'query' });
            assert(q);

            assert(q.title === 'query');
            assert(q.and === false);
            assert(q.or === false);
        });

        it('should be freeze', () => {
            let q = new Query('query');

            let got = 0;
            try { q.foo = 'bar'; } catch (e) {
                assert(e instanceof TypeError);
                ++got;
            }
            assert(got === 1);
            try { q.title = 'foo bar'; } catch (e) {
                assert(e instanceof TypeError);
                ++got;
            }
            assert(got === 2);
        });
    });

    describe('object()', () => {
        it('should return object', () => {
            let q = new Query({ title: 'foo bar', or: true });

            let got = q.object();
            let exp = {
                title: 'foo bar',
                and: false, or: true
            };
            assert.deepStrictEqual(got, exp);
        });
    });
});
