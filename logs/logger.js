const winston = require('winston');
const moment = require('moment');

module.exports.logger = winston.createLogger({
    exitOnError: false,
    transports: [
      new winston.transports.File({ filename: `./logs/logs.${moment().format('YYYY.MM.DD')}.log` }),
    ],
});

module.exports.log = (level, message) => this.logger.log({
    level,
    message: `${moment().format('YYYY-MM-DD HH:mm:ss')} | ${message}`,
})