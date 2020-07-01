import * as winston from 'winston'
import { LoggingWinston } from '@google-cloud/logging-winston'
import * as Transport from 'winston-transport'

const console = new winston.transports.Console({
    format: winston.format.simple()
})

const file = new winston.transports.File({
    dirname: 'log',
    format: winston.format.simple()
})

const level = process.env.LOG_LEVEL || 'info'

let cloudLogging: LoggingWinston | null = null

const transports = new Array<Transport>()

const env = process.env.NODE_ENV || 'production'
switch (env) {
    case 'dev':
        // transports.push(console, cloudLogging)
        transports.push(console)
        break;
    case 'test':
    case 'ci':
        transports.push(file)
        // transports.push(console)
        break;
    case 'production':
    default:
        transports.push(console)
        cloudLogging = new LoggingWinston({
            projectId: process.env.GOOGLE_PROJECT_ID,
            logName: 'poks-server'
        })
        transports.push(cloudLogging)
}

export const logger = winston.createLogger({
    level,
    defaultMeta: { env },
    transports
})

if (cloudLogging) {
    logger.exceptions.handle(cloudLogging)
}
