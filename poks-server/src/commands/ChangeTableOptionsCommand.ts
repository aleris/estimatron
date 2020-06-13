import * as uWS from 'uWebSockets.js'
import { Server } from '../Server'
import { Command } from './Command'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { logger } from '../logger'
import { ChangeTableOptionsData } from '../model/ChangeTableOptionsData'
import { ChangeTableOptionsNotification } from '../notifications/ChangeTableOptionsNotification'

const log = logger.child({ component: 'ChangeTableOptionsCommand' })

export class ChangeTableOptionsCommand implements Command<ChangeTableOptionsData> {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly changeTableOptionsData: ChangeTableOptionsData
    ) { }

    execute() {
        const { table, player } = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.senderWebSocket)

        if (table === undefined || player === undefined) {
            return
        }

        log.info(
            `Execute ChangeTableOptionsCommand`,
            { changeTableOptionsData: this.changeTableOptionsData }
        )

        table.activityTimestamp = this.server.getTimestamp()
        table.tableInfo.name = this.changeTableOptionsData.tableOptions.name
        table.tableInfo.deckKind = this.changeTableOptionsData.tableOptions.deckKind

        new ChangeTableOptionsNotification(table, player).send()
    }
}
