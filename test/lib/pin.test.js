'use strict';
const assert = require('assert');
const _ = require('lodash');
const pin = require('../../lib/pin');

describe('Pin', () => {
    it('should merge pin in string', () => {
        const p1 = 'a:1';
        const p2 = 'b:2,c:d';
        const expect = {
            a: 1,
            b: 2,
            c: 'd'
        };
        const ret = pin(p1, p2);
        assert.equal(_.isEqual(ret, expect), true);
    });

    it('should merge pin in object format', () => {
        const p1 = 'a:1';
        const p2 = {
            b: 2,
            c: 'd'
        };
        const expect = {
            a: 1,
            b: 2,
            c: 'd'
        };
        const ret = pin(p1, p2);
        assert.equal(_.isEqual(ret, expect), true);
    });

    it('should throw error if pin is not string', () => {
        const expectError = 'Pin is either string or object';
        const p1 = [];
        const p2 = {};
        try {
            pin(p1, p2);
            throw new Error('mergePin executed successfully with wrong pin format');
        }
        catch (err) {
            assert.equal(err.message, expectError);
        }
    });
});