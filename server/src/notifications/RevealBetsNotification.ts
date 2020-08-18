import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { RevealBetsNotificationData } from '../model/RevealBetsNotificationData'
import { PlayerHelper } from '../server/Player'
import { logger } from '../logger'
import { TablePlayer } from '../server/TablePlayer'

const log = logger.child({ component: 'RevealBetsNotification' })

export class RevealBetsNotification extends Notification<RevealBetsNotificationData> {
    constructor(private readonly tablePlayer: TablePlayer) {
        super()
    }

    get kind(): Messages {
        return Messages.RevealBetsNotification
    }

    send() {
        const player = this.tablePlayer.player
        const players = this.tablePlayer.table.players.map(existingPlayer => existingPlayer.playerInfo)
        const revealBetsNotificationData = {
            revealedBy: player.playerInfo,
            players
        }
        log.info(`Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(player)}`, { revealBetsNotificationData })
        this.sendToAll(this.tablePlayer.table, player, revealBetsNotificationData)
    }
}
