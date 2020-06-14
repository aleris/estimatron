import { MessageInfo, Messages } from '@server/model/Messages'
import { JoinData } from '@server/model/JoinData'
import { BetData } from '@server/model/BetData'
import { JoinConfirmedNotificationData } from '@server/model/JoinConfirmedNotificationData'
import { OtherJoinedNotificationData } from '@server/model/OtherJoinedNotificationData'
import { JoinDeniedNotificationData } from '@server/model/JoinDeniedNotificationData'
import { ChangeTableOptionsData } from '@server/model/ChangeTableOptionsData'
import { ChangePlayerOptionsData } from '@server/model/ChangePlayerOptionsData'
import { OtherBetNotificationData } from '@server/model/OtherBetNotificationData'
import { OtherLeftNotificationData } from '@server/model/OtherLeftNotificationData'
import { RevealBetsNotificationData } from '@server/model/RevealBetsNotificationData'
import { ResetTableNotificationData } from '@server/model/ResetTableNotificationData'
import { ChangeTableOptionsNotificationData } from '@server/model/ChangeTableOptionsNotificationData'
import { ChangePlayerOptionsNotificationData } from '@server/model/ChangePlayerOptionsNotificationData'

export class Server {
    private readonly ws: WebSocket

    public onConnectionOpened: () => void = () => {}
    public onConnectionClosed: () => void = () => {}
    public onJoinConfirmed: (notificationData: JoinConfirmedNotificationData) => void = () => {}
    public onOtherJoined: (notificationData: OtherJoinedNotificationData) => void = () => {}
    public onJoinDenied: (notificationData: JoinDeniedNotificationData) => void = () => {}
    public onOtherBet: (notificationData: OtherBetNotificationData) => void = () => {}
    public onOtherLeft: (notificationData: OtherLeftNotificationData) => void = () => {}
    public onRevealBets: (notificationData: RevealBetsNotificationData) => void = () => {}
    public onResetTable: (notificationData: ResetTableNotificationData) => void = () => {}
    public onTableOptionsChanged: (notificationData: ChangeTableOptionsNotificationData) => void = () => {}
    public onPlayerOptionsChanged: (notificationData: ChangePlayerOptionsNotificationData) => void = () => {}

    constructor() {
        this.ws = new WebSocket(
            `ws://localhost:29087`
        )
        this.ws.onopen = this.wsOnOpen.bind(this)
        this.ws.onmessage = this.wsOnMessage.bind(this)
        this.ws.onclose = this.wsOnClose.bind(this)
        this.ws.onerror = this.wsOnError.bind(this)
    }

    sendJoinTable(joinData: JoinData) {
        this.send(Messages.Join, joinData)
    }

    sendBet(betData: BetData) {
        this.send(Messages.Bet, betData)
    }

    sendRevealBets() {
        this.send(Messages.RevealBets, {})
    }

    sendResetTable() {
        this.send(Messages.ResetTable, {})
    }

    sendChangeTableOptions(optionsData: ChangeTableOptionsData) {
        this.send(Messages.ChangeTableOptions, optionsData)
    }

    sendChangePlayerOptions(optionsData: ChangePlayerOptionsData) {
        this.send(Messages.ChangePlayerOptions, optionsData)
    }

    private send<T>(kind: Messages, data: T) {
        this.ws.send(JSON.stringify({
            kind,
            data
        }))
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
                case Messages.JoinDeniedNotification: return this.onJoinDenied(messageData.data)
                case Messages.OtherBetNotification: return this.onOtherBet(messageData.data)
                case Messages.OtherLeftNotification: return this.onOtherLeft(messageData.data)
                case Messages.RevealBetsNotification: return this.onRevealBets(messageData.data)
                case Messages.ResetTableNotification: return this.onResetTable(messageData.data)
                case Messages.ChangeTableOptionsNotification: return this.onTableOptionsChanged(messageData.data)
                case Messages.ChangePlayerOptionsNotification: return this.onPlayerOptionsChanged(messageData.data)
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
}
