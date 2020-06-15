import { TemplatedApp, WebSocket, WebSocketBehavior } from 'uWebSockets.js'
import { mock } from 'jest-mock-extended'
import { Server } from './Server'
import { MessageData, Messages } from './model/Messages'
import { JoinData } from './model/JoinData'
import { JoinConfirmedNotificationData } from './model/JoinConfirmedNotificationData'
import { OtherJoinedNotificationData } from './model/OtherJoinedNotificationData'
import { OtherLeftNotificationData } from './model/OtherLeftNotificationData'
import { createTestPlayer, createTestPlayerInfo, createTestTableInfo, createTestTablePlayer } from './TestUtils'

jest.mock('./model/Timestamp', () => ({
    Timestamp: {
        current: () => 123
    }
}))

describe(Server.name, () => {
    const app = mock<TemplatedApp>()
    const server = new Server(123, app)
    let wsSocketBehavior: WebSocketBehavior | undefined

    beforeAll(() => {
        app.get.mockImplementation(() => app)
        app.listen.mockImplementation(() => app)
        app.ws.mockImplementation((pattern, behavior) => {
            wsSocketBehavior = behavior
            return app
        })
        server.start()

    })

    afterAll(() => {
        server.stop()
    })

    test('join with missing table', () => {
        const tableInfo = createTestTableInfo(1)
        const playerInfo = createTestPlayerInfo(1)
        const message: MessageData<JoinData> = {
            kind: Messages.Join,
            data: {
                tableInfo,
                playerInfo
            }
        }
        const messageString = JSON.stringify(message)
        const messageBuffer = Buffer.alloc(messageString.length, messageString)
        const ws = mock<WebSocket>()
        wsSocketBehavior!.message!(ws, messageBuffer, false)
        const joinConfirmNotification: MessageData<JoinConfirmedNotificationData> = {
            kind: Messages.JoinConfirmedNotification,
            data: {
                tableInfo,
                players: [playerInfo]
            }
        }
        const serializedNotification = JSON.stringify(joinConfirmNotification)
        expect(ws.send).toHaveBeenCalledWith(serializedNotification)
        expect(server.tables.size).toStrictEqual(1)
        expect(server.tables.get('table-id-1')?.players.length).toStrictEqual(1)
        expect(server.tables.get('table-id-1')?.players[0].playerInfo.id).toStrictEqual('player-id-1')
    })

    test('join with existing table', () => {
        const wsPlayer1 = mock<WebSocket>()
        const tablePlayer1 = createTestTablePlayer(wsPlayer1)
        server.tables.set(tablePlayer1.table.tableInfo.id, tablePlayer1.table)
        const wsPlayer2 = mock<WebSocket>()
        const playerInfo2 = createTestPlayerInfo(2)
        const message: MessageData<JoinData> = {
            kind: Messages.Join,
            data: {
                tableInfo: tablePlayer1.table.tableInfo,
                playerInfo: playerInfo2
            }
        }
        const messageString = JSON.stringify(message)
        const messageBuffer = Buffer.alloc(messageString.length, messageString)
        wsSocketBehavior!.message!(wsPlayer2, messageBuffer, false)

        const joinConfirmNotification: MessageData<JoinConfirmedNotificationData> = {
            kind: Messages.JoinConfirmedNotification,
            data: {
                tableInfo: tablePlayer1.table.tableInfo,
                players: [tablePlayer1.player.playerInfo, playerInfo2]
            }
        }
        const serializedNotification = JSON.stringify(joinConfirmNotification)
        expect(wsPlayer2.send).toHaveBeenCalledWith(serializedNotification)

        const otherJoinedNotification: MessageData<OtherJoinedNotificationData> = {
            kind: Messages.OtherJoinedNotification,
            data: {
                playerInfo: playerInfo2
            }
        }
        expect(wsPlayer1.send).toHaveBeenCalledWith(JSON.stringify(otherJoinedNotification))
        expect(server.tables.size).toStrictEqual(1)
        expect(server.tables.get('table-id-1')?.players.length).toStrictEqual(2)
        expect(server.tables.get('table-id-1')?.players[0].playerInfo.id).toStrictEqual('player-id-1')
        expect(server.tables.get('table-id-1')?.players[1].playerInfo.id).toStrictEqual('player-id-2')
    })

    test('join with existing table and player', () => {
        const wsPlayer1 = mock<WebSocket>()
        const tablePlayer1 = createTestTablePlayer(wsPlayer1)
        const wsPlayer2 = mock<WebSocket>()
        const player2 = createTestPlayer(wsPlayer2, 2)
        server.tables.set(tablePlayer1.table.tableInfo.id, {
            tableInfo: tablePlayer1.table.tableInfo,
            players: [tablePlayer1.player, player2],
            createdTimestamp: 123,
            activityTimestamp: 123,
            lastRevealedByPlayer: null,
            lastResetByPlayer: null
        })
        const message: MessageData<JoinData> = {
            kind: Messages.Join,
            data: {
                tableInfo: tablePlayer1.table.tableInfo,
                playerInfo: player2.playerInfo
            }
        }
        const messageString = JSON.stringify(message)
        const messageBuffer = Buffer.alloc(messageString.length, messageString)
        wsSocketBehavior!.message!(wsPlayer2, messageBuffer, false)

        const joinConfirmNotification: MessageData<JoinConfirmedNotificationData> = {
            kind: Messages.JoinConfirmedNotification,
            data: {
                tableInfo: tablePlayer1.table.tableInfo,
                players: [tablePlayer1.player.playerInfo, player2.playerInfo]
            }
        }
        const serializedNotification = JSON.stringify(joinConfirmNotification)
        expect(wsPlayer2.send).toHaveBeenCalledWith(serializedNotification)

        const otherJoinedNotification: MessageData<OtherJoinedNotificationData> = {
            kind: Messages.OtherJoinedNotification,
            data: {
                playerInfo: player2.playerInfo
            }
        }
        expect(wsPlayer1.send).toHaveBeenCalledWith(JSON.stringify(otherJoinedNotification))
        expect(server.tables.get('table-id-1')?.players.length).toStrictEqual(2)
        expect(server.tables.get('table-id-1')?.players[0].playerInfo.id).toStrictEqual('player-id-1')
        expect(server.tables.get('table-id-1')?.players[1].playerInfo.id).toStrictEqual('player-id-2')
    })

    test('leave on connection closed', () => {
        const wsPlayer1 = mock<WebSocket>()
        const tablePlayer1 = createTestTablePlayer(wsPlayer1)
        const wsPlayer2 = mock<WebSocket>()
        const player2 = createTestPlayer(wsPlayer2, 2)
        server.tables.set(tablePlayer1.table.tableInfo.id, {
            tableInfo: tablePlayer1.table.tableInfo,
            players: [tablePlayer1.player, player2],
            createdTimestamp: 123,
            activityTimestamp: 123,
            lastRevealedByPlayer: null,
            lastResetByPlayer: null
        })
        wsPlayer1['tableId'] = tablePlayer1.table.tableInfo.id
        wsPlayer1['playerId'] = tablePlayer1.player.playerInfo.id
        wsPlayer2['tableId'] = tablePlayer1.table.tableInfo.id
        wsPlayer2['playerId'] = player2.playerInfo.id

        wsSocketBehavior!.close!(wsPlayer1, 10001, Buffer.alloc(0, ''))

        const otherLeftNotification: MessageData<OtherLeftNotificationData> = {
            kind: Messages.OtherLeftNotification,
            data: {
                playerId: tablePlayer1.player.playerInfo.id
            }
        }
        expect(wsPlayer2.send).toHaveBeenCalledWith(JSON.stringify(otherLeftNotification))
        expect(server.tables.get('table-id-1')?.players.length).toStrictEqual(2)
        expect(server.tables.get('table-id-1')?.players[0].playerInfo.gone).toStrictEqual(true)
        expect(server.tables.get('table-id-1')?.players[1].playerInfo.gone).toStrictEqual(false)
    })
})
