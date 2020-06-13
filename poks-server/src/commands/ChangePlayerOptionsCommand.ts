import * as uWS from 'uWebSockets.js'
import { Server } from '../Server'
import { Command } from './Command'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { logger } from '../logger'
import { ChangePlayerOptionsData } from '../model/ChangePlayerOptionsData'
import { ChangePlayerOptionsNotification } from '../notifications/ChangePlayerOptionsNotification'

const log = logger.child({ component: 'ChangePlayerOptionsCommand' })

export class ChangePlayerOptionsCommand implements Command<ChangePlayerOptionsData> {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly changePlayerOptionsData: ChangePlayerOptionsData
    ) { }

    execute() {
        const { table, player } = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.senderWebSocket)

        if (table === undefined || player === undefined) {
            return
        }

        log.info(
            `Execute ChangePlayerOptionsCommand`,
            { changePlayerOptionsData: this.changePlayerOptionsData }
        )

        const playerOptions = this.changePlayerOptionsData.playerOptions
        if (player.playerInfo.id !== playerOptions.id) {
            log.warn(`Changing player options for other player not allowed`, {
                playerInfo: player.playerInfo,
                playerOptions
            })
            return
        }

        table.activityTimestamp = this.server.getTimestamp()
        player.playerInfo.name = playerOptions.name
        player.playerInfo.observerMode = playerOptions.observerMode

        new ChangePlayerOptionsNotification(table, player).send()
    }
}
