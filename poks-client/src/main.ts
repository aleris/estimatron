import './style/main.scss'
import { TableController } from '@/TableController'
import { WebSocketHeartBeat } from '@/WebSocketHeartBeat'
import { Server } from '@/Server'

window.addEventListener('DOMContentLoaded', async () => {

    const webSocket = new WebSocket(SERVER_URL)
    const webSocketHeartBeat = new WebSocketHeartBeat(webSocket)
    const server = new Server(webSocket, webSocketHeartBeat)

    const tableController = new TableController('tableCanvas', server)

    window.addEventListener('resize', tableController.onWindowResize.bind(tableController), false)
})
