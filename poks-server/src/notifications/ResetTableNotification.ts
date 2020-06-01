import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { Table } from '../Table'
import { Player } from '../Player'
import { ResetTableNotificationData } from '../model/ResetTableNotificationData'

export class ResetTableNotification extends Notification<ResetTableNotificationData> {
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
            resetBy: this.player.playerInfo,
            players
        }
        this.sendToAll(this.player.ws, this.table, data)
        console.log(`done notify RevealBetsNotification for table ${this.table.tableInfo.id} (${this.table.tableInfo.name})`)
    }
}
