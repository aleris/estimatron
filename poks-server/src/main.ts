import './env'
import { logger } from './logger'
import { Monitoring } from './Monitoring'
import { Server } from './server/Server'
import { MemoryServerStorage } from './server/MemoryServerStorage'
import { SSLApp } from 'uWebSockets.js'

Monitoring.initialize()

const port = 29087
logger.info(`Starting server on port ${port}...`)
const key_file_name = process.env.WS_CERT_KEY_FILE_NAME
const cert_file_name = process.env.WS_CERT_CERT_FILE_NAME
const passphrase = process.env.WS_CERT_CERT_PASSPHRASE
const wsApp = SSLApp({
    key_file_name,
    cert_file_name,
    passphrase
})
const serverStorage = new MemoryServerStorage()
const server = new Server(port, wsApp, serverStorage)
server.start()
