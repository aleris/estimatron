import { SessionTable } from '@/data/SessionTable'

export class TableOptionsPanelController {
    private readonly tableOptionsButton: HTMLElement | null
    private readonly tableOptionsPanelTableName: HTMLElement | null

    public onTableOptionsButtonClick: () => void = () => {}

    constructor(private readonly sessionTable: SessionTable) {
        this.tableOptionsButton = document.getElementById('tableOptionsButton')
        this.tableOptionsButton?.addEventListener('click', () => this.onTableOptionsButtonClick())
        this.tableOptionsPanelTableName = document.getElementById('tableOptionsPanelTableName')
    }

    refresh() {
        if (this.tableOptionsPanelTableName) {
            this.tableOptionsPanelTableName.textContent = this.sessionTable.tableInfo.name
        }
    }

    refocusAction() {
        setTimeout(() => this.tableOptionsButton?.focus(), 0)
    }
}
