import { TemplatedApp, WebSocket, WebSocketBehavior } from 'uWebSockets.js'
import { mock } from 'jest-mock-extended'
import { MemoryServerStorage } from './MemoryServerStorage'
import { Server } from './Server'
import { Notification } from '../notifications/Notification'
import { MessageData, Messages } from '../model/Messages'
import { JoinData } from '../model/JoinData'
import { JoinConfirmedNotificationData } from '../model/JoinConfirmedNotificationData'
import { OtherJoinedNotificationData } from '../model/OtherJoinedNotificationData'
import { OtherLeftNotificationData } from '../model/OtherLeftNotificationData'
import { RevealBetsData } from '../model/RevealBetsData'
import { RevealBetsNotificationData } from '../model/RevealBetsNotificationData'
import { TablePlayerHelper } from '../commands/TablePlayerHelper'
import { ResetTableData } from '../model/ResetTableData'
import { ResetTableNotificationData } from '../model/ResetTableNotificationData'
import { BetHelper } from '../model/Bet'
import { BetData } from '../model/BetData'
import { OtherBetNotificationData } from '../model/OtherBetNotificationData'
import { ChangePlayerOptionsData } from '../model/ChangePlayerOptionsData'
import { ChangePlayerOptionsNotificationData } from '../model/ChangePlayerOptionsNotificationData'
import { ChangeTableOptionsData } from '../model/ChangeTableOptionsData'
import { ChangeTableOptionsNotificationData } from '../model/ChangeTableOptionsNotificationData'
import { DeckKind } from '../model/Decks'
import { JoinDeniedNotificationData, JoinDeniedReasons } from '../model/JoinDeniedNotificationData'
import { JoinCommand } from '../commands/JoinCommand'
import { CloseCodes } from '../model/CloseCodes'
import { createTestPlayerInfo, createTestTableInfo } from '../model/TablePlayerInfo.test-utils'
import { createTestPlayer, createTestTablePlayer, sendTestMessage } from './TablePlayer.test-utils'

jest.mock('../model/Timestamp', () => ({
    Timestamp: {
        current: () => 123
    }
}))

