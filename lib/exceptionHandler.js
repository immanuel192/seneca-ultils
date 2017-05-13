'use strict';

module.exports = function errorHandlers(seneca, logger, handler) {
    const process = handler || global.process;

    process.on('SIGTERM', () => {
        logger.info('App closing SIGTERM');
        seneca.close();
    });

    process.on('SIGINT', () => {
        logger.info('App closing SIGINT');
        seneca.closeAsync().then(process.exit);
    });

    process.on('uncaughtException', (err) => {
        logger.error(`uncaughtException - ${err.message}`);
        logger.error(err.stack);
        seneca.closeAsync()
            .then(() => {
                process.exit(1);
            });
    });

    process.on('unhandledRejection', (reason, p) => {
        logger.info(`Unhandled Rejection at: Promise ${p}reason:${reason}`);
    });
};