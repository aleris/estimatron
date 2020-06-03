import { Messages } from '../model/Messages'
import { OtherLeftNotificationData } from '../model/OtherLeftNotificationData'
import { Notification } from './Notification'
import { Table } from '../Table'
import { Player, PlayerHelper } from '../Player'
import { logger } from '../logger'

const log = logger.child({ component: 'OtherLeftNotification' })

export class OtherLeftNotification extends Notification<OtherLeftNotificationData> {
    constructor(
        private readonly table: Table,
        private readonly player: Player
    ) {
        super()
    }

    get kind(): Messages {
        return Messages.OtherLeftNotification
    }

    send() {
        const otherLeftNotificationData = {
            playerId: this.player.playerInfo.id
        }
        log.info(`Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(this.player)}`, { otherLeftNotificationData })
        this.sendToOthers(this.table, this.player, otherLeftNotificationData)
    }
}
