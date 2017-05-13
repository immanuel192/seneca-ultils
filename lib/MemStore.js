'use strict';

const kvCol = {};
/**
 * Key / value mem store
 * This class is singleton
 *
 * @class MemStore
 */
class MemStore {

    remove(key) {
        if (Object.prototype.hasOwnProperty.call(kvCol, key)) {
            delete kvCol[key];
        }
        return null;
    }

    /**
     * Register object with a name
     *
     * @param {string} name
     * @param {any} obj
     */
    register(name, obj) {
        kvCol[name] = obj;
    }

    /**
     * Resolve a registered name
     *
     * @param {string} name
     * @return {mixed}
     */
    resolve(name) {
        return Object.prototype.hasOwnProperty.call(kvCol, name) ? kvCol[name] : undefined;
    }

    /**
     * Register Dto by field type
     *
     * @param {String} type
     * @param {String} subtype
     * @param {Object} obj
     *
     * @memberof MemStore
     */
    registerDto(type, subtype, obj) {
        this.register(`dto-${type}-${subtype}`, obj);
    }

    resolveDto(type, subtype) {
        return this.resolve(`dto-${type}-${subtype}`);
    }
}

module.exports = exports = new MemStore();