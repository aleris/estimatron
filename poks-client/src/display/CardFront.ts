import { Container, Shape, Text } from '@createjs/easeljs'
import { RefreshLayout } from '@/display/RefreshLayout'
import { SceneConstants } from '@/display/SceneConstants'
import { estimation } from '@server/model/Bet'

export class CardFront extends Container implements RefreshLayout {
    private static readonly TEXT_TOP_LEFT_RATIO = 0.07
    private static readonly TEXT_COLOR = '#424242'
    private static readonly TEXT_FONT = 'Dosis'
    private static readonly TEXT_FONT_RATIO = 0.2

    private readonly background: Shape

    private readonly topLeftText: any
    private readonly bottomRightText: any

    constructor(
        public text: estimation
    ) {
        super()

        this.cursor = 'grab'

        this.background = new Shape()
        this.addChild(this.background)

        this.topLeftText = new Text(this.text)
        this.topLeftText.mouseEnabled = false
        this.addChild(this.topLeftText)

        this.bottomRightText = new Text(this.text)
        this.bottomRightText.mouseEnabled = false
        this.addChild(this.bottomRightText)
    }

    refreshLayout() {
        this.refreshLayoutBackground()
        this.refreshLayoutTopLeftText()
        this.refreshLayoutBottomRightText()

        // this.addChild(new DebugPointDisplay(this.center.x, this.center.y))
    }

    private refreshLayoutBackground() {
        const rectRadius = Math.round(this.width * SceneConstants.CARD_BACKGROUND_RADIUS_REPORT)
        this.background.graphics
            .clear()
            .beginFill(SceneConstants.CARD_BACKGROUND_COLOR)
            .drawRoundRect(0, 0, this.width, this.height, rectRadius)
            .endFill()
    }

    private refreshLayoutTopLeftText() {
        this.topLeftText.text = this.text
        const fontSize = Math.round(this.width * CardFront.TEXT_FONT_RATIO)
        this.topLeftText.font = `${fontSize}px '${CardFront.TEXT_FONT}'`
        this.topLeftText.color = CardFront.TEXT_COLOR
        const relativeToCorner = Math.round(this.width * CardFront.TEXT_TOP_LEFT_RATIO)
        this.topLeftText.x = relativeToCorner
        this.topLeftText.y = relativeToCorner
    }

    private refreshLayoutBottomRightText() {
        this.bottomRightText.text = this.text
        const fontSize = Math.round(this.width * CardFront.TEXT_FONT_RATIO)
        this.bottomRightText.font = `${fontSize}px '${CardFront.TEXT_FONT}'`
        this.bottomRightText.color = CardFront.TEXT_COLOR
        this.bottomRightText.rotation = 180
        const relativeToCorner = Math.round(this.width * CardFront.TEXT_TOP_LEFT_RATIO)
        this.bottomRightText.x = this.width - relativeToCorner
        this.bottomRightText.y = this.height - relativeToCorner
    }
}
