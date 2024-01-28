import * as fs from 'fs';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import TransportStream from 'winston-transport'; // Import TransportStream

const env = process.env.NODE_ENV || 'development';

const isDevelopmentEnvironment = env === 'development';

const levels = () => {
  if (!isDevelopmentEnvironment) {
    return winston.config.syslog.levels;
  }
  return winston.config.npm.levels;
};

// Define log format
const logFormat = winston.format.printf(
  ({ timestamp, level, message }) => `${timestamp}  ${level}: ${message}`,
);

const transports: TransportStream[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.splat(),
      winston.format.colorize(),
    ),
  }),
];

if (isDevelopmentEnvironment) {
  const logDir = `${__dirname}/../../logs`;

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  transports.push(
    new winston.transports.DailyRotateFile({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      dirname: `${logDir}/debug`,
      filename: `%DATE%.log`,
      maxFiles: 30,
      json: false,
      zippedArchive: true,
    }),
    new winston.transports.DailyRotateFile({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      dirname: `${logDir}/debug`,
      filename: `%DATE%.log`,
      maxFiles: 30,
      json: false,
      zippedArchive: true,
    }),
  );
}

const logger = winston.createLogger({
  levels: levels(),
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    logFormat,
  ),
  transports,
});

const stream = {
  write: (message: string) => {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

export { logger, stream };
