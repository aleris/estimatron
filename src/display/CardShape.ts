import { Container, Point, Shadow, Shape } from '@createjs/easeljs'
import { RefreshLayout } from './RefreshLayout'
import { Card } from '../data/Card'
import { CardConstants } from './CardConstants'
import { PositionAndRotation } from './PositionAndRotation'
import { CardFront } from './CardFront'
import { CardBack } from './CardBack'

export enum CardSide {
    Front,
    Back
}

export class CardShape extends Container implements RefreshLayout {
    public center: Point

    private readonly container: Container
    private readonly background: Shape

    private readonly backgroundShadow: Shadow

    private dragOffset: Point

    public handPosition: PositionAndRotation | null = null

    private readonly cardFront: CardFront
    private readonly cardBack: CardBack

    constructor(
        public readonly card: Card,
        public readonly handZIndex = 0
    ) {
        super()

        this.background = new Shape()
        this.addChild(this.background)

        this.backgroundShadow = new Shadow(
            CardConstants.SHADOW_COLOR,
            CardConstants.SHADOW_OFFSET,
            CardConstants.SHADOW_OFFSET,
            CardConstants.SHADOW_BLUR
        )
        this.background.shadow = this.backgroundShadow
        this.cardFront = new CardFront(card, handZIndex)
    }

    refreshLayout() {
        this.center = new Point(Math.round(this.width / 2), Math.round(this.height / 2))

        this.regX = this.center.x
        this.regY = this.height // this.center.y

        this.refreshLayoutBackground()

        // this.addChild(new DebugPointDisplay(this.center.x, this.center.y))
    }

    private refreshLayoutBackground() {
        const rectRadius = Math.round(this.width * CardConstants.BACKGROUND_RADIUS_REPORT)
        this.background.graphics
            .clear()
            .beginFill(CardConstants.BACKGROUND_COLOR)
            .drawRoundRect(0, 0, this.width, this.height, rectRadius)
            .endFill()
    }
}
