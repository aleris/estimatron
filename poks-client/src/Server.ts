import { MessageInfo, Messages } from '@server/model/Messages'
import { JoinData } from '@server/model/JoinData'
import { LeaveData } from '@server/model/LeaveData'
import { JoinConfirmedNotificationData } from '@server/model/JoinConfirmedNotificationData'
import { OtherJoinedNotificationData } from '@server/model/OtherJoinedNotificationData'
import { BetData } from '@server/model/BetData'
import { OtherBetNotificationData } from '@server/model/OtherBetNotificationData'
import { OtherLeftNotificationData } from '@server/model/OtherLeftNotificationData'
import { RevealBetsNotificationData } from '@server/model/RevealBetsNotificationData'
import { ResetTableNotificationData } from '@server/model/ResetTableNotificationData'

export class Server {
    private readonly ws: WebSocket

    public onConnectionOpened: () => void = () => {}
    public onConnectionClosed: () => void = () => {}
    public onJoinConfirmed: (notificationData: JoinConfirmedNotificationData) => void = () => {}
    public onOtherJoined: (notificationData: OtherJoinedNotificationData) => void = () => {}
    public onOtherBet: (notificationData: OtherBetNotificationData) => void = () => {}
    public onOtherLeft: (notificationData: OtherLeftNotificationData) => void = () => {}
    public onRevealBets: (notificationData: RevealBetsNotificationData) => void = () => {}
    public onResetTable: (notificationData: ResetTableNotificationData) => void = () => {}

    constructor() {
        this.ws = new WebSocket(
            `ws://localhost:29087`
        )
        this.ws.onopen = this.wsOnOpen.bind(this)
        this.ws.onmessage = this.wsOnMessage.bind(this)
        this.ws.onclose = this.wsOnClose.bind(this)
        this.ws.onerror = this.wsOnError.bind(this)
    }

    private wsOnOpen() {
        console.log('ws connection opened')
        this.setupHeartbeat()
        this.onConnectionOpened()
    }

    private wsOnMessage(event: any) {
        const messageData = JSON.parse(event.data)
        const commandInfo = messageData as MessageInfo
        if (commandInfo.kind) {
            console.log('command received from server', messageData)
            switch (commandInfo.kind) {
                case Messages.JoinConfirmedNotification: return this.onJoinConfirmed(messageData.data)
                case Messages.OtherJoinedNotification: return this.onOtherJoined(messageData.data)
                case Messages.OtherBetNotification: return this.onOtherBet(messageData.data)
                case Messages.OtherLeftNotification: return this.onOtherLeft(messageData.data)
                case Messages.RevealBetsNotification: return this.onRevealBets(messageData.data)
                case Messages.ResetTableNotification: return this.onResetTable(messageData.data)
                default:
                    throw new Error(`cannot handle command ${commandInfo.kind}`)
            }
        } else {
            throw new Error(`cannot handle ws message ${event}`)
        }
    }

    private wsOnClose() {
        console.log('ws connection closed')
        this.onConnectionClosed()
    }

    private wsOnError(event: any) {
        console.log('ws error', event)
    }

    private setupHeartbeat() {
        setInterval(() => {
            this.ws.send('~')
        }, 15000)
    }

    joinTable(joinData: JoinData) {
        this.send(Messages.Join, joinData)
    }

    bet(betData: BetData) {
        this.send(Messages.Bet, betData)
    }

    leaveTable(leaveData: LeaveData) {
        this.send(Messages.Leave, leaveData)
    }

    revealBets() {
        this.send(Messages.RevealBets, {})
    }

    resetTable() {
        this.send(Messages.ResetTable, {})
    }

    send<T>(kind: Messages, data: T) {
        this.ws.send(JSON.stringify({
            kind,
            data
        }))
    }
}
