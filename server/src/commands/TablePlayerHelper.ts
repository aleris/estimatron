import { WebSocket } from 'uWebSockets.js'
import { TablePlayerIds } from '../model/TablePlayerInfo'
import { logger } from '../logger'
import { Server } from '../server/Server'
import { Table } from '../server/Table'
import { Player } from '../server/Player'
import { TablePlayer } from '../server/TablePlayer'
import { id } from '../model/id'

const log = logger.child({ component: 'TablePlayerHelper' })

export class TablePlayerHelper {

    static saveTablePlayerIds(ws: WebSocket, tablePlayer: TablePlayer) {
        ws['tableId'] = tablePlayer.table.tableInfo.id
        ws['playerId'] = tablePlayer.player.playerInfo.id
    }

    static getTablePlayer(server: Server, ws: WebSocket): TablePlayer {
        const { tableId, playerId } = this.getTablePlayerInfoIds(ws)
        const table = server.serverStorage.getTable(tableId)
        if (table === undefined) {
            throw new Error(`Table ${tableId} not found on server`)
        }

        const player = TablePlayerHelper.findPlayer(table, playerId)
        if (player === undefined) {
            throw new Error(`Player ${playerId} not found on table ${tableId}`)
        }

        return {
            table,
            player
        }
    }

    static getTable(server: Server, ws: WebSocket): Table | undefined {
        const tableId = this.getTableInfoId(ws)
        return server.serverStorage.getTable(tableId)
    }

    static getPlayer(table: Table, ws: WebSocket): Player | undefined {
        const playerId = this.getPlayerInfoId(ws)
        return this.findPlayer(table, playerId)
    }

    static findPlayer(table: Table, playerId: id): Player | undefined {
        return table.players.find(player => player.playerInfo.id === playerId)
    }

    private static getTablePlayerInfoIds(ws: WebSocket): TablePlayerIds {
        return {
            tableId: ws['tableId'],
            playerId: ws['playerId']
        }
    }

    private static getTableInfoId(ws: WebSocket): id {
        return ws['tableId']
    }

    private static getPlayerInfoId(ws: WebSocket): id {
        return ws['playerId']
    }
}
