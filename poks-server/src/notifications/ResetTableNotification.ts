import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { PlayerHelper } from '../server/Player'
import { ResetTableNotificationData } from '../model/ResetTableNotificationData'
import { logger } from '../logger'
import { TablePlayer } from '../model/TablePlayerInfo'

const log = logger.child({ component: 'ResetTableNotification' })

export class ResetTableNotification extends Notification<ResetTableNotificationData> {
    constructor(private readonly tablePlayer: TablePlayer) {
        super()
    }

    get kind(): Messages {
        return Messages.ResetTableNotification
    }

    send() {
        const player = this.tablePlayer.player
        const players = this.tablePlayer.table.players.map(existingPlayer => existingPlayer.playerInfo)
        const resetTableNotificationData = {
            resetBy: player.playerInfo,
            players
        }
        log.info(`Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(player)}`, { resetTableNotificationData })
        this.sendToAll(this.tablePlayer.table, player, resetTableNotificationData)
    }
}
