import { Container, Point, Shape, Text } from '@createjs/easeljs'
import { RefreshLayout } from '@/display/RefreshLayout'
import { CardConstants } from '@/display/CardConstants'
import { PlayerInfo } from '@server/model/PlayerInfo'

export class PlayerSlot extends Container implements RefreshLayout {
    private static readonly BACKGROUND_COLOR = '#007299'
    private static readonly TEXT_COLOR = '#424242'
    private static readonly TEXT_FONT = 'Dosis'
    private static readonly TEXT_FONT_REPORT = 0.15
    private static readonly TEXT_BOTTOM_MARGIN_REPORT = 0.025

    private readonly background: Shape
    private readonly nameText: any
    private readonly strikethroughShape: Shape

    constructor(public readonly playerInfo: PlayerInfo) {
        super()

        this.background = new Shape()
        this.addChild(this.background)

        this.nameText = new Text()
        this.nameText.textAlign = 'center'
        this.nameText.textBaseline = 'middle'
        this.nameText.color = PlayerSlot.TEXT_COLOR
        this.addChild(this.nameText)

        this.strikethroughShape = new Shape()
        this.addChild(this.strikethroughShape)

        // this.addChild(new DebugPointDisplay(0, 0))
    }

    refreshLayout(): void {
        this.center = new Point(Math.round(this.width / 2), Math.round(this.height / 2))
        this.regX = this.center.x
        this.regY = this.height

        this.refreshLayoutBackground()
        this.refreshLayoutNameText()
        this.refreshStrikethroughShape()

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
        this.nameText.text = this.playerInfo.name
        this.nameText.font = font
        const textBounds = this.nameText.getBounds()
        this.nameText.x = this.width / 2
        this.nameText.y = this.height + this.height * PlayerSlot.TEXT_BOTTOM_MARGIN_REPORT + textBounds.height / 2
    }

    private refreshStrikethroughShape() {
        const g = this.strikethroughShape.graphics.clear()
        if (this.playerInfo.gone) {
            const textBounds = this.nameText.getBounds()
            const y = this.nameText.y
            g
                .beginStroke('red')
                .setStrokeStyle(2)
                .moveTo(this.nameText.x - textBounds.width / 2, y)
                .lineTo(this.nameText.x + textBounds.width / 2, y)
                .endStroke()
        }
    }

    private getFontSize() {
        return Math.round(this.width * PlayerSlot.TEXT_FONT_REPORT)
    }
}
