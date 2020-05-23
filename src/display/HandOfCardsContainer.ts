import { Container, Point, Shape } from '@createjs/easeljs'
import { CardFront } from './CardFront'
import { SceneLayout } from './SceneLayout'
import { RefreshLayout } from './RefreshLayout'
import { EstimationPack, EstimationPacks } from '../data/EstimationPacks'
import { Card } from '../data/Card'
import { PositionAndRotation } from './PositionAndRotation'

export class HandOfCardsContainer extends Container implements RefreshLayout {
    private static readonly START_ANGLE = -Math.PI / 2 - Math.PI / 8
    private static readonly ANGLE_SPREAD = Math.PI / 4
    public readonly cards = new Array<CardFront>()

    private readonly container: Container
    private draggedCardStart: Point
    private grabbedCard?: CardFront = null
    private radius: number

    public onDrop: (cardDisplay: CardFront, dropPosition: Point) => void

    constructor(private readonly sceneLayout: SceneLayout) {
        super()
        this.container = new Container()
        this.changeEstimationPack(EstimationPacks.Default)
        this.addChild(this.container)
    }

    changeEstimationPack(estimationPack: EstimationPack) {
        const texts = estimationPack.choices
        this.container.removeAllChildren()
        for (let i = 0; i !== texts.length; i++) {
            const text = texts[i]
            const card = new CardFront(new Card(text), i)
            this.cards.push(card)
            this.container.addChild(card)

            // card.addEventListener('mouseover', () => this.raise(card))
            // card.addEventListener('mouseout', () => this.lower(card))
            card.addEventListener('mousedown', (event: any) => this.grab(card, new Point(event.stageX, event.stageY)))
            card.addEventListener('pressmove', (event: any) => this.drag(card, new Point(event.stageX, event.stageY)))
            card.addEventListener('pressup', (event: any) => this.drop(card, new Point(event.stageX, event.stageY)))
        }
    }

    refreshLayout(): void {
        this.radius = this.sceneLayout.sceneWidth / 3
        this.arrangeCards(this.sceneLayout)
        // this.regX = -sceneLayout.halfSceneWidth
        // this.regY = -sceneLayout.halfSceneHeight
            // -sceneLayout.sceneHeight
            // - this.radius
            // - sceneLayout.halfCardHeight
            // + this.calculateFilledHeight(sceneLayout)

        const dbgCenter = new Shape()
        dbgCenter.graphics.beginStroke('red').drawCircle(0, 0, 3)
        this.addChild(dbgCenter)
        // const dbgStartX = new Shape()
        // const h = this.radius + this.tableLayout.halfCardHeight + this.radius * Math.sin(HandOfCards.START_ANGLE)
        //      // this.tableLayout.halfCardHeight// * Math.atan(HandOfCards.START_ANGLE)
        //
        // const h1 = h
        //     - Math.sqrt(this.tableLayout.halfCardHeight * this.tableLayout.halfCardHeight + this.tableLayout.halfCardWidth * this.tableLayout.halfCardWidth)
        //     * Math.sin(-Math.PI / 2 - Math.PI / 8)
        // dbgStartX.graphics.beginStroke('red').drawRect(-this.radius, -this.radius - this.tableLayout.halfCardHeight, this.radius * 2, h)
        //
        // dbgStartX.graphics.beginStroke('red').drawRect(-this.radius, -this.radius - this.tableLayout.halfCardHeight, this.radius * 2, h1)
        //
        // this.addChild(dbgStartX)
    }

    drag(card: CardFront, pos: Point) {
        card.drag(pos)
    }

    grab(card: CardFront, pos: Point) {
        this.grabbedCard = card
        this.draggedCardStart = new Point(card.x, card.y)
        card.grab(pos)
    }

    drop(card: CardFront, pos: Point) {
        card.dropTo(pos)
        this.grabbedCard = null
        if (this.onDrop) {
            this.onDrop(card, pos)
        }
    }

    private arrangeCards(sceneLayout: SceneLayout): Point {
        const offsetX = sceneLayout.halfSceneWidth
        const offsetY = sceneLayout.sceneHeight
            + this.radius
            + sceneLayout.cardHeight
            - this.calculateFilledHeight(sceneLayout)
        let angle = HandOfCardsContainer.START_ANGLE
        let angleIncrement = HandOfCardsContainer.ANGLE_SPREAD / (this.cards.length - 1)
        for (let card of this.cards) {
            card.width = sceneLayout.cardWidth
            card.height = sceneLayout.cardHeight
            card.x = offsetX + Math.round(this.radius * Math.cos(angle))
            card.y = offsetY + Math.round(this.radius * Math.sin(angle))
            card.rotation = this.radiansToDegrees(angle) * 3
            card.handPosition = new PositionAndRotation(card.x, card.y, card.rotation)
            card.refreshLayout()
            // console.log('card', card.x, card.y)
            angle += angleIncrement
        }
    }

    calculateFilledHeight(sceneLayout: SceneLayout): number {
        const angle = HandOfCardsContainer.START_ANGLE
        // const h = Math.sqrt(
        //     sceneLayout.halfCardHeight * sceneLayout.halfCardHeight
        //     + sceneLayout.halfCardWidth * sceneLayout.halfCardWidth
        // )
        const fromCenterY = this.radius * Math.sin(angle) + sceneLayout.cardHeight//  + h
        return Math.round(this.radius + fromCenterY + sceneLayout.halfCardHeight)
    }

    calculateFilledWidth(sceneLayout: SceneLayout): number {
        const lastAngle = HandOfCardsContainer.START_ANGLE + (this.cards.length - 1) * HandOfCardsContainer.ANGLE_SPREAD / (this.cards.length - 1)

        const firstCardFromCenterX = this.radius * Math.cos(HandOfCardsContainer.START_ANGLE)
            - sceneLayout.halfCardWidth
            + sceneLayout.halfCardWidth * Math.cos(HandOfCardsContainer.START_ANGLE)
        const lastCardFromCenterX = this.radius * Math.cos(lastAngle)
            + sceneLayout.halfCardWidth
            + sceneLayout.halfCardWidth * Math.cos(lastAngle)
        return Math.round(lastCardFromCenterX - firstCardFromCenterX)
    }

    private radiansToDegrees(angleInRadians: number): number {
        return 90 + angleInRadians * 180 / Math.PI
    }

    private degreesToRadians(angleInDegrees: number): number {
        return angleInDegrees * Math.PI / 180 - 90
    }
}