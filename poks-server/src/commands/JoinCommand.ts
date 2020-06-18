import { WebSocket } from 'uWebSockets.js'
import { logger } from '../logger'
import { Monitoring } from '../Monitoring'
import { JoinData } from '../model/JoinData'
import { Command } from './Command'
import { Notification } from '../notifications/Notification'
import { OtherJoinedNotification } from '../notifications/OtherJoinedNotification'
import { JoinConfirmedNotification } from '../notifications/JoinConfirmedNotification'
import { TablePlayerHelper } from './TablePlayerHelper'
import { Player, PlayerHelper } from '../server/Player'
import { Table, TableHelper } from '../server/Table'
import { TablePlayer } from '../server/TablePlayer'
import { Server } from '../server/Server'
import { BetHelper } from '../model/Bet'
import { Timestamp } from '../model/Timestamp'
import { JoinDeniedReasons } from '../model/JoinDeniedNotificationData'
import { JoinDeniedNotification } from '../notifications/JoinDeniedNotification'
import { CloseCodes } from '../model/CloseCodes'

const log = logger.child({ component: 'JoinCommand' })

export class JoinCommand implements Command<JoinData> {
    static readonly MAX_PLAYERS_ON_TABLE = 6

    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: WebSocket,
        private readonly joinData: JoinData
    ) { }

    execute() {
        log.info(`Execute JoinCommand`, { joinData: this.joinData })

        const joinCreateAction = JoinCreateActionFactory.of(this.server, this.senderWebSocket, this.joinData)
        const result = joinCreateAction.create()

        const tablePlayer = result.tablePlayer
        TablePlayerHelper.saveTablePlayerIds(this.senderWebSocket, tablePlayer)

        Notification.subscribeAll(this.senderWebSocket, tablePlayer.table)

        if (result.joinAccepted) {
            new JoinConfirmedNotification(tablePlayer).send()
            new OtherJoinedNotification(tablePlayer).send()
        } else {
            if (result.joinDeniedReason !== null) {
                new JoinDeniedNotification(tablePlayer, result.joinDeniedReason).send()
                this.senderWebSocket.end(CloseCodes.JoinDeny, JoinDeniedReasons[result.joinDeniedReason])
            } else {
                log.error('Join denied reason must be set on result when join is not accepted')
            }
        }
    }
}

interface JoinCreateActionResult {
    tablePlayer: TablePlayer,
    joinAccepted: boolean,
    joinDeniedReason: JoinDeniedReasons | null
}

interface JoinCreateAction {
    create(): JoinCreateActionResult
}

class JoinCreateActionFactory {
    static of(server: Server, senderWebSocket: WebSocket, joinData: JoinData, ): JoinCreateAction {
        const joinTimestamp = Timestamp.current()
        const table = server.serverStorage.getTable(joinData.tableInfo.id)
        if (table === undefined) {
            return new CreateTableAction(server, senderWebSocket, joinData, joinTimestamp)
        }

        const playerId = joinData.playerInfo.id
        const player = TablePlayerHelper.findPlayer(table, playerId)

        if (player === undefined) {
            return new CreatePlayerAction(server, senderWebSocket, joinData, table)
        }

        return new CreateNoneAction(server, senderWebSocket, joinData, table, player)
    }
}

class CreateTableAction implements JoinCreateAction {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: WebSocket,
        private readonly joinData: JoinData,
        private readonly joinTimestamp: number
    ) { }

    create(): JoinCreateActionResult {
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

        this.server.serverStorage.saveTable(table)

        Monitoring.recordStatsCreatedTables()

        const tablePlayer = { table, player }

        return { tablePlayer, joinAccepted: true, joinDeniedReason: null }
    }
}

class CreatePlayerAction implements JoinCreateAction {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: WebSocket,
        private readonly joinData: JoinData,
        private readonly table: Table
    ) { }

    create(): JoinCreateActionResult {
        const player = {
            ws: this.senderWebSocket,
            playerInfo: {
                ...this.joinData.playerInfo,
                bet: BetHelper.noBet(),
                gone: false
            }
        }
        let joinAccepted
        if (this.table.players.length < JoinCommand.MAX_PLAYERS_ON_TABLE) {
            joinAccepted = true
            this.table.players.push(player)
            log.info(`Added player ${PlayerHelper.nameAndId(player)} to table ${TableHelper.nameAndId(this.table)}`)
        } else {
            joinAccepted = false
            log.info(`Max players reached, player ${PlayerHelper.nameAndId(player)} not added to table ${TableHelper.nameAndId(this.table)}`)
        }
        Monitoring.recordStatsPlayersJoined()

        const table =  this.table
        const tablePlayer = { table, player }

        return { tablePlayer, joinAccepted, joinDeniedReason: JoinDeniedReasons.MaxPlayersOnATable }
    }
}

class CreateNoneAction implements JoinCreateAction {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: WebSocket,
        private readonly joinData: JoinData,
        private readonly table: Table,
        private readonly player: Player
    ) { }

    create(): JoinCreateActionResult {
        log.info(`Player ${PlayerHelper.nameAndId(this.player)} exists in table ${TableHelper.nameAndId(this.table)}, updating server record.`)
        const table = this.table
        const player = this.player
        player.ws = this.senderWebSocket
        player.playerInfo.gone = false
        const tablePlayer = { table, player }

        return { tablePlayer, joinAccepted: true, joinDeniedReason: null }
    }
}
