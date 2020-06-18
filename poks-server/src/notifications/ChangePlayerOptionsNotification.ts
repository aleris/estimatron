import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { PlayerHelper } from '../server/Player'
import { logger } from '../logger'
import { ChangePlayerOptionsNotificationData } from '../model/ChangePlayerOptionsNotificationData'
import { TablePlayer } from '../server/TablePlayer'

const log = logger.child({ component: 'ChangePlayerOptionsNotification' })

export class ChangePlayerOptionsNotification extends Notification<ChangePlayerOptionsNotificationData> {
    constructor(private readonly tablePlayer: TablePlayer) {
        super()
    }

    get kind(): Messages {
        return Messages.ChangePlayerOptionsNotification
    }

    send() {
        const player = this.tablePlayer.player
        const playerInfo = player.playerInfo
        const changePlayerOptionsNotificationData = {
            playerOptions: {
                id: playerInfo.id,
                name: playerInfo.name,
                observerMode: playerInfo.observerMode
            }
        }
        log.info(
            `Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(player)}`,
            { changePlayerOptionsNotificationData }
        )
        this.sendToAll(this.tablePlayer.table, player, changePlayerOptionsNotificationData)
    }
}
