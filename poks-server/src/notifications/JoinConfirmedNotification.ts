import { Messages } from '../model/Messages'
import { JoinConfirmedNotificationData } from '../model/JoinConfirmedNotificationData'
import { Notification } from './Notification'
import { Table } from '../Table'
import { Player, PlayerHelper } from '../Player'
import { BetHelper } from '../model/Bet'
import { logger } from '../logger'

const log = logger.child({ component: 'JoinConfirmedNotification' })

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
                player.playerInfo.id === this.player.playerInfo.id || this.table.tableInfo.revealed
                    ? player.playerInfo
                    : BetHelper.hideForPlayerInfo(player.playerInfo)
            )
        }
        log.info(`Send ${Messages[this.kind]} to ${PlayerHelper.nameAndId(this.player)}`, { joinConfirmedData })
        this.sendToPlayer(this.player, joinConfirmedData)
    }
}
