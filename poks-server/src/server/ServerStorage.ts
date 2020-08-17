import { Table } from './Table'
import { id } from '../model/id'

export interface ServerStorage {
    saveTable(table: Table): void
    getTable(tableId: id): Table | undefined
    freeTable(table: Table): void
    readonly tablesCount: number
}
