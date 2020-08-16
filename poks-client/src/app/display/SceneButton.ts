import { SceneConstants } from '@/app/display/SceneConstants'
import { SceneLayout } from '@/app/display/SceneLayout'
import { BaseButton } from '@/app/display/BaseButton'

export class SceneButton extends BaseButton {
    private static readonly WIDTH_TEXT_REPORT = 0.22
    private static readonly WIDTH_REPORT = 0.07
    private static readonly HEIGHT_REPORT = 0.15
    private static readonly MIN_WIDTH = 60
    private static readonly MARGIN_REPORT = 0.2

    constructor(
        public readonly sceneLayout: SceneLayout,
        public readonly text: string,
        public readonly backgroundColor: string,
        public readonly backgroundRolloverColor: string,
        public readonly flipH: boolean
    ) {
        super(sceneLayout, text, backgroundColor, backgroundRolloverColor)
    }

    refreshLayout(): void {
        super.refreshLayout()

        const w = Math.max(
            SceneButton.MIN_WIDTH,
            Math.min(
                this.sceneLayout.sceneWidth * SceneButton.WIDTH_REPORT,
                this.sceneLayout.sceneHeight * SceneButton.HEIGHT_REPORT
            )
        )
        this.width = w
        const h = w
        this.height = h

        const fontSize = this.width * SceneButton.WIDTH_TEXT_REPORT
        this.textDisplay.font = `${fontSize}px "${SceneConstants.TEXT_FONT}"`

        const flipSign = this.flipH ? -1 : 1
        this.textDisplay.rotation = flipSign * 45
        this.textDisplay.y = this.width / 2
        this.textDisplay.x = this.height / 2

        this.background.scaleX = flipSign
        if (this.flipH) {
            this.background.regX = this.width
        }
        const backgroundColor = this.disabled ? SceneConstants.BUTTON_BACKGROUND_DISABLED_COLOR : this.backgroundColor
        const g = this.background.graphics
            .clear()
            .beginFill(backgroundColor)

        const r = this.width * SceneButton.MARGIN_REPORT
        this.backgroundFill = g.command
        g.moveTo(r, 0)
            .lineTo(this.width - 4 * r, 0)
            .curveTo(this.width, 0, this.width, 4 * r)
            .lineTo(this.width, this.height - r)
            .curveTo(this.width, this.height, this.width - r - r / 2, this.height)
            .lineTo(0, r + r / 2)
            .curveTo(0, 0, r, 0)
            .closePath()
            .endFill()
    }
}
