import { WebSocket, WebSocketBehavior } from 'uWebSockets.js'
import { Player } from './server/Player'
import { Table } from './server/Table'
import { BetHelper } from './model/Bet'
import { DeckKind } from './model/Decks'
import { TablePlayer } from './model/TablePlayerInfo'
import { MessageData } from './model/Messages'

export function createTestTableInfo(index = 1) {
    return {
        id: `table-id-${index}`,
        name: `table-name-${index}`,
        deckKind: DeckKind.Fibonacci,
        revealed: false
    }
}

export function createTestPlayerInfo(index = 1) {
    return {
        id: `player-id-${index}`,
        name: `player-name-${index}`,
        bet: BetHelper.noBet(),
        observerMode: false,
        gone: false
    }
}

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
