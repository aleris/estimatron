import { id } from '../model/id'
import { Messages } from '../model/Messages'
import { Table, TableHelper } from '../server/Table'
import { Player, PlayerHelper } from '../server/Player'
import { logger } from '../logger'
import { WebSocket } from 'uWebSockets.js'

const log = logger.child({ component: 'Notification' })

export abstract class Notification<T> {

    static getTopicName(table: Table, kind: Messages): string {
        return `${table.tableInfo.id}-${kind}`
    }

    static subscribeAll(ws: WebSocket, table: Table) {
        ws.subscribe(Notification.getTopicName(table, Messages.RevealBetsNotification))
        ws.subscribe(Notification.getTopicName(table, Messages.ResetTableNotification))
        ws.subscribe(Notification.getTopicName(table, Messages.ChangeTableOptionsNotification))
        ws.subscribe(Notification.getTopicName(table, Messages.ChangePlayerOptionsNotification))
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
        if (otherPlayers.length === 0) {
            log.debug(`No other players on table ${TableHelper.nameAndId(table)}`, { data })
            return
        }
        const message = this.getStringifiedMessage(data)
        for (let toPlayer of otherPlayers) {
            log.debug(`Notifying ${Messages[this.kind]} to player ${PlayerHelper.nameAndId(toPlayer)} from player ${PlayerHelper.nameAndId(player)} on table ${TableHelper.nameAndId(table)}`, { data })
            this.sendToWebSocket(toPlayer.ws, message)
        }
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

    private sendToWebSocket(ws: WebSocket, message: string): void {
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
