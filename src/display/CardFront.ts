import { Container, Point, Shadow, Shape, Text } from '@createjs/easeljs'
import { Ease, Tween } from '@createjs/tweenjs'
import { RefreshLayout } from './RefreshLayout'
import { Card } from '../data/Card'
import { PositionAndRotation } from './PositionAndRotation'
import { CardConstants } from './CardConstants'
import { Estimation } from '../data/Bet'

export class CardFront extends Container implements RefreshLayout {
    private static readonly TEXT_TOP_LEFT_RATIO = 0.07
    private static readonly TEXT_COLOR = '#424242'
    private static readonly TEXT_FONT = 'Dosis'
    private static readonly TEXT_FONT_RATIO = 0.2

    private readonly background: Shape

    private readonly topLeftText: any
    private readonly bottomRightText: any

    constructor(
        public readonly estimation: Estimation
    ) {
        super()

        this.cursor = 'grab'

        this.background = new Shape()
        this.addChild(this.background)

        this.topLeftText = new Text(this.estimation)
        this.addChild(this.topLeftText)

        this.bottomRightText = new Text(this.estimation)
        this.addChild(this.bottomRightText)
    }

    refreshLayout() {
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
}
