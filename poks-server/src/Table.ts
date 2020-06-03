import { TableInfo, TableInfoHelper } from './model/TableInfo'
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

export class TableHelper {
    static nameAndId(table: Table) {
        return TableInfoHelper.nameAndId(table.tableInfo)
    }
}
