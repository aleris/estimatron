import { PlayerOptions } from '@server/model/PlayerOptions'
import { OptionsDialog } from '@/dialogs/OptionsDialog'
import { SessionTable } from '@/data/SessionTable'

export class PlayerOptionsDialogController extends OptionsDialog<PlayerOptions> {
    private readonly playerOptionsDialog: HTMLElement | null
    private readonly playerOptionsCloseButton: HTMLElement | null
    private readonly playerOptionsApplyButton: HTMLElement | null
    private readonly playerOptionsPlayerName: HTMLInputElement | null
    private readonly playerOptionsObserverMode: HTMLInputElement | null

    constructor(private readonly sessionTable: SessionTable) {
        super()
        this.playerOptionsDialog = document.getElementById('playerOptionsDialog')
        this.playerOptionsCloseButton = document.getElementById('playerOptionsCloseButton')
        this.playerOptionsApplyButton = document.getElementById('playerOptionsApplyButton')
        this.playerOptionsPlayerName = document.getElementById('playerOptionsPlayerName') as HTMLInputElement
        this.playerOptionsObserverMode = document.getElementById('playerOptionsObserverMode') as HTMLInputElement

        this.addBaseListeners()
    }

    update(options: PlayerOptions) {
        if (null !== this.playerOptionsPlayerName) {
            this.playerOptionsPlayerName.value = options.name
        }
        if (null !== this.playerOptionsObserverMode) {
            this.playerOptionsObserverMode.checked = options.observerMode
        }
    }

    protected getData() {
        return {
            id: this.sessionTable.playerInfo.id,
            name: this.playerOptionsPlayerName?.value || '',
            observerMode: this.playerOptionsObserverMode?.checked || false
        }
    }

    protected get dialogElement(): HTMLElement | null {
        return this.playerOptionsDialog
    }

    protected get closeButton(): HTMLElement | null {
        return this.playerOptionsCloseButton
    }

    protected get applyButton(): HTMLElement | null {
        return this.playerOptionsApplyButton
    }
}
