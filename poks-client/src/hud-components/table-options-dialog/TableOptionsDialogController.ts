import { DeckKind } from '@server/model/Decks'
import { TableOptions } from '@server/model/TableOptions'
import { SessionTable } from '@/data/SessionTable'
import { OptionsDialog } from '@/hud-components/OptionsDialog'

export class TableOptionsDialogController extends OptionsDialog<TableOptions> {
    private readonly tableOptionsDialog: HTMLElement | null
    private readonly tableOptionsCloseButton: HTMLElement | null
    private readonly tableOptionsApplyButton: HTMLElement | null
    private readonly tableOptionsTableName: HTMLInputElement | null
    private readonly tableOptionsDeckKind: HTMLSelectElement | null

    constructor(private readonly sessionTable: SessionTable) {
        super()
        this.tableOptionsDialog = document.getElementById('tableOptionsDialog')
        this.tableOptionsCloseButton = document.getElementById('tableOptionsCloseButton')
        this.tableOptionsApplyButton = document.getElementById('tableOptionsApplyButton')
        this.tableOptionsTableName = document.getElementById('tableOptionsTableName') as HTMLInputElement
        this.tableOptionsDeckKind = document.getElementById('tableOptionsDeckKind') as HTMLSelectElement

        this.addBaseListeners()
    }

    update(options: TableOptions) {
        if (null !== this.tableOptionsTableName) {
            this.tableOptionsTableName.value = options.name
        }
        if (null !== this.tableOptionsDeckKind) {
            this.tableOptionsDeckKind.value = options.deckKind.toString()
        }
    }

    protected getData() {
        return {
            changedByPlayerId: this.sessionTable.playerInfo.id,
            name: this.tableOptionsTableName?.value || '',
            deckKind: this.getDeckKind()
        }
    }

    protected get dialogElement(): HTMLElement | null {
        return this.tableOptionsDialog
    }

    protected get closeButton(): HTMLElement | null {
        return this.tableOptionsCloseButton
    }

    protected get applyButton(): HTMLElement | null {
        return this.tableOptionsApplyButton
    }

    private getDeckKind() {
        const value = parseInt(this.tableOptionsDeckKind?.value || '0', 10)
        return value as DeckKind
    }
}
