import * as uWS from 'uWebSockets.js'
import { Server } from '../Server'
import { Command } from './Command'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { RevealBetsNotification } from '../notifications/RevealBetsNotification'
import { RevealBetsData } from '../model/RevealBetsData'

export class RevealBetsCommand implements Command<RevealBetsData> {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly revealBetsData: RevealBetsData
    ) { }

    execute() {
        console.log(`execute RevealBetsCommand`, this.revealBetsData)
        const { table, player } = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.senderWebSocket)

        if (table === undefined || player === undefined) {
            return
        }

        table.activityTimestamp = this.server.getTimestamp()
        table.revealed = true
        table.lastRevealedByPlayer = player

        new RevealBetsNotification(table, player).send()
    }
}
