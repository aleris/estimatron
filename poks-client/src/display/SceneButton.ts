import { Container, Shadow, Shape, Text } from '@createjs/easeljs'
import { RefreshLayout } from '@/display/RefreshLayout'
import { CardConstants } from '@/display/CardConstants'
import { SceneLayout } from '@/display/SceneLayout'

export class SceneButton extends Container implements RefreshLayout {
    private static readonly BACKGROUND_COLOR = '#F39C12'
    private static readonly BACKGROUND_COLOR_ROLLOVER = '#F5B041'
    private static readonly WIDTH_TEXT_REPORT = 0.22
    private static readonly TEXT_FONT = 'Dosis'
    private static readonly COLOR = '#424242'
    private static readonly MARGIN_REPORT = 0.2
    private static readonly WIDTH_REPORT = 0.08
    private static readonly MIN_WIDTH = 50

    private readonly background: Shape
    private backgroundFill: any
    private readonly backgroundShadow: Shadow
    private readonly textDisplay: any
    // private readonly textDisplay: TextArc
    constructor(
        public readonly sceneLayout: SceneLayout,
        public readonly text: string,
        public readonly flipH: boolean
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

        this.textDisplay = new Text(text)
        this.textDisplay.color = SceneButton.COLOR
        this.textDisplay.textAlign = 'center'
        this.textDisplay.textBaseline = 'middle'
        this.addChild(this.textDisplay)

        this.cursor = 'pointer'

        this.addEventListener('rollover', () => this.rollover())
        this.addEventListener('rollout', () => this.rollout())
        this.addEventListener('mousedown', () => this.mousedown())
        this.addEventListener('pressup', () => this.pressup())

        // this.textDisplay = new TextArc(text, `3rem "${SceneButton.TEXT_FONT}"`, SceneButton.COLOR)
        // this.addChild(this.textDisplay)
    }

    rollover() {
        this.backgroundFill.style = SceneButton.BACKGROUND_COLOR_ROLLOVER
    }

    rollout() {
        this.backgroundFill.style = SceneButton.BACKGROUND_COLOR
    }

    mousedown() {
        this.regX = -CardConstants.SHADOW_OFFSET
        this.regY = -CardConstants.SHADOW_OFFSET
        this.backgroundShadow.offsetX = 0
        this.backgroundShadow.offsetY = 0
        this.backgroundShadow.blur = 0
    }

    pressup() {
        this.regX = 0
        this.regY = 0
        this.backgroundShadow.offsetX = CardConstants.SHADOW_OFFSET
        this.backgroundShadow.offsetY = CardConstants.SHADOW_OFFSET
        this.backgroundShadow.blur = CardConstants.SHADOW_BLUR
    }

    refreshLayout(): void {
        const w = Math.max(SceneButton.MIN_WIDTH, this.sceneLayout.sceneWidth * SceneButton.WIDTH_REPORT)
        this.width = w
        const h = w
        this.height = h
        const r = w * SceneButton.MARGIN_REPORT

        const fontSize = this.width * SceneButton.WIDTH_TEXT_REPORT
        this.textDisplay.font = `${fontSize}px "${SceneButton.TEXT_FONT}"`
        const flipSign = this.flipH ? -1 : 1
        this.textDisplay.rotation = flipSign * 45
        this.textDisplay.y = w / 2
        this.textDisplay.x = h / 2

        this.background.scaleX = flipSign
        if (this.flipH) {
            this.background.regX = this.width
        }
        const g = this.background.graphics
            .clear()
            .beginFill(SceneButton.BACKGROUND_COLOR)

        this.backgroundFill = g.command
        g.moveTo(r, 0)
            .lineTo(w - 4 * r, 0)
            .curveTo(w, 0, w, 4 * r)
            .lineTo(w, h - r)
            .curveTo(w, h, w - r - r / 2, h)
            // .curveTo(w, h, w - r, h)
            // .curveTo(w - r - r / 2, h, w - r - r / 2, h - r / 2)
            .lineTo(0, r + r / 2)
            // .curveTo(0, r + r / 2, 0, r)
            .curveTo(0, 0, r, 0)
            .closePath()
            .endFill()

        this.width = w
        this.height = h
    }
}
