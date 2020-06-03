import * as winston from 'winston'
import { LoggingWinston } from '@google-cloud/logging-winston'

const loggingWinston = new LoggingWinston({
    logName: 'poks-server'
})

const isDev = process.env.NODE_ENV === 'dev'

export const logger = winston.createLogger({
    level: 'info', // isDev ? 'info' : 'error'
    defaultMeta: { env: process.env.NODE_ENV },
    transports: [
        loggingWinston,
    ],
})

logger.exceptions.handle(loggingWinston)

if (isDev) {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }))
}
