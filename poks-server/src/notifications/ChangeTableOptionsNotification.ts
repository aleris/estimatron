import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { Table } from '../Table'
import { Player, PlayerHelper } from '../Player'
import { logger } from '../logger'
import { ChangeTableOptionsNotificationData } from '../model/ChangeTableOptionsNotificationData'

const log = logger.child({ component: 'ChangeTableOptionsNotification' })

export class ChangeTableOptionsNotification extends Notification<ChangeTableOptionsNotificationData> {
    constructor(
        private readonly table: Table,
        private readonly player: Player
    ) {
        super()
    }

    get kind(): Messages {
        return Messages.ChangeTableOptionsNotification
    }

    send() {
        const tableInfo = this.table.tableInfo
        const changeTableOptionsNotificationData = {
            tableName: tableInfo.name,
            deckKind: tableInfo.deckKind
        }
        log.info(
            `Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(this.player)}`,
            { changeTableOptionsNotificationData }
        )
        this.sendToAll(this.player.ws, this.table, changeTableOptionsNotificationData)
    }
}
