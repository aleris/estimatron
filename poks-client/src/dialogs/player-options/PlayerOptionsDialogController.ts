import { ChangePlayerOptionsData } from '@server/model/ChangePlayerOptionsData'
import { OptionsDialog } from '@/dialogs/OptionsDialog'

export class PlayerOptionsDialogController extends OptionsDialog<ChangePlayerOptionsData> {
    private readonly playerOptionsDialog: HTMLElement | null
    private readonly playerOptionsCloseButton: HTMLElement | null
    private readonly playerOptionsApplyButton: HTMLElement | null
    private readonly playerOptionsPlayerName: HTMLInputElement | null
    private readonly playerOptionsObserverMode: HTMLInputElement | null

    public onPlayerOptionsChanged: (playerOptions: ChangePlayerOptionsData) => void = () => {}

    constructor() {
        super()
        this.playerOptionsDialog = document.getElementById('playerOptionsDialog')
        this.playerOptionsCloseButton = document.getElementById('playerOptionsCloseButton')
        this.playerOptionsApplyButton = document.getElementById('playerOptionsApplyButton')
        this.playerOptionsPlayerName = document.getElementById('playerOptionsPlayerName') as HTMLInputElement
        this.playerOptionsObserverMode = document.getElementById('playerOptionsObserverMode') as HTMLInputElement

        this.playerOptionsCloseButton?.addEventListener('click', () => {
            this.toggleDialog()
        })

        this.playerOptionsApplyButton?.addEventListener('click', () => {
            this.onPlayerOptionsChanged({
                playerName: this.playerOptionsPlayerName?.value || '',
                observerMode: this.playerOptionsObserverMode?.checked || false
            })
            this.toggleDialog()
        })
    }

    protected get dialogElement(): HTMLElement | null {
        return this.playerOptionsDialog
    }

    update(options: ChangePlayerOptionsData) {
        if (null !== this.playerOptionsPlayerName) {
            this.playerOptionsPlayerName.value = options.playerName
        }
        if (null !== this.playerOptionsObserverMode) {
            this.playerOptionsObserverMode.checked = options.observerMode
        }
    }
}
