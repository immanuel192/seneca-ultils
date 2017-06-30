/**
 * Module wrapper for senecajs as a Listener
 */
'use strict';
const TRANSPORT_AMQP = 'amqp';
const promisify = require('./lib/promisify');
const Seneca = require('seneca');
const MemStore = require('./lib/MemStore');
const MergePin = require('./lib/pin');
const CommandWrapper = require('./lib/commandWrapper');
const errorHandler = require('./lib/exceptionHandler');
const TransportAmqp = require('./lib/amqpTransport');

let kv;

function initSeneca(seneca) {
    // && seneca.private$.exports
    if (!(seneca.private$ && seneca.private$.exports && seneca.private$.exports['fire-and-forget'])) {
        seneca.use('fire-and-forget');
    }
    promisify.apply(seneca);
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
        if (args.length === 1 && Object.prototype.hasOwnProperty.call(args[0], 'pin')) {
            if (Object.prototype.hasOwnProperty.call(args[0], 'Func')
            && typeof args[0] === 'object'
            && typeof (args[0].Func) === 'function') {
                return this.loadCommand(args[0].pin, args[0].Func, args[0].name);
            }
            else if (
                Object.prototype.hasOwnProperty.call(args[0], 'name')
            && typeof args[0] === 'function'
            ) {
                return this.loadCommand(args[0].pin, args[0], args[0].name);
            }
        }
        else if (args.length === 3 && typeof args[1] === 'function') {
            // pin, commandClass, cmdName
            const CommandClass = args[1];
            const serviceInstance = new CommandClass();

            const finalPin = MergePin(this.config.pin, args[0]);

            this.seneca.add.call(this.seneca, finalPin, CommandWrapper(args[2], serviceInstance.func.bind(serviceInstance), CommandClass.dtoType, CommandClass.dtoSubType, CommandClass.dtoResultType, CommandClass.dtoResultSubType));
            this.logger.info(`Loaded command ${args[2]}`);

            return true;
        }
        return false;
    }

    listen() {
        initSeneca(this.seneca, this.logger);
        errorHandler.call(null, this.seneca, this.logger);

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
            initSeneca(this.seneca);
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