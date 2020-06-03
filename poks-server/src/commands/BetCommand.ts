import * as uWS from 'uWebSockets.js'
import { Server } from '../Server'
import { Command } from './Command'
import { BetData } from '../model/BetData'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { OtherBetNotification } from '../notifications/OtherBetNotification'
import { logger } from '../logger'

const log = logger.child({ component: 'BetCommand' })

export class BetCommand extends Command<BetData> {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly betData: BetData
    ) {
        super()
    }

    execute() {
        const { table, player } = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.senderWebSocket)
        if (table === undefined || player === undefined) {
            return
        }

        log.info(
            `execute BetCommand`,
            { betData: this.betData, tableId: table.tableInfo.id, playerId: player.playerInfo.id }
        )

        table.activityTimestamp = this.server.getTimestamp()
        player.playerInfo.bet = this.betData.bet

        new OtherBetNotification(table, player, this.betData.bet).send()
    }
}
