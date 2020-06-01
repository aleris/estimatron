import * as uWS from 'uWebSockets.js'
import { Server } from '../Server'
import { Command } from './Command'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { RevealBetsNotification } from '../notifications/RevealBetsNotification'
import { RevealBetsData } from '../model/RevealBetsData'
import { ResetTableData } from '../model/ResetTableData'

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

        new RevealBetsNotification(table, player).send()
    }
}
