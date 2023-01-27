const {createLogger, format, transports} = require("winston");
const {timestamp, metadata, colorize, errors, printf} = format;

function debug() {
    let transport = logger.transports.find(transport => {
        return transport.level === "info";
    });
    transport.level = "debug";
}

const customFormat = format.combine(
    timestamp({
        format: "YYYY-MM-DD HH:mm:ss"
    }),
    errors({stack: true}),
    colorize(),
    metadata({fillExcept: ["level", "message", "timestamp"]}),
    printf(info => {
        let out = `[${info.timestamp} ${info.level}]: ${info.message}`;

        if (info.metadata && Object.keys(info.metadata).length > 0) {
            out += " ";
            out += JSON.stringify(info.metadata);
        }

        if (info.stack) {
            out += " - ";
            out += info.stack;
        }

        return out;
    })
);

global.logger = createLogger({
    level: "debug",
    format: customFormat,
    exitOnError: false,
    transports: [
        new transports.Console({
            level: "info",
            handleExceptions: true
        })
    ]
});
logger.debug = (message, object) => {
    logger.log("debug", message, object);
};

module.exports.debug = debug;