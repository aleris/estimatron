import * as uWS from 'uWebSockets.js'
import { Server } from '../Server'
import { Command } from './Command'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { logger } from '../logger'
import { ChangePlayerOptionsData } from '../model/ChangePlayerOptionsData'
import { ChangePlayerOptionsNotification } from '../notifications/ChangePlayerOptionsNotification'

const log = logger.child({ component: 'ChangePlayerOptionsCommand' })

export class ChangePlayerOptionsCommand implements Command<ChangePlayerOptionsData> {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly changePlayerOptionsData: ChangePlayerOptionsData
    ) { }

    execute() {
        const { table, player } = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.senderWebSocket)

        if (table === undefined || player === undefined) {
            return
        }

        log.info(
            `Execute ChangePlayerOptionsCommand`,
            { resetPlayerData: this.changePlayerOptionsData, tableId: table.tableInfo.id, playerId: player.playerInfo.id }
        )

        table.activityTimestamp = this.server.getTimestamp()
        player.playerInfo.name = this.changePlayerOptionsData.playerName
        player.playerInfo.observer = this.changePlayerOptionsData.observerMode

        new ChangePlayerOptionsNotification(table, player).send()
    }
}
