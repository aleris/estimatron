import './env'
import { logger } from './logger'
import { Monitoring } from './Monitoring'
import { default as uWS } from 'uWebSockets.js'
import { Server } from './Server'

Monitoring.initialize()

const port = 29087
logger.info(`Starting server on port ${port}...`)
const server = new Server(port, uWS.App())
server.start()
