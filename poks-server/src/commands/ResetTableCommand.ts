import * as uWS from 'uWebSockets.js'
import { Server } from '../Server'
import { Command } from './Command'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { ResetTableData } from '../model/ResetTableData'
import { BetHelper } from '../model/Bet'
import { ResetTableNotification } from '../notifications/ResetTableNotification'
import { logger } from '../logger'

const log = logger.child({ component: 'ResetTableCommand' })

export class ResetTableCommand implements Command<ResetTableData> {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly resetTableData: ResetTableData
    ) { }

    execute() {
        const { table, player } = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.senderWebSocket)

        if (table === undefined || player === undefined) {
            return
        }

        log.info(
            `Execute ResetTableCommand`,
            { resetTableData: this.resetTableData, tableId: table.tableInfo.id, playerId: player.playerInfo.id }
        )

        table.activityTimestamp = this.server.getTimestamp()
        table.revealed = false
        table.players.forEach(player => player.playerInfo.bet = BetHelper.noBet())

        new ResetTableNotification(table, player).send()
    }
}
