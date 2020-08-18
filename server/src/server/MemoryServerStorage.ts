import { logger } from '../logger'
import { Table } from './Table'
import { ServerStorage } from './ServerStorage'

const log = logger.child({ component: 'MemoryServerStorage' })

export class MemoryServerStorage implements ServerStorage {
    private readonly tables = new Map<string, Table>()

    constructor() { }

    saveTable(table: Table): void {
        this.tables.set(table.tableInfo.id, table)
        log.info('Saved table', { table })
    }

    getTable(tableId: string): Table | undefined {
        return this.tables.get(tableId)
    }

    freeTable(table: Table): void {
        this.tables.delete(table.tableInfo.id)
        log.info('Freed table', { table })
    }

    get tablesCount(): number {
        return this.tables.size
    }

    clear() {
        this.tables.clear()
    }
}
