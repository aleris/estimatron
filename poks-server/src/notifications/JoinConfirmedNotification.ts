import { Messages } from '../model/Messages'
import { JoinConfirmedNotificationData } from '../model/JoinConfirmedNotificationData'
import { Notification } from './Notification'
import { Table } from '../Table'
import { Player } from '../Player'
import { BetHelper } from '../model/Bet'

export class JoinConfirmedNotification extends Notification<JoinConfirmedNotificationData> {
    constructor(
        private readonly table: Table,
        private readonly player: Player
    ) {
        super()
    }

    get kind(): Messages {
        return Messages.JoinConfirmedNotification
    }

    send() {
        const joinConfirmedData = {
            tableInfo: this.table.tableInfo,
            players: this.table.players.map(player =>
                player.playerInfo.id === this.player.playerInfo.id || this.table.revealed
                    ? player.playerInfo
                    : BetHelper.hideForPlayerInfo(player.playerInfo)
            )
        }
        this.sendToPlayer(this.player, joinConfirmedData)
    }
}
