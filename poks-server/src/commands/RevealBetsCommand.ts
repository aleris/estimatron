import * as uWS from 'uWebSockets.js'
import { Server } from '../Server'
import { Command } from './Command'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { RevealBetsNotification } from '../notifications/RevealBetsNotification'
import { RevealBetsData } from '../model/RevealBetsData'
import { logger } from '../logger'

const log = logger.child({ component: 'RevealBetsCommand' })

export class RevealBetsCommand implements Command<RevealBetsData> {

    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly revealBetsData: RevealBetsData
    ) { }

    execute() {
        const { table, player } = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.senderWebSocket)

        if (table === undefined || player === undefined) {
            return
        }

        log.info(
            `execute ResetTableCommand`,
            { revealBetsData: this.revealBetsData, tableId: table.tableInfo.id, playerId: player.playerInfo.id }
        )

        table.activityTimestamp = this.server.getTimestamp()
        table.revealed = true
        table.lastRevealedByPlayer = player

        new RevealBetsNotification(table, player).send()
    }
}
