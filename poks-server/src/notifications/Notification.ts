import * as uWS from 'uWebSockets.js'
import { Messages } from '../model/Messages'
import { id } from '../model/id'
import { Table, TableHelper } from '../Table'
import { Player, PlayerHelper } from '../Player'
import { logger } from '../logger'

const log = logger.child({ component: 'Notification' })

export abstract class Notification<T> {

    static getTopicName(table: Table, kind: Messages): string {
        return `${table.tableInfo.id}-${kind}`
    }

    abstract get kind(): Messages

    abstract send(): void

    protected getTopicName(table: Table): string {
        return Notification.getTopicName(table, this.kind)
    }

    protected sendToAll(table: Table, player: Player, data: T) {
        log.debug(`Send to all on table ${TableHelper.nameAndId(table)}`, { data })
        player.ws.publish(this.getTopicName(table), this.getStringifiedMessage(data))
    }

    protected sendToOthers(table: Table, player: Player, data: T) {
        const otherPlayers = this.getOtherPlayers(table, player.playerInfo.id)
        const message = this.getStringifiedMessage(data)
        otherPlayers.forEach(toPlayer => {
            log.debug(`Notifying ${Messages[this.kind]} from player ${
                PlayerHelper.nameAndId(player)
            } to player ${PlayerHelper.nameAndId(player)} on table ${TableHelper.nameAndId(table)}`, { data })
            this.sendToWebSocket(toPlayer.ws, message)
        })
    }

    protected sendToPlayer(table: Table, player: Player, data: T) {
        log.debug(`Send to player ${PlayerHelper.nameAndId(player)} on table ${TableHelper.nameAndId(table)}`, { data })
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
            log.error('Error when sending message to socket', e)
        }
    }

    private getOtherPlayers(table: Table, playerId: id) {
        return table.players.filter(player => player.playerInfo.id !== playerId)
    }
}
