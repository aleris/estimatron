import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { Table } from '../Table'
import { Player, PlayerHelper } from '../Player'
import { ResetTableNotificationData } from '../model/ResetTableNotificationData'
import { logger } from '../logger'

const log = logger.child({ component: 'ResetTableNotification' })

export class ResetTableNotification extends Notification<ResetTableNotificationData> {
    constructor(
        private readonly table: Table,
        private readonly player: Player
    ) {
        super()
    }

    get kind(): Messages {
        return Messages.ResetTableNotification
    }

    send() {
        const players = this.table.players.map(p => p.playerInfo)
        const resetTableNotificationData = {
            resetBy: this.player.playerInfo,
            players
        }
        log.info(`Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(this.player)}`, { resetTableNotificationData })
        this.sendToAll(this.player.ws, this.table, resetTableNotificationData)
    }
}
