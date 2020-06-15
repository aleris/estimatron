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
import { Player, PlayerHelper } from '../Player'
import { Table, TableHelper } from '../Table'
import { Server } from '../Server'
import { globalStats } from '@opencensus/core'
import { MEASURE_CREATED_TABLES, MEASURE_PLAYERS_JOINED } from '../monitoring'
import { BetHelper } from '../model/Bet'
import { TablePlayer } from '../model/TablePlayerInfo'
import { Timestamp } from '../model/Timestamp'

const log = logger.child({ component: 'JoinCommand' })

export class JoinCommand implements Command<JoinData> {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly joinData: JoinData
    ) { }

    execute() {
        log.info(`Execute JoinCommand`, { joinData: this.joinData })

        const joinCreateAction = JoinCreateActionFactory.of(this.server, this.senderWebSocket, this.joinData)
        const tablePlayer = joinCreateAction.create()

        WebSocketTablePlayerInfo.saveTablePlayerIds(this.senderWebSocket, tablePlayer)

        Notification.subscribeAll(this.senderWebSocket, tablePlayer.table)

        new JoinConfirmedNotification(tablePlayer).send()
        new OtherJoinedNotification(tablePlayer).send()
    }
}

interface JoinCreateAction {
    create(): TablePlayer
}

class JoinCreateActionFactory {
    static of(server: Server, senderWebSocket: uWS.WebSocket, joinData: JoinData, ): JoinCreateAction {
        const joinTimestamp = Timestamp.current()
        const table = server.tables.get(joinData.tableInfo.id)
        if (table === undefined) {
            return new CreateTableAction(server, senderWebSocket, joinData, joinTimestamp)
        }

        const playerId = joinData.playerInfo.id
        const player = table.players.find(player => player.playerInfo.id === playerId)

        if (player === undefined) {
            return new CreatePlayerAction(server, senderWebSocket, joinData, table)
        }

        return new CreateNoneAction(server, senderWebSocket, joinData, table, player)
    }
}

class CreateTableAction implements JoinCreateAction {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly joinData: JoinData,
        private readonly joinTimestamp: number
    ) { }

    create(): TablePlayer {
        const player = {
            ws: this.senderWebSocket,
            playerInfo: {
                ...this.joinData.playerInfo,
                bet: BetHelper.noBet(),
                gone: false
            }
        }

        const table = {
            tableInfo: {
                ...this.joinData.tableInfo,
                revealed: false
            },
            players: [player],
            createdTimestamp: this.joinTimestamp,
            activityTimestamp: this.joinTimestamp,
            lastRevealedByPlayer: null,
            lastResetByPlayer: null
        }

        log.info(`Adding table ${TableHelper.nameAndId(table)} with player ${PlayerHelper.nameAndId(player)}`)

        this.server.tables.set(this.joinData.tableInfo.id, table)

        this.recordStatsCreatedTables()

        const tablePlayer = { table, player }

        return tablePlayer
    }

    private recordStatsCreatedTables() {
        globalStats.record([
            { measure: MEASURE_CREATED_TABLES, value: 1 },
            { measure: MEASURE_PLAYERS_JOINED, value: 1 }
        ])
    }
}

class CreatePlayerAction implements JoinCreateAction {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly joinData: JoinData,
        private readonly table: Table
    ) { }

    create(): TablePlayer {
        const player = {
            ws: this.senderWebSocket,
            playerInfo: {
                ...this.joinData.playerInfo,
                bet: BetHelper.noBet(),
                gone: false
            }
        }
        this.table.players.push(player)
        log.info(`Added player ${PlayerHelper.nameAndId(player)} to table ${TableHelper.nameAndId(this.table)}`)
        this.recordStatsPlayersJoined()

        const table =  this.table
        const tablePlayer = { table, player }

        return tablePlayer
    }

    private recordStatsPlayersJoined() {
        globalStats.record([{ measure: MEASURE_PLAYERS_JOINED, value: 1 }])
    }
}

class CreateNoneAction implements JoinCreateAction {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly joinData: JoinData,
        private readonly table: Table,
        private readonly player: Player
    ) { }

    create(): TablePlayer {
        log.info(`Player ${PlayerHelper.nameAndId(this.player)} exists in table ${TableHelper.nameAndId(this.table)}, updating server record.`)
        const table = this.table
        const player = this.player
        player.ws = this.senderWebSocket
        player.playerInfo.gone = false
        const tablePlayer = { table, player }

        return tablePlayer
    }
}
