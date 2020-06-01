import { TableInfo } from './model/TableInfo'
import { Player } from './Player'

export interface Table {
    tableInfo: TableInfo
    players: Player[],
    createdTimestamp: number,
    activityTimestamp: number,
    revealed: boolean,
    lastRevealedByPlayer: Player | null,
    lastResetByPlayer: Player | null
}
