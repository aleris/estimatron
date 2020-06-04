import * as uWS from 'uWebSockets.js'
import { TableInfo } from '../model/TableInfo'
import { PlayerInfo } from '../model/PlayerInfo'
import { TablePlayer, TablePlayerIds } from '../model/TablePlayerInfo'
import { Server } from '../Server'
import { logger } from '../logger'

const log = logger.child({ component: 'WebSocketTablePlayerInfo' })

export class WebSocketTablePlayerInfo {

    static saveTablePlayerIds(ws: uWS.WebSocket, tableInfo: TableInfo, playerInfo: PlayerInfo) {
        ws['tableId'] = tableInfo.id
        ws['playerId'] = playerInfo.id
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
            log.error(`Table ${tableId} not found on server`)
            return {
                table: undefined,
                player: undefined
            }
        }

        const player = table.players.find(player => player.playerInfo.id === playerId)
        if (player === undefined) {
            log.error(`Player ${playerId} not found on table ${tableId}`)
            return {
                table,
                player: undefined
            }
        }

        return {
            table,
            player
        }
    }
}
