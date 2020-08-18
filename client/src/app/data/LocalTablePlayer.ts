import { LocalStorageRepository } from '@/app/data/StorageRepository'
import { IdGenerator } from '@/app/data/IdGenerator'
import { NameGenerator } from '@/app/data/NameGenerator'
import { TableInfo } from '@server/model/TableInfo'
import { BetHelper } from '@server/model/Bet'
import { DeckRepository } from '@server/model/Decks'
import { PlayerInfo } from '@server/model/PlayerInfo'
import { id } from '@server/model/id'
import { TablePlayerInfo } from '@server/model/TablePlayerInfo'

export class LocalTablePlayer {
    getLocalTablePlayerOrNew(): TablePlayerInfo {
        let tableId: id | null = null
        let playerId: id | null = null
        let playerName: string | null = null
        let playerObserverMode: boolean | null = null
        let tableInfo: TableInfo | undefined
        let playerInfo: PlayerInfo | undefined
        const hash = window.location.hash.substring(1)
        if (hash) {
            const hashInfo = this.getTablePlayerInfoFromLocationHash(hash)
            tableId = hashInfo.tableId
            if (!LocalStorageRepository.isAvailable) {
                playerId = hashInfo.playerId
                playerName = hashInfo.playerName
                playerObserverMode = hashInfo.playerObserverMode
            }
        }
        if (tableId === null) {
            tableId = IdGenerator.randomUniqueId()
        }
        tableInfo = LocalStorageRepository.table.get(tableId)
        if (tableInfo === undefined) {
            tableInfo = {
                id: tableId,
                name: NameGenerator.randomReadableName(),
                deckKind: DeckRepository.defaultDeckKind,
                revealed: false
            }
        }

        playerInfo = LocalStorageRepository.player.get()
        if (playerInfo !== undefined) {
            playerId = playerInfo.id
            playerName = playerInfo.name
            playerObserverMode = playerInfo.observerMode
        }
        if (playerId === null) {
            playerId = IdGenerator.randomUniqueId()
        }
        if (playerName === null) {
            playerName = NameGenerator.randomReadableName()
        }
        if (playerObserverMode === null) {
            playerObserverMode = false
        }

        if (playerInfo === undefined) {
            playerInfo = {
                id: playerId,
                name: playerName,
                bet: BetHelper.noBet(),
                observerMode: playerObserverMode,
                gone: false
            }
        }

        return {
            tableInfo,
            playerInfo
        }
    }

    update(tableInfo: TableInfo, playerInfo: PlayerInfo) {
        if (LocalStorageRepository.isAvailable) {
            LocalStorageRepository.player.set(playerInfo)
            LocalStorageRepository.table.set(tableInfo, tableInfo.id)
            window.location.hash = tableInfo.id
        } else {
            window.location.hash = `${tableInfo.id}∧${playerInfo.id}∧${playerInfo.name}∧${playerInfo.observerMode}`
        }
    }

    getLocalPlayerOrNew() {
        let player = LocalStorageRepository.player.get()
        if (player === undefined) {
            player = {
                id: IdGenerator.randomUniqueId(),
                name: NameGenerator.randomReadableName(),
                bet: BetHelper.noBet(),
                observerMode: false,
                gone: false
            }
            LocalStorageRepository.player.set(player)
        }
        return player
    }

    private getTablePlayerInfoFromLocationHash(hash: string): PlayerTableHashInfo {
        const parts = hash.split('∧')
        let tableId: id | null = null
        let playerId: id | null = null
        let playerName: string | null = null
        let playerObserverMode: boolean | null = null
        if (parts[0]) {
            tableId = parts[0]
        }
        if (parts[1]) {
            playerId = parts[1]
        }
        if (parts[2]) {
            playerName = parts[2]
        }
        if (parts[3]) {
            playerObserverMode = Boolean(parts[3])
        }
        return {
            tableId,
            playerId,
            playerName,
            playerObserverMode
        }
    }
}

interface PlayerTableHashInfo {
    tableId: id | null,
    playerId: id | null,
    playerName: string | null
    playerObserverMode: boolean | null
}
