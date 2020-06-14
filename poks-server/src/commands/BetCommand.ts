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
        const tablePlayer = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.senderWebSocket)

        log.info(
            `Execute BetCommand`,
            { betData: this.betData, tableId: tablePlayer.table.tableInfo.id, playerId: tablePlayer.player.playerInfo.id }
        )

        tablePlayer.table.activityTimestamp = this.server.getTimestamp()
        tablePlayer.player.playerInfo.bet = this.betData.bet

        new OtherBetNotification(tablePlayer, this.betData.bet).send()
    }
}
