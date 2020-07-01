import { Bet } from '@server/model/Bet'
import { PlayerInfo } from '@server/model/PlayerInfo'
import { SessionTable } from '@/data/SessionTable'
import { HandOfCardsContainer } from '@/display/HandOfCardsContainer'
import { RefreshLayout } from '@/display/RefreshLayout'
import { SceneLayout } from '@/display/SceneLayout'
import { PlayerSlotsContainer } from '@/display/PlayerSlotsContainer'
import { SceneButton } from '@/display/SceneButton'
import { SceneConstants } from '@/display/SceneConstants'
import { DebugGuideLine, GuideLineOrientation } from '@/display/DebugGuideLine'
import { Container } from '@/createjs'

export class TableContainer extends Container implements RefreshLayout {
    public onChangeMyBet: (bet: Bet) => void = () => {}
    public onRevealBetsClick: () => void = () => {}
    public onResetTableClick: () => void = () => {}

    private readonly playerSlotsList: PlayerSlotsContainer
    private readonly handOfCards: HandOfCardsContainer
    private readonly revealBetsButton: SceneButton
    private readonly resetButton: SceneButton

    public width: number = 0
    public height: number = 0

    constructor(
        private readonly sceneLayout: SceneLayout,
        private readonly sessionTable: SessionTable
    ) {
        super()
        this.playerSlotsList = new PlayerSlotsContainer(sceneLayout, sessionTable)
        this.addChild(this.playerSlotsList)

        this.revealBetsButton = new SceneButton(
            sceneLayout,
            'REVEAL',
            false,
            SceneConstants.REVEAL_BUTTON_BACKGROUND_COLOR,
            SceneConstants.REVEAL_BUTTON_BACKGROUND_COLOR_ROLLOVER
        )
        this.addChild(this.revealBetsButton)
        this.revealBetsButton.addEventListener('click', () => {
            if (!this.revealBetsButton.disabled) {
                this.onRevealBetsClick()
            }
        })

        this.resetButton = new SceneButton(
            sceneLayout,
            ' RESET',
            true,
            SceneConstants.RESET_BUTTON_BACKGROUND_COLOR,
            SceneConstants.RESET_BUTTON_BACKGROUND_COLOR_ROLLOVER
        )
        this.resetButton.disabled = true
        this.resetButton.addEventListener('click', () => {
            if (!this.resetButton.disabled) {
                this.onResetTableClick()
            }
        })
        this.addChild(this.resetButton)

        this.handOfCards = new HandOfCardsContainer(sceneLayout, sessionTable, this.playerSlotsList)
        this.handOfCards.onChangeMyBet = this.changeMyBet.bind(this)
        this.addChild(this.handOfCards)
    }

    refreshLayout(): void {
        this.height = this.sceneLayout.sceneHeight
        this.width = this.sceneLayout.sceneWidth

        this.updateControlButtonsState()

        this.revealBetsButton.y = this.height / 2
        this.revealBetsButton.x = (this.sceneLayout.sceneWidth - this.sceneLayout.sceneWidth / 6) - this.revealBetsButton.width

        this.resetButton.y = this.revealBetsButton.y
        this.resetButton.x = this.sceneLayout.sceneWidth / 6

        this.playerSlotsList.refreshLayout()
        this.handOfCards.refreshLayout()

        // this.addChild(new DebugGuideLine(this.sceneLayout.halfSceneHeight, GuideLineOrientation.Horizontal))
    }

    otherPlayerBet(player: PlayerInfo) {
        this.handOfCards.createCardForOtherPlayer(player, true)
        this.updateControlButtonsState()
    }

    refreshPlayers(): void {
        this.playerSlotsList.refreshLayout()
        this.updateControlButtonsState()
    }

    changeMyBet(bet: Bet) {
        this.onChangeMyBet(bet)
        this.updateControlButtonsState()
    }

    revealBets() {
        this.handOfCards.revealBets()
        this.updateControlButtonsState()
    }

    resetTable() {
        this.handOfCards.resetBets()
        this.updateControlButtonsState()
    }

    updateDeckCardsIfChanged() {
        this.handOfCards.updateDeckCardsIfChanged()
    }

    private updateControlButtonsState() {
        const isRevealed = this.sessionTable.tableInfo.revealed
        this.revealBetsButton.disabled = isRevealed
        this.revealBetsButton.refreshLayout()
        this.resetButton.disabled = !this.sessionTable.areBetsPresent && !isRevealed
        this.resetButton.refreshLayout()
    }
}
