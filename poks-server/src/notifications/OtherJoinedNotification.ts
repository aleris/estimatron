import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { OtherJoinedNotificationData } from '../model/OtherJoinedNotificationData'
import { PlayerHelper } from '../server/Player'
import { BetHelper } from '../model/Bet'
import { logger } from '../logger'
import { TablePlayer } from '../server/TablePlayer'

const log = logger.child({ component: 'OtherJoinedNotification' })

export class OtherJoinedNotification extends Notification<OtherJoinedNotificationData> {
    constructor(private readonly tablePlayer: TablePlayer) {
        super()
    }

    get kind(): Messages {
        return Messages.OtherJoinedNotification
    }

    send() {
        const tableInfo = this.tablePlayer.table.tableInfo
        const player = this.tablePlayer.player
        const playerInfo = player.playerInfo
        const otherJoinedNotificationData = {
            playerInfo: tableInfo.revealed ? playerInfo : BetHelper.hideForPlayerInfo(playerInfo)
        }
        log.info(`Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(player)}`, { otherJoinedNotificationData })
        this.sendToOthers(this.tablePlayer.table, player, otherJoinedNotificationData)
    }
}
