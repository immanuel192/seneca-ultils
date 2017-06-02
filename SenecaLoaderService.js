/**
 * Module wrapper for senecajs as a Listener
 */
'use strict';
const TRANSPORT_AMQP = 'amqp';
const promisify = require('./lib/promisify');
const Seneca = require('seneca');
const MemStore = require('./lib/MemStore');
const CommandWrapper = require('./lib/commandWrapper');
const errorHandler = require('./lib/exceptionHandler');
const TransportAmqp = require('./lib/amqpTransport');

let kv;

function initSeneca(seneca, logger) {
    seneca.use('fire-and-forget');
    promisify.apply(seneca);
    errorHandler.call(null, seneca, logger);
}

class SenecaLoaderService {
    constructor(_seneca, _config, _memStore) {
        kv = _memStore || MemStore;
        this.logger = kv.resolve('logger');
        this.config = _config || kv.resolve('config');
        this.seneca = _seneca || Seneca();
        CommandWrapper.setDependencies(this.logger);
    }

    close() {
        return this.seneca.closeAsync();
    }

    loadCommand(...args) {
        if (
            args.length === 1
            && typeof args[0] === 'object'
            && Object.prototype.hasOwnProperty.call(args[0], 'pin')
            && Object.prototype.hasOwnProperty.call(args[0], 'Func')
            && typeof (args[0].Func) === 'function') {
            return this.loadCommand(args[0].pin, args[0].Func, args[0].name);
        }
        else if (args.length === 3 && typeof args[1] === 'function') {
            const serviceInstance = new args[1]();
            this.seneca.add(args[0], CommandWrapper(args[2], serviceInstance.func.bind(serviceInstance), serviceInstance.dtoType, serviceInstance.dtoSubType));
            this.logger.info(`Loaded command ${args[2]}`);

            return true;
        }
        return false;
    }

    listen() {
        initSeneca(this.seneca, this.logger);

        let ret;
        if (this.config.transport === TRANSPORT_AMQP) {
            const transportWrapper = new TransportAmqp(this.seneca, this.config);
            transportWrapper.configure();
            ret = transportWrapper.listen();
        }
        else {
            ret = Promise.resolve(this.seneca);
        }

        return ret.then(function handleListen() {
            kv.register('seneca', this.seneca);

            this.logger.info('Service started');
            return this.seneca;
        }.bind(this));
    }

    /**
     * Get client by pin
     *
     * @param {String} pin
     *
     * @memberof ChatConsumerService
     */
    client(pin) {
        const clientKey = `seneca-client-${pin}`;
        let client = kv.resolve(clientKey);
        const existClient = !!client;

        if (!existClient) {
            if (this.config.transport === TRANSPORT_AMQP) {
                const transportWrapper = new TransportAmqp(this.seneca, this.config);
                transportWrapper.configure();
                client = transportWrapper.client(pin);
            }
            else {
                client = Promise.resolve(this.seneca);
            }
        }
        else {
            client = Promise.resolve(client);
        }

        return client.then((c) => {
            if (!existClient) {
                kv.register(clientKey, c);
            }
            return c;
        });
    }
}

module.exports = SenecaLoaderService;