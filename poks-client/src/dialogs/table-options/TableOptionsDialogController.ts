import { DeckKind } from '@server/model/Decks'
import { TableOptions } from '@server/model/TableOptions'
import { SessionTable } from '@/data/SessionTable'
import { OptionsDialog } from '@/dialogs/OptionsDialog'

export class TableOptionsDialogController extends OptionsDialog<TableOptions> {
    private readonly tableOptionsDialog: HTMLElement | null
    private readonly tableOptionsCloseButton: HTMLElement | null
    private readonly tableOptionsApplyButton: HTMLElement | null
    private readonly tableOptionsTableName: HTMLInputElement | null
    private readonly tableOptionsDeckKind: HTMLSelectElement | null

    public onTableOptionsChanged: (tableOptions: TableOptions) => void = () => {}

    constructor(private readonly sessionTable: SessionTable) {
        super()
        this.tableOptionsDialog = document.getElementById('tableOptionsDialog')
        this.tableOptionsCloseButton = document.getElementById('tableOptionsCloseButton')
        this.tableOptionsApplyButton = document.getElementById('tableOptionsApplyButton')
        this.tableOptionsTableName = document.getElementById('tableOptionsTableName') as HTMLInputElement
        this.tableOptionsDeckKind = document.getElementById('tableOptionsDeckKind') as HTMLSelectElement

        this.tableOptionsCloseButton?.addEventListener('click', () => {
            this.toggleDialog()
        })

        this.tableOptionsApplyButton?.addEventListener('click', () => {
            this.onTableOptionsChanged({
                changedByPlayerId: this.sessionTable.playerInfo.id,
                name: this.tableOptionsTableName?.value || '',
                deckKind: this.getDeckKind()
            })
            this.toggleDialog()
        })
    }

    protected get dialogElement(): HTMLElement | null {
        return this.tableOptionsDialog
    }

    update(options: TableOptions) {
        if (null !== this.tableOptionsTableName) {
            this.tableOptionsTableName.value = options.name
        }
        if (null !== this.tableOptionsDeckKind) {
            this.tableOptionsDeckKind.value = options.deckKind.toString()
        }
    }

    private getDeckKind() {
        const value = parseInt(this.tableOptionsDeckKind?.value || '0', 10)
        return value as DeckKind
    }
}
