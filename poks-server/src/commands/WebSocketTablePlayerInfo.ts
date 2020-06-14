import * as uWS from 'uWebSockets.js'
import { TablePlayer, TablePlayerIds } from '../model/TablePlayerInfo'
import { Server } from '../Server'
import { logger } from '../logger'

const log = logger.child({ component: 'WebSocketTablePlayerInfo' })

export class WebSocketTablePlayerInfo {

    static saveTablePlayerIds(ws: uWS.WebSocket, tablePlayer: TablePlayer) {
        ws['tableId'] = tablePlayer.table.tableInfo.id
        ws['playerId'] = tablePlayer.player.playerInfo.id
    }

    static getTablePlayerInfoIds(ws: uWS.WebSocket): TablePlayerIds {
        return {
            tableId: ws['tableId'],
            playerId: ws['playerId']
        }
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
}
