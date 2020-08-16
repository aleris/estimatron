import { Container } from '@/app/createjs'
import { Bet } from '@server/model/Bet'
import { PlayerInfo } from '@server/model/PlayerInfo'
import { SessionTable } from '@/app/data/SessionTable'
import { HandOfCardsContainer } from '@/app/display/HandOfCardsContainer'
import { RefreshLayout } from '@/app/display/RefreshLayout'
import { SceneLayout } from '@/app/display/SceneLayout'
import { PlayerSlotsContainer } from '@/app/display/PlayerSlotsContainer'
import { ObserversContainer } from '@/app/display/ObserversContainer'
import { SceneButton } from '@/app/display/SceneButton'
import { SceneConstants } from '@/app/display/SceneConstants'
import { DebugGuideLine, GuideLineOrientation } from '@/app/display/DebugGuideLine'
import { InviteOthersButton } from '@/app/display/InviteOthersButton'

export class TableContainer extends Container implements RefreshLayout {
    public onChangeMyBet: (bet: Bet) => void = () => {}
    public onRevealBetsClick: () => void = () => {}
    public onResetTableClick: () => void = () => {}
    public onInviteOthersClick: () => void = () => {}

    private readonly observersContainer: ObserversContainer
    private readonly playerSlotsContainer: PlayerSlotsContainer
    private readonly handOfCards: HandOfCardsContainer
    private readonly revealBetsButton: SceneButton
    private readonly resetButton: SceneButton
    private readonly inviteOthersButton: InviteOthersButton

    public width: number = 0
    public height: number = 0

    constructor(
        private readonly sceneLayout: SceneLayout,
        private readonly sessionTable: SessionTable
    ) {
        super()
        this.observersContainer = new ObserversContainer(sceneLayout, sessionTable)
        this.addChild(this.observersContainer)

        this.playerSlotsContainer = new PlayerSlotsContainer(sceneLayout, sessionTable)
        this.addChild(this.playerSlotsContainer)

        this.revealBetsButton = new SceneButton(
            sceneLayout,
            'REVEAL',
            SceneConstants.REVEAL_BUTTON_BACKGROUND_COLOR,
            SceneConstants.REVEAL_BUTTON_BACKGROUND_COLOR_ROLLOVER,
            false
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
            SceneConstants.RESET_BUTTON_BACKGROUND_COLOR,
            SceneConstants.RESET_BUTTON_BACKGROUND_COLOR_ROLLOVER,
            true
        )
        this.resetButton.disabled = true
        this.resetButton.addEventListener('click', () => {
            if (!this.resetButton.disabled) {
                this.onResetTableClick()
            }
        })
        this.addChild(this.resetButton)

        this.inviteOthersButton = new InviteOthersButton(
            sceneLayout,
            'INVITE\nOTHERS',
            SceneConstants.INVITE_OTHERS_BUTTON_BACKGROUND_COLOR,
            SceneConstants.INVITE_OTHERS_BUTTON_BACKGROUND_COLOR_ROLLOVER
        )
        this.inviteOthersButton.addEventListener('click', () => {
            this.onInviteOthersClick()
        })
        this.addChild(this.inviteOthersButton)

        this.handOfCards = new HandOfCardsContainer(sceneLayout, sessionTable, this.playerSlotsContainer)
        this.handOfCards.onChangeMyBet = this.changeMyBet.bind(this)
        this.addChild(this.handOfCards)
    }

    refreshLayout(): void {
        this.height = this.sceneLayout.sceneHeight
        this.width = this.sceneLayout.sceneWidth

        this.observersContainer.refreshLayout()
        this.playerSlotsContainer.refreshLayout()
        this.handOfCards.refreshLayout()

        this.updateControlButtonsState()
    }

    otherPlayerBet(player: PlayerInfo) {
        this.handOfCards.createCardForOtherPlayer(player, true)
        this.updateControlButtonsState()
    }

    refreshPlayers(): void {
        this.observersContainer.refreshLayout()
        this.playerSlotsContainer.refreshLayout()
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
        this.revealBetsButton.y = this.height / 2
        this.revealBetsButton.x = (this.sceneLayout.sceneWidth - this.sceneLayout.sceneWidth / 6) - this.revealBetsButton.width
        const isRevealed = this.sessionTable.tableInfo.revealed
        this.revealBetsButton.disabled = isRevealed
        this.revealBetsButton.refreshLayout()

        this.resetButton.disabled = !this.sessionTable.areBetsPresent && !isRevealed
        this.resetButton.refreshLayout()
        this.resetButton.y = this.revealBetsButton.y
        this.resetButton.x = this.sceneLayout.sceneWidth / 6

        this.inviteOthersButton.visible = this.sessionTable.players.length === 1
        this.inviteOthersButton.refreshLayout()
        const playerSlot = this.playerSlotsContainer.playerSlot
        if (playerSlot) {
            this.inviteOthersButton.x = playerSlot.x + this.sceneLayout.cardWidth
            this.inviteOthersButton.y = playerSlot.y - this.sceneLayout.cardHeight / 2
        }

    }
}
