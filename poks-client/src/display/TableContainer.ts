import { Container, Point } from '@createjs/easeljs'
import { HandOfCardsContainer } from '@/display/HandOfCardsContainer'
import { RefreshLayout } from '@/display/RefreshLayout'
import { SceneLayout } from '@/display/SceneLayout'
import { PlayerSlotsContainer } from '@/display/PlayerSlotsContainer'
import { PositionAndRotation } from '@/display/PositionAndRotation'
import { CardShape } from '@/display/CardShape'
import { SessionTable } from '@/data/SessionTable'
import { Bet, BetHelper } from '@server/model/Bet'
import { PlayerInfo } from '@server/model/PlayerInfo'
import { SceneButton } from '@/display/SceneButton'

export class TableContainer extends Container implements RefreshLayout {
    public onChangeMyBet: (bet: Bet) => void = () => {}
    public onRevealBetsClick: () => void = () => {}
    public onResetTableClick: () => void = () => {}

    private readonly playerSlotsList: PlayerSlotsContainer
    private readonly handOfCards: HandOfCardsContainer
    private readonly revealBetsButton: SceneButton
    private readonly resetButton: SceneButton
    private betCard: CardShape | null = null

    constructor(
        private readonly sceneLayout: SceneLayout,
        private readonly sessionTable: SessionTable
    ) {
        super()
        this.playerSlotsList = new PlayerSlotsContainer(sceneLayout, sessionTable)
        this.addChild(this.playerSlotsList)

        this.handOfCards = new HandOfCardsContainer(sceneLayout, sessionTable)
        this.handOfCards.onDrop = this.onDropCard.bind(this)
        this.addChild(this.handOfCards)

        this.revealBetsButton = new SceneButton(sceneLayout, 'REVEAL', false)
        this.addChild(this.revealBetsButton)
        this.revealBetsButton.addEventListener('click', () => this.onRevealBetsClick())

        this.resetButton = new SceneButton(sceneLayout, ' RESET', true)
        this.resetButton.addEventListener('click', () => this.onResetTableClick())
        this.addChild(this.resetButton)
    }

    animateOtherPlayerBet(player: PlayerInfo) {
        this.playerSlotsList.createOtherPlayerBet(player, true)
    }

    refreshLayout(): void {
        console.log('refreshLayout')
        this.height = this.sceneLayout.sceneHeight
        this.width = this.sceneLayout.sceneWidth

        this.playerSlotsList.refreshLayout()
        this.handOfCards.refreshLayout()

        this.revealBetsButton.refreshLayout()
        this.revealBetsButton.y = this.height / 2
        this.revealBetsButton.x = (this.sceneLayout.sceneWidth - this.sceneLayout.sceneWidth / 6) - this.revealBetsButton.width

        this.resetButton.refreshLayout()
        this.resetButton.y = this.revealBetsButton.y
        this.resetButton.x = this.sceneLayout.sceneWidth / 6

        // if current state contain bet card for current place it on slots instead of the hand
        const player = this.sessionTable.player
        if (player !== null) {
            if (BetHelper.hasEstimation(player.bet)) {
                const card = this.handOfCards.getCard(player.bet.estimation)
                if (card !== undefined) {
                    this.playerSlotsList.placeCardOnPlayerSlot(card, player)
                    this.betCard = card
                } else {
                    console.error(`card for ${player.bet.estimation} not set on refresh layout`)
                }
            }
        } else {
            console.error(`current player not set on refresh layout`)
        }

        // this.addChild(new DebugGuideLineDisplay(sceneLayout.halfSceneWidth, GuideLineOrientation.Vertical))
        // this.addChild(new DebugGuideLineDisplay(sceneLayout.halfSceneHeight, GuideLineOrientation.Horizontal))
        // this.addChild(new DebugGuideLineDisplay(sceneLayout.halfSceneHeight / 2, GuideLineOrientation.Horizontal))
    }

    refreshPlayers(): void {
        this.playerSlotsList.refreshLayout()
    }

    private onDropCard(card: CardShape, pos: Point) {
        if (this.acceptDropToSlot(pos)) {
            if (null !== this.betCard && null !== this.betCard.handPosition) {
                this.betCard.dropTo(this.betCard.handPosition)
            }
            const playerSlot = this.playerSlotsList.playerSlot
            if (playerSlot) {
                card.dropTo(new PositionAndRotation(playerSlot.x, playerSlot.y, 0))
            } else {
                console.error(`player slot not initialized`)
            }
            if (this.betCard !== card) {
                this.betCard = card
                this.onChangeMyBet(BetHelper.betWith(this.betCard.text))
            }
        } else {
            if (null !== card.handPosition) {
                card.dropTo(card.handPosition)
            }
            if (this.betCard === card) {
                this.onChangeMyBet(BetHelper.noBet())
                this.betCard = null
            }
        }
    }

    private acceptDropToSlot(pos: Point): boolean {
        return pos.y < this.height / 2
    }

    revealBets() {
        this.playerSlotsList.revealBets()
    }

    resetTable() {
    }
}
