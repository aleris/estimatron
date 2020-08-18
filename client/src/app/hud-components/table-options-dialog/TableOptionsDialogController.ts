import { DeckKind } from '@server/model/Decks'
import { TableOptions } from '@server/model/TableOptions'
import { SessionTable } from '@/app/data/SessionTable'
import { OptionsDialog } from '@/app/hud-components/OptionsDialog'

export class TableOptionsDialogController extends OptionsDialog<TableOptions> {
    protected readonly dialogElement: HTMLElement | null
    protected readonly closeButton: HTMLElement | null
    protected readonly applyButton: HTMLElement | null
    private readonly tableName: HTMLInputElement | null
    private readonly deckKind: HTMLSelectElement | null

    constructor(private readonly sessionTable: SessionTable) {
        super()
        this.dialogElement = document.getElementById('tableOptionsDialog')
        this.closeButton = document.getElementById('tableOptionsDialog--closeButton')
        this.applyButton = document.getElementById('tableOptionsDialog--applyButton')
        this.tableName = document.getElementById('tableOptionsDialog--tableName') as HTMLInputElement
        this.deckKind = document.getElementById('tableOptionsDialog--deckKind') as HTMLSelectElement

        this.addBaseListeners()
    }

    update(options: TableOptions) {
        if (null !== this.tableName) {
            this.tableName.value = options.name
        }
        if (null !== this.deckKind) {
            this.deckKind.value = options.deckKind.toString()
        }
    }

    protected getData() {
        return {
            changedByPlayerId: this.sessionTable.playerInfo.id,
            name: this.tableName?.value || '',
            deckKind: this.getDeckKind()
        }
    }

    private getDeckKind() {
        const value = parseInt(this.deckKind?.value || '0', 10)
        return value as DeckKind
    }
}
