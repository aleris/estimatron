import { Messages } from '../model/Messages'
import { OtherLeftNotificationData } from '../model/OtherLeftNotificationData'
import { Notification } from './Notification'
import { Table } from '../Table'
import { Player } from '../Player'

export class OtherLeftNotification extends Notification<OtherLeftNotificationData> {
    constructor(
        private readonly table: Table,
        private readonly player: Player
    ) {
        super()
    }

    get kind(): Messages {
        return Messages.OtherLeftNotification
    }

    send() {
        const data = {
            playerId: this.player.playerInfo.id
        }
        this.sendToOthers(this.table, this.player, data)
    }
}
