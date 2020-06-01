import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { RevealBetsNotificationData } from '../model/RevealBetsNotificationData'
import { Table } from '../Table'
import { Player } from '../Player'

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
        const data = {
            revealedBy: this.player.playerInfo,
            players
        }
        this.sendToAll(this.player.ws, this.table, data)
        console.log(`done notify RevealBetsNotification for table ${this.table.tableInfo.id} (${this.table.tableInfo.name})`)
    }
}
