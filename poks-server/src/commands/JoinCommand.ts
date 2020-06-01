import * as uWS from 'uWebSockets.js'
import { JoinConfirmedNotification } from '../notifications/JoinConfirmedNotification'
import { Server } from '../Server'
import { JoinData } from '../model/JoinData'
import { Command } from './Command'
import { OtherJoinedNotification } from '../notifications/OtherJoinedNotification'
import { WebSocketTablePlayerInfo } from './WebSocketTablePlayerInfo'
import { Notification } from '../notifications/Notification'
import { Messages } from '../model/Messages'

export class JoinCommand implements Command<JoinData> {
    constructor(
        private readonly server: Server,
        private readonly senderWebSocket: uWS.WebSocket,
        private readonly joinData: JoinData
    ) { }

    execute() {
        console.log(`execute JoinCommand`, this.joinData)
        const nowTimestamp = this.server.getTimestamp()
        let player
        let table = this.server.tables.get(this.joinData.tableInfo.id)
        if (table) { // table exists
            console.log(`table ${table.tableInfo.id} (${table.tableInfo.name}) exists`)
            player = table.players.find(player => player.playerInfo.id === this.joinData.playerInfo.id)
            if (player === undefined) { // player not at the table, add it to table
                player = {
                    ws: this.senderWebSocket,
                    playerInfo: this.joinData.playerInfo
                }
                table.players.push(player)
                console.log(`added player ${player.playerInfo.id} (${player.playerInfo.name}) to table ${table.tableInfo.id} (${table.tableInfo.name})`)
            } else { // player already at the table, this could happen on refresh or connections was cut, update info
                console.warn(`player ${player.playerInfo.id} (${player.playerInfo.name}) already at table ${table.tableInfo.id} (${table.tableInfo.name})`)
                player.ws = this.senderWebSocket
                // assume updated info didn't get t client, so keep the server ones
                // player.playerInfo.name = this.joinData.playerInfo.name
                // player.playerInfo.bet = this.joinData.playerInfo.bet
                player.playerInfo.gone = false
            }
            table.activityTimestamp = nowTimestamp
            // broadcast player joined
        } else { // table does not exists, create it
            player = {
                ws: this.senderWebSocket,
                playerInfo: this.joinData.playerInfo
            }
            table = {
                tableInfo: this.joinData.tableInfo,
                players: [player],
                createdTimestamp: nowTimestamp,
                activityTimestamp: nowTimestamp,
                revealed: false,
                lastRevealedByPlayer: null,
                lastResetByPlayer: null
            }
            console.log(`adding table ${table.tableInfo.id} (${table.tableInfo.name}) with player ${player.playerInfo.id} (${player.playerInfo.name})`)
            this.server.tables.set(this.joinData.tableInfo.id, table)
        }
        WebSocketTablePlayerInfo.saveTablePlayerIds(this.senderWebSocket, table.tableInfo, player.playerInfo)

        this.senderWebSocket.subscribe(Notification.getTopicName(table, Messages.RevealBetsNotification))
        this.senderWebSocket.subscribe(Notification.getTopicName(table, Messages.ResetTableNotification))

        new JoinConfirmedNotification(table, player).send()
        new OtherJoinedNotification(table, player).send()

        console.log('after join, table=', table, ', tables=', this.server.tables)
    }
}
