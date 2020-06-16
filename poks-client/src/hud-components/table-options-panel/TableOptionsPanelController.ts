import { SessionTable } from '@/data/SessionTable'

export class TableOptionsPanelController {
    private readonly optionsButton: HTMLElement | null
    private readonly tableName: HTMLElement | null

    public onTableOptionsButtonClick: () => void = () => {}

    constructor(private readonly sessionTable: SessionTable) {
        this.optionsButton = document.getElementById('tableOptionsPanel--optionsButton')
        this.optionsButton?.addEventListener('click', () => this.onTableOptionsButtonClick())
        this.tableName = document.getElementById('tableOptionsPanel--tableName')
    }

    refresh() {
        if (this.tableName) {
            this.tableName.textContent = this.sessionTable.tableInfo.name
        }
    }

    refocusAction() {
        setTimeout(() => this.optionsButton?.focus(), 0)
    }
}
