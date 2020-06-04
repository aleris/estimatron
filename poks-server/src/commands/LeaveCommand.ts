import * as uWS from 'uWebSockets.js'
import { Server } from '../Server'
import { LeaveData } from '../model/LeaveData'
import { OtherLeftNotification } from '../notifications/OtherLeftNotification'
import { Command } from './Command'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { logger } from '../logger'

const log = logger.child({ component: 'LeaveCommand' })

export class LeaveCommand implements Command<LeaveData> {
    constructor(
        private readonly server: Server,
        private readonly contextWebSocket: uWS.WebSocket,
        private readonly leaveData: LeaveData
    ) { }

    execute() {
        const { table, player } = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.contextWebSocket)
        if (table === undefined || player === undefined) {
            return
        }
        log.info(
            `Execute LeaveCommand`,
            { leaveData: this.leaveData, tableId: table.tableInfo.id, playerId: player.playerInfo.id }
        )

        player.playerInfo.gone = true

        new OtherLeftNotification(table, player).send()
    }
}
