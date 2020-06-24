import { mock } from 'jest-mock-extended'
import { MessageData, Messages } from '@server/model/Messages'
import { createTestPlayerInfo, createTestTableInfo } from '@server/model/TablePlayerInfo.test-utils'
import { BetHelper } from '@server/model/Bet'
import { DeckKind } from '@server/model/Decks'
import { JoinConfirmedNotificationData } from '@server/model/JoinConfirmedNotificationData'
import { OtherJoinedNotificationData } from '@server/model/OtherJoinedNotificationData'
import { JoinDeniedNotificationData, JoinDeniedReasons } from '@server/model/JoinDeniedNotificationData'
import { OtherBetNotificationData } from '@server/model/OtherBetNotificationData'
import { OtherLeftNotificationData } from '@server/model/OtherLeftNotificationData'
import { RevealBetsNotificationData } from '@server/model/RevealBetsNotificationData'
import { ResetTableNotificationData } from '@server/model/ResetTableNotificationData'
import { ChangeTableOptionsNotificationData } from '@server/model/ChangeTableOptionsNotificationData'
import { ChangePlayerOptionsNotificationData } from '@server/model/ChangePlayerOptionsNotificationData'
import { JoinData } from '@server/model/JoinData'
import { BetData } from '@server/model/BetData'
import { RevealBetsData } from '@server/model/RevealBetsData'
import { ResetTableData } from '@server/model/ResetTableData'
import { ChangeTableOptionsData } from '@server/model/ChangeTableOptionsData'
import { ChangePlayerOptionsData } from '@server/model/ChangePlayerOptionsData'
import { WebSocketHeartBeat } from '@/pages/app/WebSocketHeartBeat'
import { Server } from '@/pages/app/Server'

jest.spyOn(console, 'log').mockImplementation()

