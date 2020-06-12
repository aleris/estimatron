import * as uWS from 'uWebSockets.js'
import { logger } from '../logger'
import { JoinData } from '../model/JoinData'
import { Messages } from '../model/Messages'
import { TableInfoHelper } from '../model/TableInfo'
import { Command } from './Command'
import { Notification } from '../notifications/Notification'
import { OtherJoinedNotification } from '../notifications/OtherJoinedNotification'
import { JoinConfirmedNotification } from '../notifications/JoinConfirmedNotification'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { PlayerHelper } from '../Player'
import { TableHelper } from '../Table'
import { Server } from '../Server'
import { globalStats } from '@opencensus/core'
import { MEASURE_CREATED_TABLES, MEASURE_PLAYERS_JOINED } from '../monitoring'

const log = logger.child({ component: 'JoinCommand' })

export class JoinCommand implements Command<JoinData> {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly joinData: JoinData
    ) { }

    execute() {
        log.info(`Execute JoinCommand`, { joinData: this.joinData })
        const nowTimestamp = this.server.getTimestamp()
        let player
        let table = this.server.tables.get(this.joinData.tableInfo.id)
        if (table) { // table exists
            log.info(`Table ${TableInfoHelper.nameAndId(table.tableInfo)} exists`)
            player = table.players.find(player => player.playerInfo.id === this.joinData.playerInfo.id)
            if (player === undefined) { // player not at the table, add it to table
                player = {
                    ws: this.senderWebSocket,
                    playerInfo: this.joinData.playerInfo
                }
                table.players.push(player)
                log.info(`Added player ${PlayerHelper.nameAndId(player)} to table ${TableHelper.nameAndId(table)}`)

                this.recordStatsPlayersJoined()
            } else { // player already at the table, this could happen on refresh or connections was cut, update info
                log.info(`Player ${PlayerHelper.nameAndId(player)} already sits at table ${TableHelper.nameAndId(table)}`)
                player.ws = this.senderWebSocket
                // assume updated info didn't get t client, so keep the server ones
                // player.playerInfo.name = this.joinData.playerInfo.name
                // player.playerInfo.bet = this.joinData.playerInfo.bet
            }
            table.activityTimestamp = nowTimestamp
            // broadcast player joined
        } else { // table does not exists, create it
            player = {
                ws: this.senderWebSocket,
                playerInfo: this.joinData.playerInfo
            }
            table = {
                tableInfo: this.joinData.tableInfo,
                players: [player],
                createdTimestamp: nowTimestamp,
                activityTimestamp: nowTimestamp,
                lastRevealedByPlayer: null,
                lastResetByPlayer: null
            }
            table.tableInfo.revealed = false
            log.info(`Adding table ${TableHelper.nameAndId(table)} with player ${PlayerHelper.nameAndId(player)}`)
            this.server.tables.set(this.joinData.tableInfo.id, table)

            this.recordStatsCreatedTables()
        }
        player.playerInfo.gone = false
        WebSocketTablePlayerInfo.saveTablePlayerIds(this.senderWebSocket, table.tableInfo, player.playerInfo)

        this.senderWebSocket.subscribe(Notification.getTopicName(table, Messages.RevealBetsNotification))
        this.senderWebSocket.subscribe(Notification.getTopicName(table, Messages.ResetTableNotification))
        this.senderWebSocket.subscribe(Notification.getTopicName(table, Messages.ChangeTableOptionsNotification))
        this.senderWebSocket.subscribe(Notification.getTopicName(table, Messages.ChangePlayerOptionsNotification))

        new JoinConfirmedNotification(table, player).send()
        new OtherJoinedNotification(table, player).send()
    }

    private recordStatsPlayersJoined() {
        globalStats.record([{ measure: MEASURE_PLAYERS_JOINED, value: 1 }])
    }

    private recordStatsCreatedTables() {
        globalStats.record([
            { measure: MEASURE_CREATED_TABLES, value: 1 },
            { measure: MEASURE_PLAYERS_JOINED, value: 1 }
         ])
    }
}
