import * as uWS from 'uWebSockets.js'
import { Server } from '../Server'
import { LeaveData } from '../model/LeaveData'
import { OtherLeftNotification } from '../notifications/OtherLeftNotification'
import { Command } from './Command'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'

export class LeaveCommand implements Command<LeaveData> {
    constructor(
        private readonly server: Server,
        private readonly contextWebSocket: uWS.WebSocket,
        private readonly data: LeaveData
    ) { }

    execute() {
        console.log(`execute LeaveCommand`, this.data)
        const { table, player } = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.contextWebSocket)

        if (table === undefined || player === undefined) {
            return
        }

        player.playerInfo.gone = true

        new OtherLeftNotification(table, player).send()
    }
}
