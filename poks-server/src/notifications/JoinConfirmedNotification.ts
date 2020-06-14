import { Messages } from '../model/Messages'
import { JoinConfirmedNotificationData } from '../model/JoinConfirmedNotificationData'
import { Notification } from './Notification'
import { Table } from '../Table'
import { Player, PlayerHelper } from '../Player'
import { BetHelper } from '../model/Bet'
import { logger } from '../logger'
import { TablePlayer } from '../model/TablePlayerInfo'
import { globalStats } from '@opencensus/core'
import { MEASURE_PLAYERS_JOINED } from '../monitoring'

const log = logger.child({ component: 'JoinConfirmedNotification' })

export class JoinConfirmedNotification extends Notification<JoinConfirmedNotificationData> {
    constructor(private readonly tablePlayer: TablePlayer) {
        super()
    }

    get kind(): Messages {
        return Messages.JoinConfirmedNotification
    }

    send() {
        const table = this.tablePlayer.table
        const player = this.tablePlayer.player

        const joinConfirmedData = {
            tableInfo: table.tableInfo,
            players: table.players.map(existingPlayer =>
                existingPlayer.playerInfo.id === player.playerInfo.id || table.tableInfo.revealed
                    ? existingPlayer.playerInfo
                    : BetHelper.hideForPlayerInfo(existingPlayer.playerInfo)
            )
        }

        log.info(`Send ${Messages[this.kind]} to ${PlayerHelper.nameAndId(player)}`, { joinConfirmedData })

        this.sendToPlayer(table, player, joinConfirmedData)
    }
}
