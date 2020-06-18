import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { OtherBetNotificationData } from '../model/OtherBetNotificationData'
import { Bet, BetHelper } from '../model/Bet'
import { PlayerHelper } from '../server/Player'
import { logger } from '../logger'
import { TablePlayer } from '../server/TablePlayer'

const log = logger.child({ component: 'OtherBetNotification' })

export class OtherBetNotification extends Notification<OtherBetNotificationData> {
    constructor(private readonly tablePlayer: TablePlayer, private readonly bet: Bet) {
        super()
    }

    get kind(): Messages {
        return Messages.OtherBetNotification
    }

    send() {
        const player = this.tablePlayer.player
        const table = this.tablePlayer.table
        const otherBetNotificationData = {
            playerId: player.playerInfo.id,
            bet: table.tableInfo.revealed ? this.bet : BetHelper.hide(this.bet)
        }
        log.info(`Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(player)}`, { otherBetNotificationData })
        this.sendToOthers(table, player, otherBetNotificationData)
    }
}
