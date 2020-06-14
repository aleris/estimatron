import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { Table } from '../Table'
import { Player, PlayerHelper } from '../Player'
import { logger } from '../logger'
import { ChangeTableOptionsNotificationData } from '../model/ChangeTableOptionsNotificationData'
import { TablePlayer } from '../model/TablePlayerInfo'

const log = logger.child({ component: 'ChangeTableOptionsNotification' })

export class ChangeTableOptionsNotification extends Notification<ChangeTableOptionsNotificationData> {
    constructor(private readonly tablePlayer: TablePlayer) {
        super()
    }

    get kind(): Messages {
        return Messages.ChangeTableOptionsNotification
    }

    send() {
        const table = this.tablePlayer.table
        const tableInfo = table.tableInfo
        const player = this.tablePlayer.player
        const changeTableOptionsNotificationData = {
            tableOptions: {
                changedByPlayerId: player.playerInfo.id,
                name: tableInfo.name,
                deckKind: tableInfo.deckKind
            }
        }
        log.info(
            `Send ${Messages[this.kind]} from ${PlayerHelper.nameAndId(player)}`,
            { changeTableOptionsNotificationData }
        )
        this.sendToAll(table, player, changeTableOptionsNotificationData)
    }
}
