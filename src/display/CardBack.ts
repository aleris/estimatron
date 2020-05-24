import { Container, Shape } from '@createjs/easeljs'
import { RefreshLayout } from './RefreshLayout'
import { CardConstants } from './CardConstants'

export class CardBack extends Container implements RefreshLayout {
    private static readonly COLOR = '#c1dae8'

    private readonly background: Shape
    private readonly color: Shape

    constructor() {
        super()

        this.background = new Shape()
        this.addChild(this.background)

        this.color = new Shape()
        this.addChild(this.color)
    }

    refreshLayout() {
        this.refreshLayoutBackground()
    }

    private refreshLayoutBackground() {
        const bgRadius = Math.round(this.width * CardConstants.BACKGROUND_RADIUS_REPORT)

        this.background.graphics
            .clear()
            .beginFill(CardConstants.BACKGROUND_COLOR)
            .drawRoundRect(0, 0, this.width, this.height, bgRadius)
            .endFill()

        const margin = Math.round(this.width * 0.05)

        const line1Radius = bgRadius / 1.2

        const line1Margin = margin * 1.8
        const line2Radius = line1Radius / 1.8

        const line2Margin = line1Margin * 1.2
        const line3Radius = line2Radius / 1.8

        const line3Margin = line1Margin * 2
        const line4Margin = line3Margin + Math.min(1, margin * 0.2)
        const line5Margin = line4Margin + Math.min(4, margin * 0.8)

        const line6Margin = line5Margin + Math.min(1, margin * 0.2)

        this.color.graphics
            .clear()
            .beginFill(CardBack.COLOR)
            .drawRoundRect(margin, margin, this.width - 2 * margin, this.height - 2 * margin, line1Radius)
            .endFill()
            .beginFill(CardConstants.BACKGROUND_COLOR)
            .drawRoundRect(line1Margin, line1Margin, this.width - 2 * line1Margin, this.height - 2 * line1Margin, line2Radius)
            .endFill()
            .beginFill(CardBack.COLOR)
            .drawRoundRect(line2Margin, line2Margin, this.width - 2 * line2Margin, this.height - 2 * line2Margin, line3Radius)
            .endFill()
            .beginFill(CardConstants.BACKGROUND_COLOR)
            .drawRect(line3Margin, line3Margin, this.width - 2 * line3Margin, this.height - 2 * line3Margin)
            .endFill()
            .beginFill(CardBack.COLOR)
            .drawRect(line4Margin, line4Margin, this.width - 2 * line4Margin, this.height - 2 * line4Margin)
            .endFill()
            .beginFill(CardConstants.BACKGROUND_COLOR)
            .drawRect(line5Margin, line5Margin, this.width - 2 * line5Margin, this.height - 2 * line5Margin)
            .endFill()
            .beginFill(CardBack.COLOR)
            .drawRect(line6Margin, line6Margin, this.width - 2 * line6Margin, this.height - 2 * line6Margin)
            .endFill()
    }
}
