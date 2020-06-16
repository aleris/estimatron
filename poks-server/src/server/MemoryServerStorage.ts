import { logger } from '../logger'
import { Table } from './Table'
import { ServerStorage } from './ServerStorage'

const log = logger.child({ component: 'MemoryServerStorage' })

export class MemoryServerStorage implements ServerStorage {
    private readonly tables = new Map<string, Table>()

    private deleteUnusedTablesSchedule: NodeJS.Timeout | undefined

    constructor(private readonly deleteUnusedTablesJob = false) { }

    mount(): void {
        if (this.deleteUnusedTablesJob) {
            const TEN_MINUTES = 10 * 60 * 1000
            this.deleteUnusedTablesSchedule = setInterval(this.deleteUnusedTables.bind(this), TEN_MINUTES)
        }
    }

    unmount(): void {
        if (this.deleteUnusedTablesSchedule !== undefined) {
            clearInterval(this.deleteUnusedTablesSchedule)
        }
    }

    saveTable(table: Table): void {
        this.tables.set(table.tableInfo.id, table)
    }

    getTable(tableId: string): Table | undefined {
        return this.tables.get(tableId)
    }

    get tablesCount(): number {
        return this.tables.size
    }

    private deleteUnusedTables() {
        log.debug('Deleting unused tables')
    }
}
