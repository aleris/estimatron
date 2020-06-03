import * as uWS from 'uWebSockets.js'
import { Server } from '../Server'
import { Command } from './Command'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { ResetTableData } from '../model/ResetTableData'
import { BetHelper } from '../model/Bet'
import { ResetTableNotification } from '../notifications/ResetTableNotification'

export class ResetTableCommand implements Command<ResetTableData> {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly resetTableData: ResetTableData
    ) { }

    execute() {
        console.log(`execute ResetTableCommand`, this.resetTableData)
        const { table, player } = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.senderWebSocket)

        if (table === undefined || player === undefined) {
            return
        }

        table.activityTimestamp = this.server.getTimestamp()
        table.revealed = false
        table.players.forEach(player => player.playerInfo.bet = BetHelper.noBet())

        new ResetTableNotification(table, player).send()
    }
}
