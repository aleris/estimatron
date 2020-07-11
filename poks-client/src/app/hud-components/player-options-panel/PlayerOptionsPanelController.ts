import { SessionTable } from '@/app/data/SessionTable'

export class PlayerOptionsPanelController {
    private readonly optionsButton: HTMLElement | null
    private readonly playerName: HTMLElement | null

    public onPlayerOptionsButtonClick: () => void = () => {}

    constructor(private readonly sessionTable: SessionTable) {
        this.optionsButton = document.getElementById('playerOptionsPanel--optionsButton')
        this.optionsButton?.addEventListener('click', () => this.onPlayerOptionsButtonClick())
        this.playerName = document.getElementById('playerOptionsPanel--playerName')
    }

    refresh() {
        if (this.playerName) {
            this.playerName.textContent = this.sessionTable.playerInfo.name
        }
    }

    refocusAction() {
        setTimeout(() => this.optionsButton?.focus(), 0)
    }
}
