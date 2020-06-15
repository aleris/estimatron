import { BetHelper } from './model/Bet'
import { Player } from './Player'
import { DeckKind } from './model/Decks'
import { Table } from './Table'
import { WebSocket } from 'uWebSockets.js'
import { TablePlayer } from './model/TablePlayerInfo'

export function createTestTableInfo(index: number) {
    return {
        id: `table-id-${index}`,
        name: `table-name-${index}`,
        deckKind: DeckKind.Fibonacci,
        revealed: false
    }
}

export function createTestPlayerInfo(index: number) {
    return {
        id: `player-id-${index}`,
        name: `player-name-${index}`,
        bet: BetHelper.noBet(),
        observerMode: false,
        gone: false
    }
}

export function createTestTablePlayer(ws: WebSocket): TablePlayer {
    const playerInfo = createTestPlayerInfo(1)
    const player: Player = {
        ws,
        playerInfo
    }
    const tableInfo = createTestTableInfo(1)
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
