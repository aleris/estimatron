import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { OtherJoinedNotificationData } from '../model/OtherJoinedNotificationData'
import { Table } from '../Table'
import { Player, PlayerHelper } from '../Player'
import { BetHelper } from '../model/Bet'
import { logger } from '../logger'

const log = logger.child({ component: 'OtherJoinedNotification' })

export class OtherJoinedNotification extends Notification<OtherJoinedNotificationData> {
    constructor(
        private readonly table: Table,
        private readonly player: Player
    ) {
        super()
    }

    get kind(): Messages {
        return Messages.OtherJoinedNotification
    }

    send() {
        const playerInfo = this.player.playerInfo
        const otherJoinedNotificationData = {
            playerInfo: this.table.tableInfo.revealed ? playerInfo : BetHelper.hideForPlayerInfo(playerInfo)
        }
        log.info(`Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(this.player)}`, { otherJoinedNotificationData })
        this.sendToOthers(this.table, this.player, otherJoinedNotificationData)
    }
}
