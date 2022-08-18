const { transports, config, format, createLogger } = require('winston')
const { combine, timestamp, printf, splat, errors } = format;

const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (stack) {
    msg += `\n${stack}`;
  }
  return `${msg}\n`;
});

const fileFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let meta = { ...metadata };
  delete meta.stack;
  const log = {
    timestamp: timestamp,
    level: level,
    message: message,
    metadata: meta,
  }
  return JSON.stringify(log)
});

const options = {
  file: {
    level: 'info',
    filename: './logs/app.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    format: combine(
      splat(),
      timestamp(),
      errors({ stack: false }),
      fileFormat
    ),
  },
  human: {
    level: 'info',
    filename: './logs/app_readable.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
    format: combine(
      splat(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      consoleFormat
    ),
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    format: combine(
      splat(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      consoleFormat
    ),
  },
};

const logger = createLogger({
  levels: config.npm.levels,
  format: format.errors({ stack: true }),
  transports: [
    new transports.File({ ...options.file }),
    new transports.File({ ...options.human }),
    new transports.Console({ ...options.console })
  ],
  exitOnError: false
})

module.exports = logger