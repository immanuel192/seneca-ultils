'use strict';
const _ = require('lodash');
const Jsonic = require('jsonic');

function PinToObject(pin) {
    if (_.isObjectLike(pin) && _.keys(pin).length > 0) {
        // make a copy of origin object for some cases we need to modify
        return _.merge({}, pin);
    }

    if (_.isString(pin)) {
        return Jsonic(pin);
    }
    throw new Error('Pin is either string or object');
}

/**
 * Merge pin 1 and pin into one pin
 *
 * @param {String|Object} pin1
 * @param {String|Object} pin2
 * @return {Object}
 */
function mergePin(pin1, pin2) {
    const myPin1 = PinToObject(pin1);
    const myPin2 = PinToObject(pin2);
    return _.merge(myPin1, myPin2);
}

module.exports = mergePin;