import { PlayerOptions } from '@server/model/PlayerOptions'
import { SessionTable } from '@/data/SessionTable'
import { OptionsDialog } from '@/hud-components/OptionsDialog'

export class PlayerOptionsDialogController extends OptionsDialog<PlayerOptions> {
    protected readonly dialogElement: HTMLElement | null
    protected readonly closeButton: HTMLElement | null
    protected readonly applyButton: HTMLElement | null
    private readonly playerOptionsPlayerName: HTMLInputElement | null
    private readonly playerOptionsObserverMode: HTMLInputElement | null

    constructor(private readonly sessionTable: SessionTable) {
        super()
        this.dialogElement = document.getElementById('playerOptionsDialog')
        this.closeButton = document.getElementById('playerOptionsDialog--closeButton')
        this.applyButton = document.getElementById('playerOptionsDialog--applyButton')
        this.playerOptionsPlayerName = document.getElementById('playerOptionsDialog--playerName') as HTMLInputElement
        this.playerOptionsObserverMode = document.getElementById('playerOptionsDialog--observerMode') as HTMLInputElement

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
}
