import { Table } from './Table'
import { id } from '../model/id'

export interface ServerStorage {
    mount(): void
    unmount(): void
    saveTable(table: Table): void
    getTable(tableId: id): Table | undefined
    readonly tablesCount: number
}
