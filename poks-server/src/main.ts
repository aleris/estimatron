import './env'
import { logger } from './logger'
import './monitoring'
import { Server } from './Server'

const port = 29087
logger.info(`Starting server on port ${port}...`)
const server = new Server(port)
server.start()
