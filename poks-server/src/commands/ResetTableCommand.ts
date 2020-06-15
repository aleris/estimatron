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
        const tablePlayer = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.senderWebSocket)

        log.info(
            `Execute ResetTableCommand`,
            { resetTableData: this.resetTableData, tableId: tablePlayer.table.tableInfo.id, playerId: tablePlayer.player.playerInfo.id }
        )

        tablePlayer.table.tableInfo.revealed = false
        tablePlayer.table.players.forEach(existingPlayer => existingPlayer.playerInfo.bet = BetHelper.noBet())

        new ResetTableNotification(tablePlayer).send()
    }
}
