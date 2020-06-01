import * as uWS from 'uWebSockets.js'
import { JoinCommand } from './JoinCommand'
import { MessageData, Messages } from '../model/Messages'
import { Server } from '../Server'
import { JoinData } from '../model/JoinData'
import { LeaveData } from '../model/LeaveData'
import { LeaveCommand } from './LeaveCommand'
import { BetCommand } from './BetCommand'
import { BetData } from '../model/BetData'
import { RevealBetsCommand } from './RevealBetsCommand'
import { RevealBetsData } from '../model/RevealBetsData'
import { ResetTableData } from '../model/ResetTableData'
import { ResetTableCommand } from './ResetTableCommand'

export class ServerCommandFactory {
    constructor(private readonly server: Server) { }

    of<T>(contextWebSocket: uWS.WebSocket, messageData: MessageData<T>) {
        switch (messageData.kind) {
            case Messages.Join: return new JoinCommand(this.server, contextWebSocket, messageData.data as unknown as JoinData)
            case Messages.Bet: return new BetCommand(this.server, contextWebSocket, messageData.data as unknown as BetData)
            case Messages.Leave: return new LeaveCommand(this.server, contextWebSocket, messageData.data as unknown as LeaveData)
            case Messages.RevealBets: return new RevealBetsCommand(this.server, contextWebSocket, messageData.data as unknown as RevealBetsData)
            case Messages.ResetTable: return new ResetTableCommand(this.server, contextWebSocket, messageData.data as unknown as ResetTableData)
            default: throw new Error(`unknown command ${messageData}`)
        }
    }
}
