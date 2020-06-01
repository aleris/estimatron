import * as uWS from 'uWebSockets.js'
import { Messages } from '../model/Messages'
import { id } from '../model/id'
import { Table } from '../Table'
import { Player } from '../Player'

export abstract class Notification<T> {
    static getTopicName(table: Table, kind: Messages): string {
        return `${table.tableInfo.id}-${kind}`
    }

    abstract get kind(): Messages

    abstract send(): void

    protected getTopicName(table: Table): string {
        return Notification.getTopicName(table, this.kind)
    }

    protected sendToAll(ws: uWS.WebSocket, table: Table, data: T) {
        ws.publish(this.getTopicName(table), this.getStringifiedMessage(data))
    }

    protected sendToOthers(table: Table, player: Player, data: T) {
        const otherPlayers = this.getOtherPlayers(table, player.playerInfo.id)
        const message = this.getStringifiedMessage(data)
        otherPlayers.forEach(player => {
            console.log(`notifying ${Messages[this.kind]} from player ${player.playerInfo.id} (${player.playerInfo.name}) to player ${player.playerInfo.id} (${player.playerInfo.name}) on table ${table.tableInfo.id} (${table.tableInfo.name})`, data)
            this.sendToWebSocket(player.ws, message)
        })
    }

    protected sendToPlayer(player: Player, data: T) {
        this.sendToWebSocket(player.ws, this.getStringifiedMessage(data))
    }

    private getStringifiedMessage(data: T): string {
        const message = {
            kind: this.kind,
            data
        }
        return JSON.stringify(message)
    }

    private sendToWebSocket(ws: uWS.WebSocket, message: string): void {
        try {
            ws.send(message)
        } catch (e) {
            console.error('error when sending message to socket', e)
        }
    }

    private getOtherPlayers(table: Table, playerId: id) {
        return table.players.filter(player => player.playerInfo.id !== playerId)
    }
}
