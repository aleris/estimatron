import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { OtherJoinedNotificationData } from '../model/OtherJoinedNotificationData'
import { Table } from '../Table'
import { Player } from '../Player'
import { BetHelper } from '../model/Bet'

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
        const otherJoinedData = {
            playerInfo: this.table.revealed ? playerInfo : BetHelper.hideForPlayerInfo(playerInfo)
        }
        console.log('OtherJoinedNotification send', otherJoinedData)
        this.sendToOthers(this.table, this.player, otherJoinedData)
    }
}
