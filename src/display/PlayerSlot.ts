import { Container, Point, Shape, Text } from '@createjs/easeljs'
import { Player } from '../data/Player'
import { RefreshLayout } from './RefreshLayout'
import { CardConstants } from './CardConstants'

export class PlayerSlot extends Container implements RefreshLayout {
    private static readonly BACKGROUND_COLOR = '#007299'
    private static readonly TEXT_COLOR = '#424242'
    private static readonly TEXT_FONT = 'Dosis'
    private static readonly TEXT_FONT_REPORT = 0.15
    private static readonly TEXT_BOTTOM_MARGIN_REPORT = 0.025

    private readonly background: Shape
    private readonly nameText: any

    constructor(public readonly player: Player) {
        super()

        this.background = new Shape()
        this.addChild(this.background)

        this.nameText = new Text()
        this.nameText.textAlign = 'center'
        this.nameText.color = PlayerSlot.TEXT_COLOR
        this.addChild(this.nameText)

        // this.addChild(new DebugPointDisplay(0, 0))
    }

    refreshLayout(): void {
        this.center = new Point(Math.round(this.width / 2), Math.round(this.height / 2))
        this.regX = this.center.x
        const approximateTextHeight = this.getFontSize()
        this.regY = this.height

        this.refreshLayoutBackground()
        this.refreshLayoutNameText()

        // this.addChild(new DebugPointDisplay(this.center.x, this.center.y))
        // console.log(this.center.x, this.center.y)
        // this.addChild(new DebugPointDisplay(this.center.x, this.center.y))
        // console.log(this.width, this.height)
        // this.addChild(new DebugPointDisplay(this.width - 10, this.height - 10))
    }

    private refreshLayoutBackground() {
        const rectRadius = Math.floor(this.width * CardConstants.BACKGROUND_RADIUS_REPORT)
        this.background.graphics
            .beginFill(PlayerSlot.BACKGROUND_COLOR)
            .drawRoundRect(0, 0, this.width, this.height, rectRadius)
            .endFill()
    }

    private refreshLayoutNameText() {
        const fontSize = this.getFontSize()
        const font = `${fontSize}px '${PlayerSlot.TEXT_FONT}'`
        this.nameText.text = this.player.name
        this.nameText.font = font
        this.nameText.x = this.width / 2
        this.nameText.y = this.height + this.height * PlayerSlot.TEXT_BOTTOM_MARGIN_REPORT
    }

    private getFontSize() {
        return Math.round(this.width * PlayerSlot.TEXT_FONT_REPORT)
    }
}
