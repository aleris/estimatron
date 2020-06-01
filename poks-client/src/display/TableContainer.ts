import { Container } from '@createjs/easeljs'
import { Bet } from '@server/model/Bet'
import { PlayerInfo } from '@server/model/PlayerInfo'
import { SessionTable } from '@/data/SessionTable'
import { HandOfCardsContainer } from '@/display/HandOfCardsContainer'
import { RefreshLayout } from '@/display/RefreshLayout'
import { SceneLayout } from '@/display/SceneLayout'
import { PlayerSlotsContainer } from '@/display/PlayerSlotsContainer'
import { SceneButton } from '@/display/SceneButton'

export class TableContainer extends Container implements RefreshLayout {
    public onChangeMyBet: (bet: Bet) => void = () => {}
    public onRevealBetsClick: () => void = () => {}
    public onResetTableClick: () => void = () => {}

    private readonly playerSlotsList: PlayerSlotsContainer
    private readonly handOfCards: HandOfCardsContainer
    private readonly revealBetsButton: SceneButton
    private readonly resetButton: SceneButton

    constructor(
        private readonly sceneLayout: SceneLayout,
        private readonly sessionTable: SessionTable
    ) {
        super()
        this.playerSlotsList = new PlayerSlotsContainer(sceneLayout, sessionTable)
        this.addChild(this.playerSlotsList)

        this.revealBetsButton = new SceneButton(sceneLayout, 'REVEAL', false)
        this.addChild(this.revealBetsButton)
        this.revealBetsButton.addEventListener('click', () => this.onRevealBetsClick())

        this.resetButton = new SceneButton(sceneLayout, ' RESET', true)
        this.resetButton.addEventListener('click', () => this.onResetTableClick())
        this.addChild(this.resetButton)

        this.handOfCards = new HandOfCardsContainer(sceneLayout, sessionTable, this.playerSlotsList)
        this.handOfCards.onChangeMyBet = this.changeMyBet.bind(this)
        this.addChild(this.handOfCards)
    }

    animateOtherPlayerBet(player: PlayerInfo) {
        this.handOfCards.createCardForOtherPlayer(player, true)
    }

    refreshLayout(): void {
        console.log('refreshLayout')
        this.height = this.sceneLayout.sceneHeight
        this.width = this.sceneLayout.sceneWidth

        this.revealBetsButton.refreshLayout()
        this.revealBetsButton.y = this.height / 2
        this.revealBetsButton.x = (this.sceneLayout.sceneWidth - this.sceneLayout.sceneWidth / 6) - this.revealBetsButton.width

        this.resetButton.refreshLayout()
        this.resetButton.y = this.revealBetsButton.y
        this.resetButton.x = this.sceneLayout.sceneWidth / 6

        this.playerSlotsList.refreshLayout()
        this.handOfCards.refreshLayout()

        // this.addChild(new DebugGuideLineDisplay(sceneLayout.halfSceneWidth, GuideLineOrientation.Vertical))
        // this.addChild(new DebugGuideLineDisplay(sceneLayout.halfSceneHeight, GuideLineOrientation.Horizontal))
        // this.addChild(new DebugGuideLineDisplay(sceneLayout.halfSceneHeight / 2, GuideLineOrientation.Horizontal))
    }

    refreshPlayers(): void {
        this.playerSlotsList.refreshLayout()
    }

    changeMyBet(bet: Bet) {
        this.onChangeMyBet(bet)
    }

    revealBets() {
        this.handOfCards.revealBets()
    }

    resetTable() {
    }
}
