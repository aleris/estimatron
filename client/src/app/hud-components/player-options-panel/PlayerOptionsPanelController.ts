import { SessionTable } from '@/app/data/SessionTable'
import { PlayerInfo } from '@server/model/PlayerInfo'

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
            this.playerName.textContent = this.getPlayerNameForDisplay(this.sessionTable.playerInfo)
        }
    }

    refocusAction() {
        setTimeout(() => this.optionsButton?.focus(), 0)
    }

    private getPlayerNameForDisplay(playerInfo: PlayerInfo): string {
        if (playerInfo.observerMode) {
            return `👀 ${playerInfo.name}`
        }
        return playerInfo.name
    }
}
