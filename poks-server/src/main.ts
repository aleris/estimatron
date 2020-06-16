import './env'
import { logger } from './logger'
import { Monitoring } from './Monitoring'
import { default as uWS } from 'uWebSockets.js'
import { Server } from './server/Server'
import { MemoryServerStorage } from './server/MemoryServerStorage'

Monitoring.initialize()

const port = 29087
logger.info(`Starting server on port ${port}...`)
const server = new Server(port, uWS.App(), new MemoryServerStorage())
server.start()
