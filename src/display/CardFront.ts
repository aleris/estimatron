import { Container, Point, Shadow, Shape, Text } from '@createjs/easeljs'
import { Ease, Tween } from '@createjs/tweenjs'
import { RefreshLayout } from './RefreshLayout'
import { Card } from '../data/Card'
import { PositionAndRotation } from './PositionAndRotation'
import { CardConstants } from './CardConstants'

export class CardFront extends Container implements RefreshLayout {
    private static readonly TEXT_TOP_LEFT_RATIO = 0.07
    private static readonly SHADOW_OVER_OFFSET = 4
    private static readonly SHADOW_OVER_BLUR = 6
    private static readonly RISE_TIME = 80
    private static readonly LOWER_TIME = 240
    private static readonly GRAB_ROTATE_TIME = 500
    private static readonly TEXT_COLOR = '#424242'
    private static readonly TEXT_FONT = 'Dosis'
    private static readonly TEXT_FONT_RATIO = 0.2

    public center: Point

    private readonly background: Shape

    private readonly backgroundShadow: Shadow

    private readonly topLeftText: any
    private readonly bottomRightText: any

    private dragOffset: Point

    public handPosition: PositionAndRotation | null = null

    constructor(
        public readonly card: Card,
        public readonly handZIndex: number
    ) {
        super()

        this.cursor = 'grab'

        this.background = new Shape()
        this.addChild(this.background)

        this.backgroundShadow = new Shadow(
            CardConstants.SHADOW_COLOR,
            CardConstants.SHADOW_OFFSET,
            CardConstants.SHADOW_OFFSET,
            CardConstants.SHADOW_BLUR
        )
        this.background.shadow = this.backgroundShadow

        this.topLeftText = new Text(this.card.estimation)
        this.addChild(this.topLeftText)

        this.bottomRightText = new Text(this.card.estimation)
        this.addChild(this.bottomRightText)
    }

    refreshLayout() {
        this.center = new Point(Math.round(this.width / 2), Math.round(this.height / 2))

        this.regX = this.center.x
        this.regY = this.height // this.center.y

        this.refreshLayoutBackground()
        this.refreshLayoutTopLeftText()
        this.refreshLayoutBottomRightText()

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

    private refreshLayoutTopLeftText() {
        const fontSize = Math.round(this.width * CardFront.TEXT_FONT_RATIO)
        this.topLeftText.font = `${fontSize}px '${CardFront.TEXT_FONT}'`
        this.topLeftText.color = CardFront.TEXT_COLOR
        const relativeToCorner = Math.round(this.width * CardFront.TEXT_TOP_LEFT_RATIO)
        this.topLeftText.x = relativeToCorner
        this.topLeftText.y = relativeToCorner
    }

    private refreshLayoutBottomRightText() {
        const fontSize = Math.round(this.width * CardFront.TEXT_FONT_RATIO)
        this.bottomRightText.font = `${fontSize}px '${CardFront.TEXT_FONT}'`
        this.bottomRightText.color = CardFront.TEXT_COLOR
        this.bottomRightText.rotation = 180
        const relativeToCorner = Math.round(this.width * CardFront.TEXT_TOP_LEFT_RATIO)
        this.bottomRightText.x = this.width - relativeToCorner
        this.bottomRightText.y = this.height - relativeToCorner
    }

    public raise() {
        this.parent.setChildIndex(this, this.parent.numChildren - 1)
        Tween.get(this.backgroundShadow, { override: true })
            .to(
                {
                    offsetX: CardFront.SHADOW_OVER_OFFSET,
                    offsetY: CardFront.SHADOW_OVER_OFFSET,
                    blur: CardFront.SHADOW_OVER_BLUR
                },
                CardFront.RISE_TIME,
                Ease.quadOut
            )
    }

    public lower() {
        this.parent.setChildIndex(this, this.handZIndex)
        Tween.get(this.backgroundShadow, { override: true })
            .to(
                {
                    offsetX: CardConstants.SHADOW_OFFSET,
                    offsetY: CardConstants.SHADOW_OFFSET,
                    blur: CardConstants.SHADOW_BLUR
                },
                CardFront.LOWER_TIME,
                Ease.quadIn
            )
    }

    grab(pos: Point) {
        this.cursor = 'grabbing'
        this.forceUpdateCursor()
        this.parent.setChildIndex(this, this.parent.numChildren - 1)
        this.dragOffset = new Point(this.x - pos.x, this.y - pos.y)
        Tween.get(this, { override: true }).to({
                regX: this.dragOffset.x + this.center.x,
                regY: this.dragOffset.y + this.center.y,
                rotation: 0
            },
            CardFront.GRAB_ROTATE_TIME,
            Ease.quadOut
        )
        this.raise()
    }

    drag(pos: Point) {
        this.x = pos.x + this.dragOffset.x
        this.y = pos.y + this.dragOffset.y
    }

    dropTo(pos: PositionAndRotation) {
        this.cursor = 'grab'
        this.forceUpdateCursor()
        Tween.get(this, { override: true }).to(
            {
                ...pos,
                regX: this.center.x,
                regY: this.height
            },
            CardFront.LOWER_TIME,
            Ease.quadOut
        )
        this.lower()
    }

    // see https://github.com/CreateJS/EaselJS/issues/861
    private forceUpdateCursor() {
        this.stage._testMouseOver(true)
    }
}
