import { SessionTable } from '@/data/SessionTable'

export class PlayerOptionsPanelController {
    private readonly playerOptionsButton: HTMLElement | null
    private readonly playerOptionsPanelPlayerName: HTMLElement | null

    public onPlayerOptionsButtonClick: () => void = () => {}

    constructor(private readonly sessionTable: SessionTable) {
        this.playerOptionsButton = document.getElementById('playerOptionsButton')
        this.playerOptionsButton?.addEventListener('click', () => this.onPlayerOptionsButtonClick())
        this.playerOptionsPanelPlayerName = document.getElementById('playerOptionsPanelPlayerName')
    }

    refresh() {
        if (this.playerOptionsPanelPlayerName) {
            this.playerOptionsPanelPlayerName.textContent = this.sessionTable.playerInfo.name
        }
    }

    refocusAction() {
        setTimeout(() => this.playerOptionsButton?.focus(), 0)
    }
}
