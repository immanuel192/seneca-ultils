'use strict';
const MemStore1 = require('../../lib/MemStore');
const MemStore2 = require('../../lib/MemStore');
const assert = require('assert');

describe('#MemStore - DI', () => {
    let kv = null;
    before(() => {
        kv = MemStore1;
    });

    it('Should be registered as singleton object', () => {
        const kv2 = MemStore2;
        assert.deepEqual(kv2, kv);
    });

    it('Should store object sucessfully', () => {
        const expectedValue = 123;
        const expectedKey = 'myTest';
        try {
            kv.register(expectedKey, expectedValue);
            assert.deepEqual(kv.resolve(expectedKey), expectedValue);
        }
        catch (ex) {
            assert.ifError(ex);
        }
    });

    it('should return undefined when we resolve object which is not registered', () => {
        const t = kv.resolve('test1123432423');
        assert.deepEqual(t, undefined);
    });

    it('should replace the registered', () => {
        const expectObject = { a: 1 };
        const expectObject2 = { a: 1 };
        kv.register('myObj123', expectObject);
        kv.register('myObj123', expectObject2);
        assert.notEqual(kv.resolve('myObj123'), expectObject);
    });

    describe('Dto', () => {
        const type = 'myType';
        const subtype = 'mySubType';
        const actualInp = 123;

        it('should register dto with correct key', () => {
            const expectKey = `dto-${type}-${subtype}`;
            kv.registerDto(type, subtype, actualInp);
            assert.strictEqual(kv.resolve(expectKey), actualInp);
        });

        it('should register dto with correct key', () => {
            kv.registerDto(type, subtype, actualInp);
            assert.strictEqual(kv.resolveDto(type, subtype), actualInp);
        });
    });

    describe('remove', () => {
        it('should return true if remove existing key', () => {
            const actualInp = 123;
            const key = 'myKey123';
            kv.register(key, actualInp);
            const res = kv.remove(key);
            assert.strictEqual(kv.resolve(key), undefined);
            assert.equal(res, true);
        });

        it('should return null if remove non-exist key', () => {
            const key = 'myKey12343242342';
            const res = kv.remove(key);
            assert.strictEqual(res, null);
        });
    });
});