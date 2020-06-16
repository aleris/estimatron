import { WebSocket } from 'uWebSockets.js'
import { Server } from '../server/Server'
import { Command } from './Command'
import { TablePlayerHelper } from './TablePlayerHelper'
import { logger } from '../logger'
import { ChangeTableOptionsData } from '../model/ChangeTableOptionsData'
import { ChangeTableOptionsNotification } from '../notifications/ChangeTableOptionsNotification'

const log = logger.child({ component: 'ChangeTableOptionsCommand' })

export class ChangeTableOptionsCommand implements Command<ChangeTableOptionsData> {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: WebSocket,
        private readonly changeTableOptionsData: ChangeTableOptionsData
    ) { }

    execute() {
        const tablePlayer = TablePlayerHelper.getTablePlayer(this.server, this.senderWebSocket)

        log.info(
            `Execute ChangeTableOptionsCommand`,
            { changeTableOptionsData: this.changeTableOptionsData }
        )

        const table = tablePlayer.table
        table.tableInfo.name = this.changeTableOptionsData.tableOptions.name
        table.tableInfo.deckKind = this.changeTableOptionsData.tableOptions.deckKind

        new ChangeTableOptionsNotification(tablePlayer).send()
    }
}
