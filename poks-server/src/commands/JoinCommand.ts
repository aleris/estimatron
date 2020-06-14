import * as uWS from 'uWebSockets.js'
import { logger } from '../logger'
import { JoinData } from '../model/JoinData'
import { Messages } from '../model/Messages'
import { Command } from './Command'
import { Notification } from '../notifications/Notification'
import { OtherJoinedNotification } from '../notifications/OtherJoinedNotification'
import { JoinConfirmedNotification } from '../notifications/JoinConfirmedNotification'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { Player, PlayerHelper } from '../Player'
import { Table, TableHelper } from '../Table'
import { Server } from '../Server'
import { globalStats, TagMap } from '@opencensus/core'
import {
    MEASURE_CREATED_TABLES, MEASURE_PLAYERS_DENIED_JOINED,
    MEASURE_PLAYERS_JOINED, TAG_JOIN_DENY_REASON
} from '../monitoring'
import { PlayerInfoHelper } from '../model/PlayerInfo'
import { TablePlayer } from '../model/TablePlayerInfo'
import { JoinDeniedNotification } from '../notifications/JoinDeniedNotification'
import { JoinDeniedReasons } from '../model/JoinDeniedNotificationData'

const log = logger.child({ component: 'JoinCommand' })

export class JoinCommand implements Command<JoinData> {
    public readonly joinTimestamp: number

    constructor(
        public readonly server: Server,
        public readonly senderWebSocket: uWS.WebSocket,
        public readonly joinData: JoinData
    ) {
        this.joinTimestamp = this.server.getTimestamp()
    }

    execute() {
        log.info(`Execute JoinCommand`, { joinData: this.joinData })
        const joinCommandAction = JoinCommandActionFactory.of(this)
        const result = joinCommandAction.execute()

        if (result.joinDenied) {
            return
        }

        const tablePlayer = result.tablePlayer

        tablePlayer.player.playerInfo.gone = false
        WebSocketTablePlayerInfo.saveTablePlayerIds(this.senderWebSocket, tablePlayer)

        const table = tablePlayer.table
        this.senderWebSocket.subscribe(Notification.getTopicName(table, Messages.RevealBetsNotification))
        this.senderWebSocket.subscribe(Notification.getTopicName(table, Messages.ResetTableNotification))
        this.senderWebSocket.subscribe(Notification.getTopicName(table, Messages.ChangeTableOptionsNotification))
        this.senderWebSocket.subscribe(Notification.getTopicName(table, Messages.ChangePlayerOptionsNotification))

        new JoinConfirmedNotification(tablePlayer).send()
        new OtherJoinedNotification(tablePlayer).send()

        JoinCommand.recordStatsPlayersJoined()
    }

    private static recordStatsPlayersJoined() {
        globalStats.record([{ measure: MEASURE_PLAYERS_JOINED, value: 1 }])
    }

}

interface JoinCommandActionResult {
    tablePlayer: TablePlayer
    joinDenied: boolean
}

interface JoinCommandAction {
    execute(): JoinCommandActionResult
}

class JoinCommandActionFactory {
    static of(joinCommand: JoinCommand): JoinCommandAction {
        const table = joinCommand.server.tables.get(joinCommand.joinData.tableInfo.id)
        if (table === undefined) {
            return new NoTableJoinCommandAction(joinCommand)
        }

        const player = table.players.find(player => player.playerInfo.id === joinCommand.joinData.playerInfo.id)

        if (player === undefined) {
            return new NoPlayerJoinCommandAction(joinCommand, table)
        }

        return new PlayerExistsJoinCommandAction(joinCommand, table, player)
    }
}

class NoTableJoinCommandAction implements JoinCommandAction {
    constructor(private readonly joinCommand: JoinCommand) { }

    execute(): JoinCommandActionResult {
        const joinData = this.joinCommand.joinData
        const player = {
            ws: this.joinCommand.senderWebSocket,
            playerInfo: joinData.playerInfo
        }
        const joinTimestamp = this.joinCommand.joinTimestamp
        const table = {
            tableInfo: joinData.tableInfo,
            players: [player],
            createdTimestamp: joinTimestamp,
            activityTimestamp: joinTimestamp,
            lastRevealedByPlayer: null,
            lastResetByPlayer: null
        }
        table.tableInfo.revealed = false
        log.info(`Adding table ${TableHelper.nameAndId(table)} with player ${PlayerHelper.nameAndId(player)}`)
        this.joinCommand.server.tables.set(joinData.tableInfo.id, table)

        NoTableJoinCommandAction.recordStatsCreatedTables()

        return  {
            tablePlayer: { table, player },
            joinDenied: false
        }
    }

    private static recordStatsCreatedTables() {
        globalStats.record([
            { measure: MEASURE_CREATED_TABLES, value: 1 },
            { measure: MEASURE_PLAYERS_JOINED, value: 1 }
        ])
    }
}

class NoPlayerJoinCommandAction implements JoinCommandAction {
    private static readonly MAX_PLAYERS_ON_A_TABLE = 1

    constructor(private readonly joinCommand: JoinCommand, private readonly table: Table) { }

    execute(): JoinCommandActionResult {
        const player = {
            ws: this.joinCommand.senderWebSocket,
            playerInfo: this.joinCommand.joinData.playerInfo
        }
        const tablePlayer = { table: this.table, player }

        let joinDenied
        if (this.table.players.length < NoPlayerJoinCommandAction.MAX_PLAYERS_ON_A_TABLE) {
            joinDenied = false
            this.table.players.push(player)
            log.info(`Added player ${PlayerHelper.nameAndId(player)} to table ${TableHelper.nameAndId(this.table)}`)
        } else {
            joinDenied = true
            log.warn(`Max players for table ${TableHelper.nameAndId(this.table)}, player ${PlayerInfoHelper.nameAndId(this.joinCommand.joinData.playerInfo)} not added.`)
            new JoinDeniedNotification(tablePlayer, JoinDeniedReasons.MaxPlayersOnATable).send()
            this.recordStatsPlayersDeniedJoined(JoinDeniedReasons.MaxPlayersOnATable)
        }

        return  {
            tablePlayer,
            joinDenied
        }
    }

    private recordStatsPlayersDeniedJoined(reason: JoinDeniedReasons) {
        const tags = new TagMap()
        tags.set(TAG_JOIN_DENY_REASON, {value: JoinDeniedReasons[reason]})
        globalStats.record([{ measure: MEASURE_PLAYERS_DENIED_JOINED, value: 1 }], tags)
    }

}

class PlayerExistsJoinCommandAction implements JoinCommandAction {
    constructor(
        private readonly joinCommand: JoinCommand,
        private readonly table: Table,
        private readonly player: Player
    ) { }

    execute(): JoinCommandActionResult {
        log.info(`Player ${PlayerHelper.nameAndId(this.player)} already sits at table ${TableHelper.nameAndId(this.table)}`)

        this.player.ws = this.joinCommand.senderWebSocket
        // assume updated info didn't get to client, so keep the server ones
        // player.playerInfo.name = this.joinData.playerInfo.name
        // player.playerInfo.bet = this.joinData.playerInfo.bet
        return {
            tablePlayer: { table: this.table, player: this.player },
            joinDenied: false
        }
    }
}

