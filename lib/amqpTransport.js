'use strict';

class AmqpTransportWrapper {
    constructor(seneca, config) {
        this.seneca = seneca;
        this.config = config;
    }

    configure() {
        if (!this.loaded()) {
            this.seneca.use('seneca-amqp-transport');
        }
    }

    loaded() {
        return !!(this.seneca.private$ && this.seneca.private$.exports && Object.prototype.hasOwnProperty.call(this.seneca.private$.exports, 'seneca-amqp-transport'));
    }

    listen() {
        const defaultConfig = {
            type: 'amqp',
            timeout: 3000
        };
        const { pin, rabbitUrl, name, exchange, listener } = this.config;
        const config = Object.assign({}, defaultConfig, {
            pin,
            url: rabbitUrl,
            name,
            exchange,
            listener
        });
        Object.keys(config).forEach(key => config[key] === undefined && delete config[key]);

        this.seneca.listen(config);

        return this.seneca
            .readyAsync();
    }

    client(pin) {
        // create new key
        return this.seneca.clientAsync({
            type: 'amqp',
            timeout: 5000, // ms
            pin,
            url: this.config.rabbitUrl
        });
    }
}

module.exports = AmqpTransportWrapper;