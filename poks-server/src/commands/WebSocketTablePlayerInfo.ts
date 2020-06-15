import * as uWS from 'uWebSockets.js'
import { TablePlayer, TablePlayerIds } from '../model/TablePlayerInfo'
import { Server } from '../Server'
import { logger } from '../logger'
import { Table } from '../Table'
import { id } from '../model/id'
import { Player } from '../Player'

const log = logger.child({ component: 'WebSocketTablePlayerInfo' })

export class WebSocketTablePlayerInfo {

    static saveTablePlayerIds(ws: uWS.WebSocket, tablePlayer: TablePlayer) {
        ws['tableId'] = tablePlayer.table.tableInfo.id
        ws['playerId'] = tablePlayer.player.playerInfo.id
    }

    static getTablePlayer(server: Server, ws: uWS.WebSocket): TablePlayer {
        const { tableId, playerId } = this.getTablePlayerInfoIds(ws)
        const table = server.tables.get(tableId)
        if (table === undefined) {
            throw new Error(`Table ${tableId} not found on server`)
        }

        const player = table.players.find(player => player.playerInfo.id === playerId)
        if (player === undefined) {
            throw new Error(`Player ${playerId} not found on table ${tableId}`)
        }

        return {
            table,
            player
        }
    }

    static getTable(server: Server, ws: uWS.WebSocket): Table | undefined {
        const tableId = this.getTableInfoId(ws)
        return server.tables.get(tableId)
    }

    static getPlayer(table: Table, ws: uWS.WebSocket): Player | undefined {
        const { playerId } = this.getTablePlayerInfoIds(ws)
        return table.players.find(player => player.playerInfo.id === playerId)
    }

    private static getTablePlayerInfoIds(ws: uWS.WebSocket): TablePlayerIds {
        return {
            tableId: ws['tableId'],
            playerId: ws['playerId']
        }
    }

    private static getTableInfoId(ws: uWS.WebSocket): id {
        return ws['tableId']
    }
}
