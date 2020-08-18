import { WebSocket, WebSocketBehavior } from 'uWebSockets.js'
import { MessageData } from '../model/Messages'
import { Player } from './Player'
import { Table } from './Table'
import { TablePlayer } from './TablePlayer'
import { createTestPlayerInfo, createTestTableInfo } from '../model/TablePlayerInfo.test-utils'

export function createTestTablePlayer(ws: WebSocket, index = 1): TablePlayer {
    const playerInfo = createTestPlayerInfo(index)
    const player: Player = {
        ws,
        playerInfo
    }
    const tableInfo = createTestTableInfo(index)
    const table: Table = {
        tableInfo,
        players: [player],
        createdTimestamp: 123,
        activityTimestamp: 123,
        lastRevealedByPlayer: null,
        lastResetByPlayer: null
    }
    return { table, player }
}

export function createTestPlayer(ws: WebSocket, index: number): Player {
    const playerInfo = createTestPlayerInfo(index)
    const player: Player = {
        ws,
        playerInfo
    }
    return player
}

export function sendTestMessage<T>(wsSocketBehavior: WebSocketBehavior, ws: WebSocket, message: MessageData<T>) {
    const messageString = JSON.stringify(message)
    const messageBuffer = Buffer.alloc(messageString.length, messageString)
    wsSocketBehavior.message!(ws, messageBuffer, false)
}
