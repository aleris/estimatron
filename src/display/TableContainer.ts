import { Container, Point } from '@createjs/easeljs'
import { HandOfCardsContainer } from './HandOfCardsContainer'
import { RefreshLayout } from './RefreshLayout'
import { SceneLayout } from './SceneLayout'
import { PlayerSlotsContainer } from './PlayerSlotsContainer'
import { Table } from '../data/Table'
import { CardFront } from './CardFront'
import { PositionAndRotation } from './PositionAndRotation'
import { Bet, BetBuilder } from '../data/Bet'
import { Player } from '../data/Player'

export class TableContainer extends Container implements RefreshLayout {
    private readonly playerSlotsList: PlayerSlotsContainer
    private readonly handOfCards: HandOfCardsContainer
    private betCard: CardFront | null = null

    public onChangeMyBet: (bet: Bet) => void

    constructor(private readonly sceneLayout: SceneLayout, private readonly table: Table) {
        super()
        this.playerSlotsList = new PlayerSlotsContainer(sceneLayout, table)
        this.addChild(this.playerSlotsList)
        this.handOfCards = new HandOfCardsContainer(sceneLayout)
        this.handOfCards.onDrop = this.onDropCard.bind(this)
        this.addChild(this.handOfCards)
    }

    animateOtherPlayerBet(player: Player) {
        this.playerSlotsList.animateOtherPlayerBet(player)
    }

    refreshLayout(): void {
        this.height = this.sceneLayout.sceneHeight
        this.width = this.sceneLayout.sceneWidth

        this.playerSlotsList.refreshLayout()
        this.handOfCards.refreshLayout()

        // this.addChild(new DebugGuideLineDisplay(sceneLayout.halfSceneWidth, GuideLineOrientation.Vertical))
        // this.addChild(new DebugGuideLineDisplay(sceneLayout.halfSceneHeight, GuideLineOrientation.Horizontal))
        // this.addChild(new DebugGuideLineDisplay(sceneLayout.halfSceneHeight / 2, GuideLineOrientation.Horizontal))
    }

    refreshPlayers(): void {
        this.playerSlotsList.refreshLayout()
    }

    private onDropCard(card: CardFront, pos: Point) {
        if (this.acceptDropToSlot(pos)) {
            if (null !== this.betCard) {
                this.betCard.dropTo(this.betCard.handPosition)
            }
            const playerSlot = this.playerSlotsList.playerSlot
            card.dropTo(new PositionAndRotation(playerSlot.x, playerSlot.y, 0))
            this.betCard = card
            this.onChangeMyBet(BetBuilder.betWith(this.betCard.card.estimation))
        } else {
            card.dropTo(card.handPosition)
            this.onChangeMyBet(BetBuilder.noBet())
        }
    }

    private acceptDropToSlot(pos: Point): boolean {
        return pos.y < this.height / 2
    }

    revealBets() {

    }
}
