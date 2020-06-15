import { mock } from 'jest-mock-extended'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { TemplatedApp, WebSocket } from 'uWebSockets.js'
import { Server } from '../Server'
import { createTestTablePlayer } from '../TestUtils'

describe(WebSocketTablePlayerInfo.name, () => {
    test('saveTablePlayerIds', () => {
        const ws = mock<WebSocket>()
        const tablePlayer = createTestTablePlayer(ws)
        WebSocketTablePlayerInfo.saveTablePlayerIds(ws, tablePlayer)
        expect(ws['tableId']).toStrictEqual('table-id-1')
        expect(ws['playerId']).toStrictEqual('player-id-1')
    })

    test('getTablePlayer', () => {
        const ws = mock<WebSocket>()
        const tablePlayer = createTestTablePlayer(ws)
        const server = new Server(0, mock<TemplatedApp>())
        server.tables.set(tablePlayer.table.tableInfo.id, tablePlayer.table)
        WebSocketTablePlayerInfo.saveTablePlayerIds(ws, tablePlayer)
        const result = WebSocketTablePlayerInfo.getTablePlayer(server, ws)
        expect(result).toStrictEqual(tablePlayer)
    })

    test('getTable', () => {
        const ws = mock<WebSocket>()
        const tablePlayer = createTestTablePlayer(ws)
        const server = new Server(0, mock<TemplatedApp>())
        server.tables.set(tablePlayer.table.tableInfo.id, tablePlayer.table)
        WebSocketTablePlayerInfo.saveTablePlayerIds(ws, tablePlayer)
        const result = WebSocketTablePlayerInfo.getTable(server, ws)
        expect(result).toStrictEqual(tablePlayer.table)
    })

    test('getTable not found', () => {
        const ws = mock<WebSocket>()
        const tablePlayer = createTestTablePlayer(ws)
        const server = new Server(0, mock<TemplatedApp>())
        server.tables.set(tablePlayer.table.tableInfo.id, tablePlayer.table)
        ws['tableId'] = 'does-not-exist'
        const result = WebSocketTablePlayerInfo.getTable(server, ws)
        expect(result).toBeUndefined()
    })
})
