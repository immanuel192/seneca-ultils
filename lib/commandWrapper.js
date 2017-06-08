
'use strict';
const _ = require('lodash');
const { kv } = require('dtobase');
const Jsonic = require('jsonic');

let logger;

/**
* Accept any kind of Error, and return formated type of it
* @param  {Error} err
*/
function encapsulateError(err) {
    // senecajs only allow you to return array or object
    if (err instanceof Error) {
        return err.message;
    }
    return err;
}

/**
 * Resolve dto model
 *
 * @param {Object} inp
 * @param {String} dtoType
 * @param {String} dtoSubType
 * @return {Promise}
 */
function resolveDto(inp, dtoType, dtoSubType) {
    const DtoClass = dtoType && kv.resolveDto(dtoType, dtoSubType);
    if (!DtoClass) {
        if (dtoType) {
            return Promise.reject(new Error(`Dto ${dtoType} is not found`));
        }
        return Promise.resolve(inp);
    }
    return DtoClass.fromViewModel(inp);
}

/**
 * Wrap a seneca function to return an object as below
 * {
 *      success: true / false
 *      result: data-result
 * }
 */
function wrapCommand(cmdName, func, dtoClassType = null, dtoClassSubType = '') {
    return function commandWrapper(...args) {
        const done = args[1];
        const params = _.clone(args[0]);

        const callback = function handleCallback(arg1, arg2) {
            if (arg1 === null) {
                // sucess case, we need to encapsulate the result into object form like { success: bool, data: Object }
                return done(arg1, {
                    success: true,
                    data: arg2
                });
            }

            // try to log fatal error
            logger.error(`#${cmdName} - Exception - ${arg1.message || arg1} - ${Jsonic.stringify(params)}`, arg1);

            done(null, {
                success: false,
                data: encapsulateError(arg1)
            });

            // dont return anything
            return null;
        };

        logger.info(`#${cmdName} - Invoking: ${Jsonic.stringify(params)}`);

        resolveDto(params, dtoClassType, dtoClassSubType)
            .then((inp) => {
                return func.call(this, inp, callback);
            })
            .then((ret) => {
                if (ret) {
                    return callback(null, ret);
                }
                return null;
            })
            .catch((err) => {
                return callback(err);
            });

        return null;
    };
}

wrapCommand.setDependencies = (_logger) => {
    logger = _logger;
};

module.exports = wrapCommand;