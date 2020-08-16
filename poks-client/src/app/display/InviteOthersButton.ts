import { SceneConstants } from '@/app/display/SceneConstants'
import { SceneLayout } from '@/app/display/SceneLayout'
import { BaseButton } from '@/app/display/BaseButton'

export class InviteOthersButton extends BaseButton {
    private static readonly WIDTH_TEXT_REPORT = 0.11
    private static readonly MARGIN_REPORT = 2

    constructor(
        public readonly sceneLayout: SceneLayout,
        public readonly text: string,
        public readonly backgroundColor: string,
        public readonly backgroundRolloverColor: string
    ) {
        super(sceneLayout, text, backgroundColor, backgroundRolloverColor)
    }

    refreshLayout(): void {
        super.refreshLayout()

        const fontSize = this.sceneLayout.cardWidth * InviteOthersButton.WIDTH_TEXT_REPORT
        this.textDisplay.font = `${fontSize}px "${SceneConstants.TEXT_FONT}"`
        this.textDisplay.lineHeight = fontSize
        this.textDisplay.textBaseline = 'bottom'
        const textBounds = this.textDisplay.getBounds()
        this.width = textBounds.width * InviteOthersButton.MARGIN_REPORT
        this.height = textBounds.height * InviteOthersButton.MARGIN_REPORT
        this.background.regX  = this.width / 2
        this.background.regY = this.height / 2

        const g = this.background.graphics
            .clear()
            .beginFill(this.backgroundColor)

        const r = this.height / 1.8
        this.backgroundFill = g.command
        g.moveTo(r, 0)
            .lineTo(this.width - r, 0)
            .curveTo(this.width, this.height / 2, this.width - r, this.height)
            .lineTo(r, this.height)
            .curveTo(0, this.height / 2, r, 0)
            .closePath()
            .endFill()

    }
}
