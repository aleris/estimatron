import * as uWS from 'uWebSockets.js'
import { Server } from '../Server'
import { Command } from './Command'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { RevealBetsNotification } from '../notifications/RevealBetsNotification'
import { RevealBetsData } from '../model/RevealBetsData'
import { logger } from '../logger'
import { globalStats, TagMap } from '@opencensus/core'
import { MEASURE_GAMES_PLAYED, TAG_PLAYERS_ON_TABLE } from '../monitoring'
import { Table } from '../Table'

const log = logger.child({ component: 'RevealBetsCommand' })

export class RevealBetsCommand implements Command<RevealBetsData> {

    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly revealBetsData: RevealBetsData
    ) { }

    execute() {
        const tablePlayer = WebSocketTablePlayerInfo.getTablePlayer(this.server, this.senderWebSocket)


        const table = tablePlayer.table
        log.info(
            `Execute RevealBetsCommand`,
            { revealBetsData: this.revealBetsData, tableId: table.tableInfo.id, playerId: tablePlayer.player.playerInfo.id }
        )

        table.activityTimestamp = this.server.getTimestamp()
        table.tableInfo.revealed = true
        table.lastRevealedByPlayer = tablePlayer.player

        new RevealBetsNotification(tablePlayer).send()

        this.recordStatsGamesPlayed(table)
    }

    private recordStatsGamesPlayed(table: Table) {
        const tags = new TagMap()
        tags.set(TAG_PLAYERS_ON_TABLE, {value: table.players.length.toString()})
        globalStats.record([{measure: MEASURE_GAMES_PLAYED, value: 1}], tags)
    }
}
