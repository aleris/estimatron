import { mock } from 'jest-mock-extended'
import { createTestPlayer, createTestTablePlayer } from '../TestUtils'
import { TablePlayerHelper } from './TablePlayerHelper'
import { TemplatedApp, WebSocket } from 'uWebSockets.js'
import { Server } from '../server/Server'
import { MemoryServerStorage } from '../server/MemoryServerStorage'

describe(TablePlayerHelper.name, () => {
    test('saveTablePlayerIds', () => {
        const ws = mock<WebSocket>()
        const tablePlayer = createTestTablePlayer(ws)
        TablePlayerHelper.saveTablePlayerIds(ws, tablePlayer)
        expect(ws['tableId']).toStrictEqual('table-id-1')
        expect(ws['playerId']).toStrictEqual('player-id-1')
    })

    test('getTablePlayer', () => {
        const ws = mock<WebSocket>()
        const tablePlayer = createTestTablePlayer(ws)
        const server = new Server(0, mock<TemplatedApp>(), new MemoryServerStorage())
        server.serverStorage.saveTable(tablePlayer.table)
        TablePlayerHelper.saveTablePlayerIds(ws, tablePlayer)
        const result = TablePlayerHelper.getTablePlayer(server, ws)
        expect(result).toStrictEqual(tablePlayer)
    })

    test('getTable', () => {
        const ws = mock<WebSocket>()
        const tablePlayer = createTestTablePlayer(ws)
        const server = new Server(0, mock<TemplatedApp>(), new MemoryServerStorage())
        server.serverStorage.saveTable(tablePlayer.table)
        TablePlayerHelper.saveTablePlayerIds(ws, tablePlayer)
        const result = TablePlayerHelper.getTable(server, ws)
        expect(result).toStrictEqual(tablePlayer.table)
    })

    test('getTable not found', () => {
        const ws = mock<WebSocket>()
        const tablePlayer = createTestTablePlayer(ws)
        const server = new Server(0, mock<TemplatedApp>(), new MemoryServerStorage())
        server.serverStorage.saveTable(tablePlayer.table)
        ws['tableId'] = 'does-not-exist'
        const result = TablePlayerHelper.getTable(server, ws)
        expect(result).toBeUndefined()
    })

    test('getPlayer', () => {
        const ws = mock<WebSocket>()
        const tablePlayer = createTestTablePlayer(ws)
        const server = new Server(0, mock<TemplatedApp>(), new MemoryServerStorage())
        server.serverStorage.saveTable(tablePlayer.table)
        TablePlayerHelper.saveTablePlayerIds(ws, tablePlayer)
        const result = TablePlayerHelper.getPlayer(tablePlayer.table, ws)
        expect(result).toStrictEqual(tablePlayer.player)
    })

    test('getPlayer not found', () => {
        const ws = mock<WebSocket>()
        const tablePlayer = createTestTablePlayer(ws)
        const server = new Server(0, mock<TemplatedApp>(), new MemoryServerStorage())
        server.serverStorage.saveTable(tablePlayer.table)
        TablePlayerHelper.saveTablePlayerIds(ws, tablePlayer)
        ws['playerId'] = 'does-not-exist'
        const result = TablePlayerHelper.getPlayer(tablePlayer.table, ws)
        expect(result).toBeUndefined()
    })

    test('findPlayer', () => {
        const tablePlayer1 = createTestTablePlayer(mock<WebSocket>())
        const player2 = createTestPlayer(mock<WebSocket>(), 2)
        tablePlayer1.table.players.push(player2)
        const player3 = createTestPlayer(mock<WebSocket>(), 3)
        tablePlayer1.table.players.push(player3)
        const result = TablePlayerHelper.findPlayer(tablePlayer1.table, player2.playerInfo.id)
        expect(result).toStrictEqual(player2)
    })

    test('findPlayer not found', () => {
        const tablePlayer1 = createTestTablePlayer(mock<WebSocket>())
        const player2 = createTestPlayer(mock<WebSocket>(), 2)
        tablePlayer1.table.players.push(player2)
        const result = TablePlayerHelper.findPlayer(tablePlayer1.table, 'does-not-exists')
        expect(result).toBeUndefined()
    })
})
