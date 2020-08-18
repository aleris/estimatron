import { Messages } from '../model/Messages'
import { OtherLeftNotificationData } from '../model/OtherLeftNotificationData'
import { Notification } from './Notification'
import { PlayerHelper } from '../server/Player'
import { logger } from '../logger'
import { TablePlayer } from '../server/TablePlayer'

const log = logger.child({ component: 'OtherLeftNotification' })

export class OtherLeftNotification extends Notification<OtherLeftNotificationData> {
    constructor(private readonly tablePlayer: TablePlayer) {
        super()
    }

    get kind(): Messages {
        return Messages.OtherLeftNotification
    }

    send() {
        const player = this.tablePlayer.player
        const otherLeftNotificationData = {
            playerId: player.playerInfo.id
        }
        log.info(`Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(player)}`, { otherLeftNotificationData })
        this.sendToOthers(this.tablePlayer.table, player, otherLeftNotificationData)
    }
}
