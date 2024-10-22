import { WebSocket } from 'uWebSockets.js'
import { Server } from '../server/Server'
import { Command } from './Command'
import { TablePlayerHelper } from './TablePlayerHelper'
import { logger } from '../logger'
import { ChangePlayerOptionsData } from '../model/ChangePlayerOptionsData'
import { ChangePlayerOptionsNotification } from '../notifications/ChangePlayerOptionsNotification'

const log = logger.child({ component: 'ChangePlayerOptionsCommand' })

export class ChangePlayerOptionsCommand implements Command<ChangePlayerOptionsData> {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: WebSocket,
        private readonly changePlayerOptionsData: ChangePlayerOptionsData
    ) { }

    execute() {
        const tablePlayer = TablePlayerHelper.getTablePlayer(this.server, this.senderWebSocket)

        log.info(
            `Execute ChangePlayerOptionsCommand`,
            { changePlayerOptionsData: this.changePlayerOptionsData }
        )

        const playerOptions = this.changePlayerOptionsData.playerOptions
        const player = tablePlayer.player
        if (player.playerInfo.id !== playerOptions.id) {
            log.warn(`Attempt to change other player options`, {
                playerInfo: player.playerInfo,
                playerOptions
            })
            return
        }

        player.playerInfo.name = playerOptions.name
        player.playerInfo.observerMode = playerOptions.observerMode

        new ChangePlayerOptionsNotification(tablePlayer).send()
    }
}
