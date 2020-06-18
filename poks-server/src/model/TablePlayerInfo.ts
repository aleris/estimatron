import { id } from './id'
import { TableInfo } from './TableInfo'
import { PlayerInfo } from './PlayerInfo'

export interface TablePlayerInfo {
    tableInfo: TableInfo
    playerInfo: PlayerInfo
}

export interface TablePlayerIds {
    tableId: id
    playerId: id
}
