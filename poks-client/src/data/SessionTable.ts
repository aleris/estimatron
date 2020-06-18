import { TableInfo } from '@server/model/TableInfo'
import { PlayerInfo } from '@server/model/PlayerInfo'
import { TableOptions } from '@server/model/TableOptions'
import { PlayerOptions } from '@server/model/PlayerOptions'
import { Bet, BetHelper } from '@server/model/Bet'
import { LocalTablePlayer } from '@/data/LocalTablePlayer'

export class SessionTable {
    private readonly playerInfoId: string
    public readonly tableInfo: TableInfo
    public readonly players = new Array<PlayerInfo>()

    constructor(private readonly localTablePlayer: LocalTablePlayer) {
        const tablePlayerInfo = localTablePlayer.getLocalTablePlayerOrNew()
        this.playerInfoId = tablePlayerInfo.playerInfo.id
        this.players.push(tablePlayerInfo.playerInfo)
        this.tableInfo = tablePlayerInfo.tableInfo
        localTablePlayer.updateLocationHash(tablePlayerInfo.tableInfo, tablePlayerInfo.playerInfo)
    }

    get playerInfo() {
        let playerInfo = this.findPlayerById(this.playerInfoId)
        if (playerInfo === undefined) {
            playerInfo = this.localTablePlayer.getLocalPlayerOrNew()
            this.players.push(playerInfo)
        }
        return playerInfo
    }

    get areBetsPresent() {
        return this.players.some(p => BetHelper.hasEstimation(p.bet))
    }

    findPlayerById(playerId: string): PlayerInfo | undefined {
        return this.players.find(p => p.id === playerId)
    }

    addOrUpdatePlayer(player: PlayerInfo): boolean {
        const existingPlayer = this.findPlayerById(player.id)
        if (existingPlayer === undefined) {
            this.players.push(player)
            return true
        }

        // only first level properties need to be set, ok to use assign
        Object.assign(existingPlayer, player)
        return false
    }

    update(tableInfo: TableInfo, players: PlayerInfo[]) {
        Object.assign(this.tableInfo, tableInfo)
        console.log('SessionTable update', this.tableInfo)
        this.players.length = 0
        const me = players.find(player => player.id === this.playerInfoId)
        if (undefined === me) {
            console.error(`cannot find current player ${this.playerInfoId} in join confirmed list`)
            return
        }
        this.players.push(me) // put current player first in list
        const otherPlayers = players.filter(player => player.id !== me.id)
        Array.prototype.push.apply(this.players, otherPlayers)
    }

    updateBets(players: PlayerInfo[]) {
        const notificationsPlayerMap = new Map<string, PlayerInfo>(
            players.map(player => [player.id, player])
        )
        this.players.forEach(player => {
            const notificationPlayer = notificationsPlayerMap.get(player.id)
            if (notificationPlayer !== undefined) {
                player.bet = notificationPlayer.bet
            } else {
                console.warn(`bet for player in local list ${player.id} (${player.name}) not received`)
            }
        })
    }

    updateMyBet(bet: Bet) {
        const me = this.players.find(player => player.id === this.playerInfoId)
        if (undefined === me) {
            console.error(`cannot find current player ${this.playerInfoId} in local list`)
            return
        }
        me.bet = bet
    }

    updateTableOptions(tableOptions: TableOptions) {
        this.tableInfo.name = tableOptions.name
        this.tableInfo.deckKind = tableOptions.deckKind
    }

    updatePlayerOptions(playerOptions: PlayerOptions) {
        const player = this.findPlayerById(playerOptions.id)
        if (player !== undefined) {
            player.name = playerOptions.name
            player.observerMode = playerOptions.observerMode
        } else {
            console.error(`cannot find player with id ${playerOptions.id} in local list`)
        }
    }
}