describe(Server.name, () => {
    const app = mock<TemplatedApp>()
    const serverStorage = new MemoryServerStorage()
    const server = new Server(123, app, serverStorage, false)
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
        const tableInfo = createTestTableInfo()
        const playerInfo = createTestPlayerInfo()
        const message: MessageData<JoinData> = {
            kind: Messages.Join,
            data: {
                tableInfo,
                playerInfo
            }
        }
        const ws = mock<WebSocket>()
        sendTestMessage(wsSocketBehavior!, ws, message)

        const joinConfirmNotification: MessageData<JoinConfirmedNotificationData> = {
            kind: Messages.JoinConfirmedNotification,
            data: {
                tableInfo,
                players: [playerInfo]
            }
        }
        const serializedNotification = JSON.stringify(joinConfirmNotification)
        expect(ws.send).toHaveBeenCalledWith(serializedNotification)
        expect(server.serverStorage.tablesCount).toStrictEqual(1)
        expect(server.serverStorage.getTable('table-id-1')?.players.length).toStrictEqual(1)
        expect(server.serverStorage.getTable('table-id-1')?.players[0].playerInfo.id).toStrictEqual('player-id-1')
    })

    test('join with existing table', () => {
        const wsPlayer1 = mock<WebSocket>()
        const tablePlayer1 = createTestTablePlayer(wsPlayer1)
        server.serverStorage.saveTable(tablePlayer1.table)
        const wsPlayer2 = mock<WebSocket>()
        const playerInfo2 = createTestPlayerInfo(2)
        const message: MessageData<JoinData> = {
            kind: Messages.Join,
            data: {
                tableInfo: tablePlayer1.table.tableInfo,
                playerInfo: playerInfo2
            }
        }
        sendTestMessage(wsSocketBehavior!, wsPlayer2, message)

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
        expect(server.serverStorage.tablesCount).toStrictEqual(1)
        expect(server.serverStorage.getTable('table-id-1')?.players.length).toStrictEqual(2)
        expect(server.serverStorage.getTable('table-id-1')?.players[0].playerInfo.id).toStrictEqual('player-id-1')
        expect(server.serverStorage.getTable('table-id-1')?.players[1].playerInfo.id).toStrictEqual('player-id-2')
    })

    test('join with existing table and player', () => {
        const wsPlayer1 = mock<WebSocket>()
        const tablePlayer1 = createTestTablePlayer(wsPlayer1)
        const wsPlayer2 = mock<WebSocket>()
        const player2 = createTestPlayer(wsPlayer2, 2)
        const table = {
            tableInfo: tablePlayer1.table.tableInfo,
            players: [tablePlayer1.player, player2],
            createdTimestamp: 123,
            activityTimestamp: 123,
            lastRevealedByPlayer: null,
            lastResetByPlayer: null
        }
        server.serverStorage.saveTable(table)
        const message: MessageData<JoinData> = {
            kind: Messages.Join,
            data: {
                tableInfo: tablePlayer1.table.tableInfo,
                playerInfo: player2.playerInfo
            }
        }
        sendTestMessage(wsSocketBehavior!, wsPlayer2, message)

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
        expect(server.serverStorage.getTable('table-id-1')?.players.length).toStrictEqual(2)
        expect(server.serverStorage.getTable('table-id-1')?.players[0].playerInfo.id).toStrictEqual('player-id-1')
        expect(server.serverStorage.getTable('table-id-1')?.players[1].playerInfo.id).toStrictEqual('player-id-2')
    })

    test('join deny when table full', () => {
        (JoinCommand as any)['MAX_PLAYERS_ON_TABLE'] = 2

        const wsPlayer1 = mock<WebSocket>()
        const tablePlayer1 = createTestTablePlayer(wsPlayer1)
        for (let i = 2; i <= JoinCommand.MAX_PLAYERS_ON_TABLE; i++) {
            tablePlayer1.table.players.push(createTestPlayer(mock<WebSocket>(), i))
        }
        serverStorage.saveTable(tablePlayer1.table)

        const wsPlayerMax = mock<WebSocket>()
        const playerMax = createTestPlayer(wsPlayerMax, JoinCommand.MAX_PLAYERS_ON_TABLE + 1)
        const message: MessageData<JoinData> = {
            kind: Messages.Join,
            data: {
                tableInfo: tablePlayer1.table.tableInfo,
                playerInfo: playerMax.playerInfo
            }
        }
        sendTestMessage(wsSocketBehavior!, wsPlayerMax, message)

        const joinDenyNotification: MessageData<JoinDeniedNotificationData> = {
            kind: Messages.JoinDeniedNotification,
            data: {
                reason: JoinDeniedReasons.MaxPlayersOnATable
            }
        }
        const serializedNotification = JSON.stringify(joinDenyNotification)
        expect(wsPlayerMax.send).toHaveBeenCalledWith(serializedNotification)
        expect(wsPlayerMax.end).toHaveBeenCalledWith(CloseCodes.JoinDeny, JoinDeniedReasons[JoinDeniedReasons.MaxPlayersOnATable])
        expect(server.serverStorage.getTable('table-id-1')?.players.length).toStrictEqual(JoinCommand.MAX_PLAYERS_ON_TABLE)
    })


    test('join deny when no more tables', () => {
        (JoinCommand as any)['MAX_TABLES'] = 2

        for (let i = 1; i <= JoinCommand.MAX_TABLES; i++) {
            const wsPlayerExisting = mock<WebSocket>()
            const tablePlayerExisting = createTestTablePlayer(wsPlayerExisting, i)
            serverStorage.saveTable(tablePlayerExisting.table)
        }

        const wsPlayerMax = mock<WebSocket>()
        const tablePlayerMax = createTestTablePlayer(wsPlayerMax, JoinCommand.MAX_TABLES + 1)
        const message: MessageData<JoinData> = {
            kind: Messages.Join,
            data: {
                tableInfo: tablePlayerMax.table.tableInfo,
                playerInfo: tablePlayerMax.player.playerInfo
            }
        }
        sendTestMessage(wsSocketBehavior!, wsPlayerMax, message)

        const joinDenyNotification: MessageData<JoinDeniedNotificationData> = {
            kind: Messages.JoinDeniedNotification,
            data: {
                reason: JoinDeniedReasons.MaxTables
            }
        }
        const serializedNotification = JSON.stringify(joinDenyNotification)
        expect(wsPlayerMax.send).toHaveBeenCalledWith(serializedNotification)
        expect(wsPlayerMax.end).toHaveBeenCalledWith(CloseCodes.JoinDeny, JoinDeniedReasons[JoinDeniedReasons.MaxTables])
        expect(server.serverStorage.tablesCount).toStrictEqual(JoinCommand.MAX_TABLES)
    })

    test('leave on connection closed', () => {
        const wsPlayer1 = mock<WebSocket>()
        const tablePlayer1 = createTestTablePlayer(wsPlayer1)
        const wsPlayer2 = mock<WebSocket>()
        const player2 = createTestPlayer(wsPlayer2, 2)
        const table = {
            tableInfo: tablePlayer1.table.tableInfo,
            players: [tablePlayer1.player, player2],
            createdTimestamp: 123,
            activityTimestamp: 123,
            lastRevealedByPlayer: null,
            lastResetByPlayer: null
        }
        server.serverStorage.saveTable(table)
        wsPlayer1['tableId'] = tablePlayer1.table.tableInfo.id
        wsPlayer1['playerId'] = tablePlayer1.player.playerInfo.id
        wsPlayer2['tableId'] = tablePlayer1.table.tableInfo.id
        wsPlayer2['playerId'] = player2.playerInfo.id

        wsSocketBehavior!.close!(wsPlayer1, 10001, Buffer.alloc(0, ''))

        const notification: MessageData<OtherLeftNotificationData> = {
            kind: Messages.OtherLeftNotification,
            data: {
                playerId: tablePlayer1.player.playerInfo.id
            }
        }
        expect(wsPlayer2.send).toHaveBeenCalledWith(JSON.stringify(notification))
        const targetTable = server.serverStorage.getTable('table-id-1')
        expect(targetTable?.players.length).toStrictEqual(2)
        expect(targetTable?.players[0].playerInfo.gone).toStrictEqual(true)
        expect(targetTable?.players[1].playerInfo.gone).toStrictEqual(false)
    })

    test('leave last player frees the table', () => {
        const wsPlayer1 = mock<WebSocket>()
        const tablePlayer1 = createTestTablePlayer(wsPlayer1)
        const wsPlayer2 = mock<WebSocket>()
        const player2 = createTestPlayer(wsPlayer2, 2)
        const table = {
            tableInfo: tablePlayer1.table.tableInfo,
            players: [tablePlayer1.player, player2],
            createdTimestamp: 123,
            activityTimestamp: 123,
            lastRevealedByPlayer: null,
            lastResetByPlayer: null
        }
        server.serverStorage.saveTable(table)
        wsPlayer1['tableId'] = tablePlayer1.table.tableInfo.id
        wsPlayer1['playerId'] = tablePlayer1.player.playerInfo.id
        wsPlayer2['tableId'] = tablePlayer1.table.tableInfo.id
        wsPlayer2['playerId'] = player2.playerInfo.id

        wsSocketBehavior!.close!(wsPlayer1, 10001, Buffer.alloc(0, ''))
        expect(wsPlayer2.send).toHaveBeenCalled()
        wsSocketBehavior!.close!(wsPlayer2, 10001, Buffer.alloc(0, ''))

        expect(server.serverStorage.getTable(table.tableInfo.id)).toBeUndefined()
    })

    test('bet', () => {
        const wsPlayer1 = mock<WebSocket>()
        const tablePlayer1 = createTestTablePlayer(wsPlayer1)
        const wsPlayer2 = mock<WebSocket>()
        const player2 = createTestPlayer(wsPlayer2, 2)
        server.serverStorage.saveTable(tablePlayer1.table)
        tablePlayer1.table.players.push(player2)
        TablePlayerHelper.saveTablePlayerIds(wsPlayer1, tablePlayer1)
        TablePlayerHelper.saveTablePlayerIds(wsPlayer2, { table: tablePlayer1.table, player: player2 })

        const bet = BetHelper.betWith('5')
        const message: MessageData<BetData> = {
            kind: Messages.Bet,
            data: {
                bet
            }
        }
        sendTestMessage(wsSocketBehavior!, wsPlayer2, message)

        const notification: MessageData<OtherBetNotificationData> = {
            kind: Messages.OtherBetNotification,
            data: {
                playerId: player2.playerInfo.id,
                bet: BetHelper.hide(bet)
            }
        }
        const serializedNotification = JSON.stringify(notification)
        expect(wsPlayer1.send).toHaveBeenCalledWith(serializedNotification)
        expect(wsPlayer2.send).not.toHaveBeenCalled()
        const targetTable = server.serverStorage.getTable(tablePlayer1.table.tableInfo.id)
        expect(targetTable!.players[0].playerInfo.bet.estimation).toStrictEqual(BetHelper.noBet().estimation)
        expect(targetTable!.players[1].playerInfo.bet.estimation).toStrictEqual(bet.estimation)
    })

    test('reveal bets', () => {
        const wsPlayer1 = mock<WebSocket>()
        const tablePlayer1 = createTestTablePlayer(wsPlayer1)
        const wsPlayer2 = mock<WebSocket>()
        const player2 = createTestPlayer(wsPlayer2, 2)
        server.serverStorage.saveTable(tablePlayer1.table)
        tablePlayer1.table.players.push(player2)
        TablePlayerHelper.saveTablePlayerIds(wsPlayer1, tablePlayer1)
        TablePlayerHelper.saveTablePlayerIds(wsPlayer2, { table: tablePlayer1.table, player: player2 })

        const message: MessageData<RevealBetsData> = {
            kind: Messages.RevealBets,
            data: { }
        }
        sendTestMessage(wsSocketBehavior!, wsPlayer2, message)

        const notification: MessageData<RevealBetsNotificationData> = {
            kind: Messages.RevealBetsNotification,
            data: {
                revealedBy: player2.playerInfo,
                players: [tablePlayer1.player.playerInfo, player2.playerInfo]
            }
        }
        const serializedNotification = JSON.stringify(notification)
        expect(wsPlayer2.publish).toHaveBeenCalledWith(
            Notification.getTopicName(tablePlayer1.table, Messages.RevealBetsNotification),
            serializedNotification
        )
        const targetTable = server.serverStorage.getTable(tablePlayer1.table.tableInfo.id)
        expect(targetTable!.tableInfo.revealed).toStrictEqual(true)
        expect(targetTable!.lastRevealedByPlayer).toStrictEqual(player2)
    })

    test('reset table', () => {
        const wsPlayer1 = mock<WebSocket>()
        const tablePlayer1 = createTestTablePlayer(wsPlayer1)
        const wsPlayer2 = mock<WebSocket>()
        const player2 = createTestPlayer(wsPlayer2, 2)
        server.serverStorage.saveTable(tablePlayer1.table)
        tablePlayer1.table.players.push(player2)
        TablePlayerHelper.saveTablePlayerIds(wsPlayer1, tablePlayer1)
        TablePlayerHelper.saveTablePlayerIds(wsPlayer2, { table: tablePlayer1.table, player: player2 })

        tablePlayer1.table.tableInfo.revealed = true
        tablePlayer1.table.players[0].playerInfo.bet = BetHelper.betWith('5')

        const message: MessageData<ResetTableData> = {
            kind: Messages.ResetTable,
            data: { }
        }
        sendTestMessage(wsSocketBehavior!, wsPlayer2, message)
        const notification: MessageData<ResetTableNotificationData> = {
            kind: Messages.ResetTableNotification,
            data: {
                resetBy: player2.playerInfo,
                players: [tablePlayer1.player.playerInfo, player2.playerInfo]
            }
        }
        const serializedNotification = JSON.stringify(notification)
        expect(wsPlayer2.publish).toHaveBeenCalledWith(
            Notification.getTopicName(tablePlayer1.table, Messages.ResetTableNotification),
            serializedNotification
        )
        const targetTable = server.serverStorage.getTable(tablePlayer1.table.tableInfo.id)
        expect(targetTable!.tableInfo.revealed).toStrictEqual(false)
        expect(targetTable!.players[0].playerInfo.bet.estimation).toStrictEqual(BetHelper.noBet().estimation)
        expect(targetTable!.lastResetByPlayer).toStrictEqual(player2)
    })

    test('change player options', () => {
        const wsPlayer1 = mock<WebSocket>()
        const tablePlayer1 = createTestTablePlayer(wsPlayer1)
        const wsPlayer2 = mock<WebSocket>()
        const player2 = createTestPlayer(wsPlayer2, 2)
        server.serverStorage.saveTable(tablePlayer1.table)
        tablePlayer1.table.players.push(player2)
        TablePlayerHelper.saveTablePlayerIds(wsPlayer1, tablePlayer1)
        TablePlayerHelper.saveTablePlayerIds(wsPlayer2, { table: tablePlayer1.table, player: player2 })

        const message: MessageData<ChangePlayerOptionsData> = {
            kind: Messages.ChangePlayerOptions,
            data: {
                playerOptions: {
                    id: player2.playerInfo.id,
                    name: 'changed-name',
                    observerMode: true
                }
            }
        }
        sendTestMessage(wsSocketBehavior!, wsPlayer2, message)

        const notification: MessageData<ChangePlayerOptionsNotificationData> = {
            kind: Messages.ChangePlayerOptionsNotification,
            data: {
                playerOptions: message.data.playerOptions
            }
        }
        const serializedNotification = JSON.stringify(notification)
        expect(wsPlayer2.publish).toHaveBeenCalledWith(
            Notification.getTopicName(tablePlayer1.table, Messages.ChangePlayerOptionsNotification),
            serializedNotification
        )
        const targetTable = server.serverStorage.getTable(tablePlayer1.table.tableInfo.id)
        expect(targetTable!.players[0].playerInfo.name).toStrictEqual('player-name-1')
        expect(targetTable!.players[0].playerInfo.observerMode).toStrictEqual(false)
        expect(targetTable!.players[1].playerInfo.name).toStrictEqual('changed-name')
        expect(targetTable!.players[1].playerInfo.observerMode).toStrictEqual(true)
    })

    test('change table options', () => {
        const wsPlayer1 = mock<WebSocket>()
        const tablePlayer1 = createTestTablePlayer(wsPlayer1)
        const wsPlayer2 = mock<WebSocket>()
        const player2 = createTestPlayer(wsPlayer2, 2)
        server.serverStorage.saveTable(tablePlayer1.table)
        tablePlayer1.table.players.push(player2)
        TablePlayerHelper.saveTablePlayerIds(wsPlayer1, tablePlayer1)
        TablePlayerHelper.saveTablePlayerIds(wsPlayer2, { table: tablePlayer1.table, player: player2 })

        const message: MessageData<ChangeTableOptionsData> = {
            kind: Messages.ChangeTableOptions,
            data: {
                tableOptions: {
                    changedByPlayerId: player2.playerInfo.id,
                    name: 'changed-name',
                    deckKind: DeckKind.TShirts
                }
            }
        }
        sendTestMessage(wsSocketBehavior!, wsPlayer2, message)

        const notification: MessageData<ChangeTableOptionsNotificationData> = {
            kind: Messages.ChangeTableOptionsNotification,
            data: {
                tableOptions: message.data.tableOptions
            }
        }
        const serializedNotification = JSON.stringify(notification)
        expect(wsPlayer2.publish).toHaveBeenCalledWith(
            Notification.getTopicName(tablePlayer1.table, Messages.ChangeTableOptionsNotification),
            serializedNotification
        )
        const targetTable = server.serverStorage.getTable(tablePlayer1.table.tableInfo.id)
        expect(targetTable!.tableInfo.name).toStrictEqual('changed-name')
        expect(targetTable!.tableInfo.deckKind).toStrictEqual(DeckKind.TShirts)
    })
})
