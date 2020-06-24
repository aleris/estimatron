import '../../style/app.scss'
import { TableController } from '@/pages/app/TableController'
import { WebSocketHeartBeat } from '@/pages/app/WebSocketHeartBeat'
import { Server } from '@/pages/app/Server'

window.addEventListener('DOMContentLoaded', async () => {

    const webSocket = new WebSocket(SERVER_URL)
    const webSocketHeartBeat = new WebSocketHeartBeat(webSocket)
    const server = new Server(webSocket, webSocketHeartBeat)

    const tableController = new TableController('tableCanvas', server)

    window.addEventListener('resize', tableController.onWindowResize.bind(tableController), false)
})
