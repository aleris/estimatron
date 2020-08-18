import './env'
import * as path from 'path'
import { logger } from './logger'
import { Monitoring } from './Monitoring'
import { Server } from './server/Server'
import { MemoryServerStorage } from './server/MemoryServerStorage'
import { SSLApp } from 'uWebSockets.js'

logger.info('.:: Estimatron Server ::.')

Monitoring.initialize()

function startServer() {
    const port = Number(process.env.SERVER_PORT) || 29087
    logger.info(`Starting server on port ${port}...`)
    if (process.env.WS_CERT_KEY_FILE_NAME === undefined
        || process.env.WS_CERT_CERT_FILE_NAME === undefined) {
        logger.error('WS_CERT env vars missing, cannot create WS app')
        return
    }
    const key_file_name = path.resolve(process.env.WS_CERT_KEY_FILE_NAME)
    const cert_file_name = path.resolve(process.env.WS_CERT_CERT_FILE_NAME)
    const passphrase = process.env.WS_CERT_CERT_PASSPHRASE
    const wsApp = SSLApp({
        key_file_name,
        cert_file_name,
        passphrase
    })
    const serverStorage = new MemoryServerStorage()
    const server = new Server(port, wsApp, serverStorage)
    server.start()
}

startServer()
