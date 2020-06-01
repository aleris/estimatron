import { Container, Point } from '@createjs/easeljs'
import { DeckKind, DeckRepository } from '@server/model/Decks'
import { estimation } from '@server/model/Bet'
import { SceneLayout } from '@/display/SceneLayout'
import { RefreshLayout } from '@/display/RefreshLayout'
import { PositionAndRotation } from '@/display/PositionAndRotation'
import { CardShape } from '@/display/CardShape'
import { SessionTable } from '@/data/SessionTable'

export class HandOfCardsContainer extends Container implements RefreshLayout {
    private static readonly START_ANGLE = -Math.PI / 2 - Math.PI / 8
    private static readonly ANGLE_SPREAD = Math.PI / 4
    private readonly cards = new Map<estimation, CardShape>()

    private readonly container: Container
    private draggedCardStart: Point
    private grabbedCard: CardShape | null = null
    private deckKind: DeckKind | null = null

    public onDrop: (cardShape: CardShape, dropPosition: Point) => void = () => {}

    constructor(private readonly sceneLayout: SceneLayout, private readonly sessionTable: SessionTable) {
        super()
        this.container = new Container()
        this.addChild(this.container)
    }

    refreshLayout(): void {
        const tableDeckKind = this.sessionTable.tableInfo?.deckKind
        if (undefined !== tableDeckKind && this.deckKind !== tableDeckKind) {
            this.updateDeck(tableDeckKind)
        }
        this.arrangeCards(this.sceneLayout)
        // if (sessionTable)
    }

    getCard(estimation: estimation): CardShape | undefined {
        return this.cards.get(estimation)
    }

    updateDeck(deckKind: DeckKind) {
        this.deckKind = deckKind
        const deck = DeckRepository.of(this.deckKind)
        const texts = deck.texts
        this.container.removeAllChildren()
        this.cards.clear()
        for (let i = 0; i !== texts.length; i++) {
            const estimation = texts[i]
            const cardShape = new CardShape(estimation, i)
            this.cards.set(estimation, cardShape)
            this.container.addChild(cardShape)

            cardShape.addEventListener(
                'mousedown',
                (event: any) => this.grab(cardShape, new Point(event.stageX, event.stageY))
            )
            cardShape.addEventListener(
                'pressmove',
                (event: any) => this.drag(cardShape, new Point(event.stageX, event.stageY))
            )
            cardShape.addEventListener(
                'pressup',
                (event: any) => this.drop(cardShape, new Point(event.stageX, event.stageY))
            )
        }
    }

    private drag(card: CardShape, pos: Point) {
        card.drag(pos)
    }

    private grab(card: CardShape, pos: Point) {
        this.grabbedCard = card
        this.draggedCardStart = new Point(card.x, card.y)
        card.grab(pos)
    }

    private drop(card: CardShape, pos: Point) {
        card.dropTo(pos)
        this.grabbedCard = null
        if (this.onDrop) {
            this.onDrop(card, pos)
        }
    }

    private arrangeCards(sceneLayout: SceneLayout): Point {
        const radius = this.sceneLayout.sceneWidth / 3
        const offsetX = sceneLayout.halfSceneWidth
        const offsetY = sceneLayout.sceneHeight
            + radius
            + sceneLayout.cardHeight
            - this.calculateFilledHeight(sceneLayout, radius)
        let angle = HandOfCardsContainer.START_ANGLE
        let angleIncrement = HandOfCardsContainer.ANGLE_SPREAD / (this.cards.size - 1)
        for (let card of this.cards.values()) {
            card.width = sceneLayout.cardWidth
            card.height = sceneLayout.cardHeight
            card.x = offsetX + Math.round(radius * Math.cos(angle))
            card.y = offsetY + Math.round(radius * Math.sin(angle))
            card.rotation = this.radiansToDegrees(angle) * 3
            card.handPosition = new PositionAndRotation(card.x, card.y, card.rotation)
            card.refreshLayout()
            // console.log('card', card.x, card.y)
            angle += angleIncrement
        }
    }

    private calculateFilledHeight(sceneLayout: SceneLayout, radius: number): number {
        const fromCenterY = radius * Math.sin(HandOfCardsContainer.START_ANGLE) + sceneLayout.cardHeight
        return Math.round(radius + fromCenterY + sceneLayout.halfCardHeight)
    }

    private radiansToDegrees(angleInRadians: number): number {
        return 90 + angleInRadians * 180 / Math.PI
    }
}
