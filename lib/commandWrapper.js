
'use strict';
const _ = require('lodash');

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
 * Wrap a seneca function to return an object as below
 * {
 *      success: true / false
 *      result: data-result
 * }
 */
function wrapCommand(cmdName, func) {
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
            logger.error(`#${cmdName} - Exception - ${arg1.message || arg1} - ${JSON.stringify(params)}`, arg1);

            done(null, {
                success: false,
                data: encapsulateError(arg1)
            });

            // dont return anything
            return null;
        };

        logger.info(`#${cmdName} - Invoking: ${JSON.stringify(params)}`);
        try {
            const ret = func.call(this, params, callback);
            if (ret) {
                if ((typeof ret.then === 'function')) {
                    return ret.then((data) => {
                        return callback(null, data);
                    }).catch((err) => {
                        return callback(err);
                    });
                }
                return callback(null, ret);
            }
        }
        catch (err) {
            return callback(err);
        }

        return null;
    };
}

wrapCommand.setDependencies = (_logger) => {
    logger = _logger;
};

module.exports = wrapCommand;