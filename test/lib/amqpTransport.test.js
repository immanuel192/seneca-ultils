'use strict';
const Transport = require('../../lib/amqpTransport');
const sinon = require('sinon');
const assert = require('assert');

const seneca = new (function seneca() {
    this.use = sinon.spy();
    this.listen = sinon.spy();
    this.readyAsync = sinon.spy();
    this.clientAsync = sinon.spy();
})();
const config = {
    rabbitUrl: 'amqp://localhost',
    pin: 'service:myService'
};
let transportInstance;

function fakeUseAmqp() {
    seneca.private$ = {};
    seneca.private$.exports = {};
    seneca.private$.exports['seneca-amqp-transport'] = {};
}

describe('Seneca - AMQP Transport', () => {
    before(() => {
        transportInstance = new Transport(seneca, config);
    });

    describe('configure', () => {
        it('should call seneca.use', () => {
            seneca.use.reset();
            transportInstance.configure();
            assert.equal(seneca.use.calledWith('seneca-amqp-transport'), true);
        });

        it('should not call use when transport loaded', () => {
            seneca.use.reset();
            fakeUseAmqp();
            transportInstance.configure();
            assert.equal(seneca.use.calledWith('seneca-amqp-transport'), false);
        });
    });

    describe('listen', () => {
        it('should call seneca.listen', () => {
            seneca.listen.reset();
            seneca.readyAsync.reset();

            transportInstance.listen();
            const expectCalledParams = {
                type: 'amqp',
                timeout: 3000,
                pin: config.pin,
                url: config.rabbitUrl
            };
            assert.equal(seneca.listen.calledWith(expectCalledParams), true);
            assert.equal(seneca.readyAsync.called, true);
        });
    });

    describe('loaded', () => {
        it('should return true if loaded amqp transport', () => {
            fakeUseAmqp();
            assert.equal(transportInstance.loaded(), true);
        });

        it('should return false if not loaded amqp transport', () => {
            delete seneca.private$;
            assert.equal(transportInstance.loaded(), false);
        });
    });

    describe('client', () => {
        it('should call clientAsync', () => {
            seneca.clientAsync.reset();
            const pin = '123';
            const expectClientCalled = {
                type: 'amqp',
                timeout: 5000, // ms
                pin,
                url: config.rabbitUrl
            };
            transportInstance.client(pin);
            assert.equal(seneca.clientAsync.calledWith(expectClientCalled), true);
        });
    });
});