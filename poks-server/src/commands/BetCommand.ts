import * as uWS from 'uWebSockets.js'
import { Server } from '../Server'
import { Command } from './Command'
import { BetData } from '../model/BetData'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { OtherBetNotification } from '../notifications/OtherBetNotification'

export class BetCommand extends Command<BetData> {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly betData: BetData
    ) {
        super()
    }

    execute() {
        console.log(`execute BetCommand`, this.betData)
        const { table, player } = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.senderWebSocket)

        if (table === undefined) {
            return
        }
        table.activityTimestamp = this.server.getTimestamp()

        if (player === undefined) {
            return
        }
        player.playerInfo.bet = this.betData.bet

        new OtherBetNotification(table, player, this.betData.bet).send()
    }
}
