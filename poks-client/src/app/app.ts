import './app.scss'

import { TableController } from '@/app/TableController'
import { WebSocketHeartBeat } from '@/app/WebSocketHeartBeat'
import { Server } from '@/app/Server'

window.addEventListener('DOMContentLoaded', async () => {

    const webSocket = new WebSocket(SERVER_URL)
    const webSocketHeartBeat = new WebSocketHeartBeat(webSocket)
    const server = new Server(webSocket, webSocketHeartBeat)

    const tableController = new TableController('tableCanvas', server)

    window.addEventListener('resize', tableController.onWindowResize.bind(tableController), false)
})
