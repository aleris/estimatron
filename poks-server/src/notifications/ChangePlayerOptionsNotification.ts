import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { Table } from '../Table'
import { Player, PlayerHelper } from '../Player'
import { logger } from '../logger'
import { ChangePlayerOptionsNotificationData } from '../model/ChangePlayerOptionsNotificationData'

const log = logger.child({ component: 'ChangePlayerOptionsNotification' })

export class ChangePlayerOptionsNotification extends Notification<ChangePlayerOptionsNotificationData> {
    constructor(
        private readonly table: Table,
        private readonly player: Player
    ) {
        super()
    }

    get kind(): Messages {
        return Messages.ChangePlayerOptionsNotification
    }

    send() {
        const playerInfo = this.player.playerInfo
        const changePlayerOptionsNotificationData = {
            playerName: playerInfo.name,
            observerMode: playerInfo.observer
        }
        log.info(
            `Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(this.player)}`,
            { changePlayerOptionsNotificationData }
        )
        this.sendToAll(this.player.ws, this.table, changePlayerOptionsNotificationData)
    }
}
