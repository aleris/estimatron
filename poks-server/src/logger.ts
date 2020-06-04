import * as winston from 'winston'
import { LoggingWinston } from '@google-cloud/logging-winston'
import * as Transport from 'winston-transport'

const console = new winston.transports.Console({
    format: winston.format.simple()
})
const loggingWinston = new LoggingWinston({
    projectId: process.env.GOOGLE_PROJECT_ID,
    logName: 'poks-server'
})

const level = process.env.LOG_LEVEL || 'info'

const env = process.env.NODE_ENV

const transports = new Array<Transport>()
const isDev = env === 'dev'
if (isDev) {
    // transports.push(console, loggingWinston)
    transports.push(console)
} else {
    transports.push(loggingWinston)
}

export const logger = winston.createLogger({
    level,
    defaultMeta: { env },
    transports
})

logger.exceptions.handle(loggingWinston)
