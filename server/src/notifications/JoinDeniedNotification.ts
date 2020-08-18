import { Messages } from '../model/Messages'
import { Notification } from './Notification'
import { logger } from '../logger'
import { TablePlayer } from '../server/TablePlayer'
import { JoinDeniedNotificationData, JoinDeniedReasons } from '../model/JoinDeniedNotificationData'
import { TableInfoHelper } from '../model/TableInfo'

const log = logger.child({ component: 'JoinDeniedNotification' })

export class JoinDeniedNotification extends Notification<JoinDeniedNotificationData> {
    constructor(private readonly tablePlayer: TablePlayer, private readonly reason: JoinDeniedReasons) {
        super()
    }

    get kind(): Messages {
        return Messages.JoinDeniedNotification
    }

    send() {
        const joinDeniedNotificationData = {
            reason: this.reason
        }
        log.info(`Send ${Messages[this.kind]} for ${TableInfoHelper.nameAndId(this.tablePlayer.table.tableInfo)}`, { joinDeniedNotificationData })
        this.sendToPlayer(this.tablePlayer.table, this.tablePlayer.player, joinDeniedNotificationData)
    }
}
