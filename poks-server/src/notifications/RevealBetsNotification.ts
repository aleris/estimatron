import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { RevealBetsNotificationData } from '../model/RevealBetsNotificationData'
import { Table } from '../Table'
import { Player, PlayerHelper } from '../Player'
import { logger } from '../logger'

const log = logger.child({ component: 'RevealBetsNotification' })

export class RevealBetsNotification extends Notification<RevealBetsNotificationData> {
    constructor(
        private readonly table: Table,
        private readonly player: Player
    ) {
        super()
    }

    get kind(): Messages {
        return Messages.RevealBetsNotification
    }

    send() {
        const players = this.table.players.map(p => p.playerInfo)
        const revealBetsNotificationData = {
            revealedBy: this.player.playerInfo,
            players
        }
        log.info(`Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(this.player)}`, { revealBetsNotificationData })
        this.sendToAll(this.player.ws, this.table, revealBetsNotificationData)
    }
}
