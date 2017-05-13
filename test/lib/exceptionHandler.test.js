'use strict';
const ExceptionHandler = require('../../lib/exceptionHandler');
const sinon = require('sinon');
const assert = require('assert');

const fakeLogger = {
    info: sinon.spy(),
    error: sinon.spy()
};
const seneca = new (function seneca() {
    this.close = sinon.spy();
    this.closeAsync = sinon.spy(() => {
        return Promise.resolve(null);
    });
})();

const ProcessHandler = new (function ProcessHandler() {
    this.exit = sinon.spy();

    this.eventHandlers = {};

    this.on = (event, callback) => {
        this.eventHandlers[event] = callback;
    };

    this.invoke = (event) => {
        const params = {
            message: 'error message',
            stack: 'error stack'
        };

        if (this.eventHandlers[event]) {
            return this.eventHandlers[event](params);
        }

        return null;
    };
})();


describe('Seneca - exceptionHandler', () => {
    before(() => {
        ExceptionHandler(seneca, fakeLogger, ProcessHandler);
    });

    it('should call seneca.close when SIGTERM', () => {
        seneca.close.reset();
        ProcessHandler.invoke('SIGTERM');
        assert.equal(seneca.close.called, true);
    });

    it('should call seneca.closeAsync when SIGINT', () => {
        seneca.closeAsync.reset();
        ProcessHandler.exit.reset();
        ProcessHandler.invoke('SIGINT');
        assert.equal(seneca.closeAsync.called, true);
    });

    it('should call seneca.closeAsync when uncaughtException', () => {
        seneca.closeAsync.reset();
        ProcessHandler.exit.reset();
        ProcessHandler.invoke('uncaughtException');
        assert.equal(seneca.closeAsync.called, true);
    });

    it('should show log info message when unhandledRejection', () => {
        fakeLogger.info.reset();
        ProcessHandler.invoke('unhandledRejection');
        assert.equal(fakeLogger.info.called, true);
    });
});