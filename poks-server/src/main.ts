import './env'
import { logger } from './logger'
import { Monitoring } from './Monitoring'

import { Server } from './Server'

Monitoring.initialize()

const port = 29087
logger.info(`Starting server on port ${port}...`)
const server = new Server(port)
server.start()
