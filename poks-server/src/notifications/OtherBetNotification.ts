import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { OtherBetNotificationData } from '../model/OtherBetNotificationData'
import { Bet, BetHelper } from '../model/Bet'
import { Table } from '../Table'
import { Player } from '../Player'

export class OtherBetNotification extends Notification<OtherBetNotificationData> {
    constructor(
        private readonly table: Table,
        private readonly player: Player,
        private readonly bet: Bet
    ) {
        super()
    }

    get kind(): Messages {
        return Messages.OtherBetNotification
    }

    send() {
        const betNotificationData = {
            playerId: this.player.playerInfo.id,
            bet: this.table.revealed ? this.bet : BetHelper.hide(this.bet)
        }
        this.sendToOthers(this.table, this.player, betNotificationData)
    }
}