describe(Server.name, () => {
    test('open', () => {
        const webSocket = mock<WebSocket>()
        webSocket.onopen = jest.fn()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        server.onConnectionOpened = jest.fn()
        webSocket.onopen.call(webSocket, { type: 'open' } as Event)
        expect(server.onConnectionOpened).toHaveBeenCalled()
    })

    test('onJoinConfirmed', () => {
        const webSocket = mock<WebSocket>()
        webSocket.onmessage = jest.fn()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        server.onJoinConfirmed = jest.fn()
        const data: JoinConfirmedNotificationData = {
            tableInfo: createTestTableInfo(),
            players: [createTestPlayerInfo()]
        }
        const messageData: MessageData<JoinConfirmedNotificationData> = {
            kind: Messages.JoinConfirmedNotification,
            data
        }
        webSocket.onmessage.call(webSocket, { type: 'message', data: JSON.stringify(messageData) } as MessageEvent)
        expect(server.onJoinConfirmed).toHaveBeenCalledWith(data)
    })

    test('onOtherJoined', () => {
        const webSocket = mock<WebSocket>()
        webSocket.onmessage = jest.fn()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        server.onOtherJoined = jest.fn()
        const data: OtherJoinedNotificationData = {
            playerInfo: createTestPlayerInfo()
        }
        const messageData: MessageData<OtherJoinedNotificationData> = {
            kind: Messages.OtherJoinedNotification,
            data
        }
        webSocket.onmessage.call(webSocket, { type: 'message', data: JSON.stringify(messageData) } as MessageEvent)
        expect(server.onOtherJoined).toHaveBeenCalledWith(data)
    })

    test('onJoinDenied', () => {
        const webSocket = mock<WebSocket>()
        webSocket.onmessage = jest.fn()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        server.onJoinDenied = jest.fn()
        const data: JoinDeniedNotificationData = {
            reason: JoinDeniedReasons.MaxPlayersOnATable
        }
        const messageData: MessageData<JoinDeniedNotificationData> = {
            kind: Messages.JoinDeniedNotification,
            data
        }
        webSocket.onmessage.call(webSocket, { type: 'message', data: JSON.stringify(messageData) } as MessageEvent)
        expect(server.onJoinDenied).toHaveBeenCalledWith(data)
    })

    test('onOtherBet', () => {
        const webSocket = mock<WebSocket>()
        webSocket.onmessage = jest.fn()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        server.onOtherBet = jest.fn()
        const data: OtherBetNotificationData = {
            playerId: 'player-id-1',
            bet: BetHelper.betWith('5')
        }
        const messageData: MessageData<OtherBetNotificationData> = {
            kind: Messages.OtherBetNotification,
            data
        }
        webSocket.onmessage.call(webSocket, { type: 'message', data: JSON.stringify(messageData) } as MessageEvent)
        expect(server.onOtherBet).toHaveBeenCalledWith(data)
    })

    test('onOtherLeft', () => {
        const webSocket = mock<WebSocket>()
        webSocket.onmessage = jest.fn()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        server.onOtherLeft = jest.fn()
        const data: OtherLeftNotificationData = {
            playerId: 'player-id-1'
        }
        const messageData: MessageData<OtherLeftNotificationData> = {
            kind: Messages.OtherLeftNotification,
            data
        }
        webSocket.onmessage.call(webSocket, { type: 'message', data: JSON.stringify(messageData) } as MessageEvent)
        expect(server.onOtherLeft).toHaveBeenCalledWith(data)
    })

    test('onRevealBets', () => {
        const webSocket = mock<WebSocket>()
        webSocket.onmessage = jest.fn()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        server.onRevealBets = jest.fn()
        const data: RevealBetsNotificationData = {
            revealedBy: createTestPlayerInfo(2),
            players: [createTestPlayerInfo(1), createTestPlayerInfo(2)]
        }
        const messageData: MessageData<RevealBetsNotificationData> = {
            kind: Messages.RevealBetsNotification,
            data
        }
        webSocket.onmessage.call(webSocket, { type: 'message', data: JSON.stringify(messageData) } as MessageEvent)
        expect(server.onRevealBets).toHaveBeenCalledWith(data)
    })

    test('onResetTable', () => {
        const webSocket = mock<WebSocket>()
        webSocket.onmessage = jest.fn()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        server.onResetTable = jest.fn()
        const data: ResetTableNotificationData = {
            resetBy: createTestPlayerInfo(2),
            players: [createTestPlayerInfo(1), createTestPlayerInfo(2)]
        }
        const messageData: MessageData<ResetTableNotificationData> = {
            kind: Messages.ResetTableNotification,
            data
        }
        webSocket.onmessage.call(webSocket, { type: 'message', data: JSON.stringify(messageData) } as MessageEvent)
        expect(server.onResetTable).toHaveBeenCalledWith(data)
    })

    test('onChangeTableOptions', () => {
        const webSocket = mock<WebSocket>()
        webSocket.onmessage = jest.fn()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        server.onChangeTableOptions = jest.fn()
        const data: ChangeTableOptionsNotificationData = {
            tableOptions: {
                changedByPlayerId: 'player-id-1',
                name: 'changed-table-name',
                deckKind: DeckKind.TShirts
            }
        }
        const messageData: MessageData<ChangeTableOptionsNotificationData> = {
            kind: Messages.ChangeTableOptionsNotification,
            data
        }
        webSocket.onmessage.call(webSocket, { type: 'message', data: JSON.stringify(messageData) } as MessageEvent)
        expect(server.onChangeTableOptions).toHaveBeenCalledWith(data)
    })

    test('onChangePlayerOptions', () => {
        const webSocket = mock<WebSocket>()
        webSocket.onmessage = jest.fn()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        server.onChangePlayerOptions = jest.fn()
        const data: ChangePlayerOptionsNotificationData = {
            playerOptions: {
                id: 'player-id-1',
                name: 'changed-player-name',
                observerMode: true
            }
        }
        const messageData: MessageData<ChangePlayerOptionsNotificationData> = {
            kind: Messages.ChangePlayerOptionsNotification,
            data
        }
        webSocket.onmessage.call(webSocket, { type: 'message', data: JSON.stringify(messageData) } as MessageEvent)
        expect(server.onChangePlayerOptions).toHaveBeenCalledWith(data)
    })

    test('sendJoinTable', () => {
        const webSocket = mock<WebSocket>()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        const data: JoinData = {
            playerInfo: createTestPlayerInfo(),
            tableInfo: createTestTableInfo()
        }
        server.sendJoinTable(data)
        const message = JSON.stringify({
            kind: Messages.Join,
            data
        })
        expect(webSocket.send).toHaveBeenCalledWith(message)
    })

    test('sendBet', () => {
        const webSocket = mock<WebSocket>()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        const data: BetData = {
            bet: BetHelper.betWith('5')
        }
        server.sendBet(data)
        const message = JSON.stringify({
            kind: Messages.Bet,
            data
        })
        expect(webSocket.send).toHaveBeenCalledWith(message)
    })

    test('sendRevealBets', () => {
        const webSocket = mock<WebSocket>()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        server.sendRevealBets()
        const data: RevealBetsData = { }
        const message = JSON.stringify({
            kind: Messages.RevealBets,
            data
        })
        expect(webSocket.send).toHaveBeenCalledWith(message)
    })

    test('sendResetTable', () => {
        const webSocket = mock<WebSocket>()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        server.sendResetTable()
        const data: ResetTableData = { }
        const message = JSON.stringify({
            kind: Messages.ResetTable,
            data
        })
        expect(webSocket.send).toHaveBeenCalledWith(message)
    })

    test('sendChangeTableOptions', () => {
        const webSocket = mock<WebSocket>()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        const data: ChangeTableOptionsData = {
            tableOptions: {
                changedByPlayerId: 'player-id-1',
                name: 'changed-table-name',
                deckKind: DeckKind.TShirts
            }
        }
        server.sendChangeTableOptions(data)
        const message = JSON.stringify({
            kind: Messages.ChangeTableOptions,
            data
        })
        expect(webSocket.send).toHaveBeenCalledWith(message)
    })

    test('sendChangePlayerOptions', () => {
        const webSocket = mock<WebSocket>()
        const webSocketHeartBeat = mock<WebSocketHeartBeat>()
        const server = new Server(webSocket, webSocketHeartBeat)
        const data: ChangePlayerOptionsData = {
            playerOptions: {
                id: 'player-id-1',
                name: 'changed-player-name',
                observerMode: true
            }
        }
        server.sendChangePlayerOptions(data)
        const message = JSON.stringify({
            kind: Messages.ChangePlayerOptions,
            data
        })
        expect(webSocket.send).toHaveBeenCalledWith(message)
    })
})
