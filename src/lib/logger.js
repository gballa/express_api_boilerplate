import { createLogger, format, transports } from 'winston'

const { combine, timestamp, printf} = format

const myFormat = printf( ({ level, message, timestamp , ...metadata}) => {
    let msg = `[${timestamp}] ${level}: ${message}`
    if(metadata && !!Object.entries(metadata).length) {
        msg += JSON.stringify(metadata)
    }
    return msg
});

const logger = createLogger({
    level: 'debug',
    format: combine(
        format.colorize(),
        // label({ label: NODE_APP_NAME }),
        // splat(),
        // prettyPrint(),
        timestamp(),
        myFormat
    ),
    transports: [
        new transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true}),
    ],
    exitOnError: false
})

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
    // eslint-disable-next-line no-unused-vars
    write: function(message, encoding) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message);
    },
};

export default logger
