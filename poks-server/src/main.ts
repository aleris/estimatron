import './env'
import { logger } from './logger'
import { Server } from './Server'

const port = 29087
logger.info(`Starting server on port ${port}...`)
const server = new Server(port)
server.start()
