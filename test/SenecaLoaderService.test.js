'use strict';
const assert = require('assert');
const sinon = require('sinon');
const _ = require('lodash');
const ChatService = require('../SenecaLoaderService');

const config = {
    env: 'development',
    rabbitUrl: 'amqp://localhost',
    transport: 'amqp',
    pin: 'service:chat',
    printInfo: false,
    redis: {
        host: '127.0.0.1',
        port: 6379
    }
};
const sandbox = sinon.sandbox.create();
const seneca = new (function seneca() {
    this.closeAsync = sandbox.spy();
    this.clientAsync = sandbox.stub();
    this.use = sandbox.spy();
    this.add = sandbox.spy();
    this.listen = sandbox.spy();
    this.ready = sandbox.spy();
})();
const MemStoreFake = {
    register: sinon.spy(),
    resolve: sinon.stub()
};
const FakeLogger = {
    info: sandbox.spy()
};
const FakeCommand = {
    pin: 'cmd:myCommand',
    Func: function myCommand() {
        this.func = sinon.spy();
    },
    name: 'myCommand'
};

const FakeCommand2 = class {
    static get pin() {
        return 'cmd:myCommand2';
    }

    static get name() {
        return 'myCommand2';
    }

    func() {
        return null;
    }
};
let serviceInstance;

describe('SenecaHelperService', () => {
    before(() => {
        MemStoreFake.resolve.withArgs('logger').returns(FakeLogger);
        serviceInstance = new ChatService(seneca, config, MemStoreFake);
    });

    afterEach(() => {
        sandbox.reset();
        seneca._init = false;
    });

    describe('close', () => {
        it('should call function closeAsync', () => {
            serviceInstance.close();
            assert.equal(seneca.closeAsync.called, true);
        });
    });

    describe('listen', () => {
        beforeEach(() => {
            seneca.readyAsync = sinon.stub().returns({
                then: (callback) => {
                    callback();
                }
            });
        });

        it('should call seneca.use for fire-and-forget and amqp transport when transport is amqp', () => {
            serviceInstance.listen();
            assert.equal(seneca.use.calledTwice, true);
            assert.equal(seneca.use.firstCall.calledWith('fire-and-forget'), true);
            assert.equal(seneca.use.secondCall.calledWith('seneca-amqp-transport'), true);
            assert.equal(seneca.readyAsync.called, true);
        });

        it('should call seneca.use for fire-and-forget when dont use aqmp transport', () => {
            const testConfig = {
                pin: 'service:chat',
                transport: '',
                printInfo: false
            };
            const testInstance = new ChatService(seneca, testConfig, MemStoreFake);
            testInstance.listen();
            assert.equal(seneca.use.callCount, 1);
            assert.equal(seneca.use.firstCall.calledWith('fire-and-forget'), true);
        });

        it('should ignore to load fire-and-forget, promisify if already loaded', () => {
            const testConfig = {
                pin: 'service:chat',
                transport: '',
                printInfo: false
            };
            seneca.private$ = {
                exports: {
                    'fire-and-forget': {}
                }
            };
            const testInstance = new ChatService(seneca, testConfig, MemStoreFake);
            testInstance.listen();
            assert.equal(seneca.use.callCount, 0);
        });
    });

    describe('client', () => {
        it('should return registered client if any', () => {
            const pin = 'cmd:test123';
            const clientKey = `seneca-client-${pin}`;
            const expectdReturn = 123;
            MemStoreFake.resolve.withArgs(clientKey).returns(expectdReturn);
            return serviceInstance.client(pin)
                .then((c) => {
                    assert.equal(MemStoreFake.resolve.calledWith(clientKey), true);
                    assert.strictEqual(c, expectdReturn);
                    MemStoreFake.resolve.reset();
                });
        });

        it('should return seneca instance if not amqp transport', () => {
            const pin = 'cmd:test1234';
            config.transport = '';
            seneca.testProperty = '123';

            return serviceInstance.client(pin)
                .then((c) => {
                    assert.equal(Object.prototype.hasOwnProperty.call(c, 'testProperty'), true);
                    assert.equal(c.testProperty, seneca.testProperty);
                    config.transport = 'amqp';
                    delete seneca.testProperty;
                });
        });

        it('should return seneca client instance if amqp transport', () => {
            const pin = 'cmd:test12345';
            seneca.clientAsync.resolves({ pin });
            const handler = serviceInstance.client(pin);
            return handler
                .then((c) => {
                    assert.equal(c.pin, pin);
                });
        });
    });

    describe('loadCommand', () => {
        it('should return false when could not load command', () => {
            const res = serviceInstance.loadCommand();
            assert.equal(res, false);
        });

        it('shoud load command', () => {
            seneca.add.reset();
            FakeLogger.info.reset();
            const expectCalledWith = {
                service: 'chat',
                cmd: 'myCommand'
            };
            const res = serviceInstance.loadCommand(FakeCommand.pin, FakeCommand.Func, FakeCommand.name);
            assert.equal(seneca.add.called, true);
            assert.equal(_.isEqual(seneca.add.args[0][0], expectCalledWith), true);
            assert.equal(FakeLogger.info.called, true);
            assert.equal(res, true);
        });

        it('should return true when load command as object', () => {
            const res = serviceInstance.loadCommand(FakeCommand);
            assert.equal(res, true);
        });

        it('should return true when load command as a class', () => {
            const res = serviceInstance.loadCommand(FakeCommand2);
            assert.equal(res, true);
        });
    });
});