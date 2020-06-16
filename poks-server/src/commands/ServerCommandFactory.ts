import { WebSocket } from 'uWebSockets.js'
import { Server } from '../server/Server'
import { MessageData, Messages } from '../model/Messages'
import { BetData } from '../model/BetData'
import { JoinData } from '../model/JoinData'
import { LeaveData } from '../model/LeaveData'
import { ResetTableData } from '../model/ResetTableData'
import { RevealBetsData } from '../model/RevealBetsData'
import { BetCommand } from './BetCommand'
import { JoinCommand } from './JoinCommand'
import { LeaveCommand } from './LeaveCommand'
import { ResetTableCommand } from './ResetTableCommand'
import { RevealBetsCommand } from './RevealBetsCommand'
import { ChangeTableOptionsCommand } from './ChangeTableOptionsCommand'
import { ChangePlayerOptionsCommand } from './ChangePlayerOptionsCommand'
import { ChangeTableOptionsData } from '../model/ChangeTableOptionsData'
import { ChangePlayerOptionsData } from '../model/ChangePlayerOptionsData'

export class ServerCommandFactory {
    constructor() { }

    static of<T>(server: Server, contextWebSocket: WebSocket, messageData: MessageData<T>) {
        switch (messageData.kind) {
            case Messages.Join:
                return new JoinCommand(
                    server,
                    contextWebSocket,
                    messageData.data as unknown as JoinData
                )
            case Messages.Bet:
                return new BetCommand(
                    server,
                    contextWebSocket,
                    messageData.data as unknown as BetData
                )
            case Messages.Leave:
                return new LeaveCommand(
                    server,
                    contextWebSocket,
                    messageData.data as unknown as LeaveData
                )
            case Messages.RevealBets:
                return new RevealBetsCommand(
                    server,
                    contextWebSocket,
                    messageData.data as unknown as RevealBetsData
                )
            case Messages.ResetTable:
                return new ResetTableCommand(
                    server,
                    contextWebSocket,
                    messageData.data as unknown as ResetTableData
                )
            case Messages.ChangeTableOptions:
                return new ChangeTableOptionsCommand(
                    server,
                    contextWebSocket,
                    messageData.data as unknown as ChangeTableOptionsData
                )
            case Messages.ChangePlayerOptions:
                return new ChangePlayerOptionsCommand(
                    server,
                    contextWebSocket,
                    messageData.data as unknown as ChangePlayerOptionsData
                )
            default: throw new Error(`unknown command ${messageData}`)
        }
    }
}
