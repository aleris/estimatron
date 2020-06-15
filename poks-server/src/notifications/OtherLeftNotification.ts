import { Messages } from '../model/Messages'
import { OtherLeftNotificationData } from '../model/OtherLeftNotificationData'
import { Notification } from './Notification'
import { PlayerHelper } from '../Player'
import { logger } from '../logger'
import { TablePlayer } from '../model/TablePlayerInfo'

const log = logger.child({ component: 'OtherLeftNotification' })

export class OtherLeftNotification extends Notification<OtherLeftNotificationData> {
    constructor(private readonly tablePlayer: TablePlayer) {
        super()
    }

    get kind(): Messages {
        return Messages.OtherLeftNotification
    }

    send() {
        console.log('OtherLeftNotification send')
        const player = this.tablePlayer.player
        const otherLeftNotificationData = {
            playerId: player.playerInfo.id
        }
        log.info(`Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(player)}`, { otherLeftNotificationData })
        console.log('OtherLeftNotification', this.tablePlayer.table, player)
        this.sendToOthers(this.tablePlayer.table, player, otherLeftNotificationData)
    }
}
