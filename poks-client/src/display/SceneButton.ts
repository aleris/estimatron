import { Container, Shadow, Shape, Text } from '@createjs/easeljs'
import { RefreshLayout } from '@/display/RefreshLayout'
import { SceneConstants } from '@/display/SceneConstants'
import { SceneLayout } from '@/display/SceneLayout'

export class SceneButton extends Container implements RefreshLayout {
    private static readonly WIDTH_TEXT_REPORT = 0.22
    private static readonly MARGIN_REPORT = 0.2
    private static readonly WIDTH_REPORT = 0.07
    private static readonly HEIGHT_REPORT = 0.15
    private static readonly MIN_WIDTH = 60

    private readonly background: Shape
    private backgroundFill: any
    private readonly backgroundShadow: Shadow
    private readonly textDisplay: any

    public disabled = false

    constructor(
        public readonly sceneLayout: SceneLayout,
        public readonly text: string,
        public readonly flipH: boolean,
        public readonly backgroundColor: string,
        public readonly backgroundRolloverColor: string
    ) {
        super()

        this.background = new Shape()
        this.addChild(this.background)
        this.background.addEventListener('mouseover', () => this.rollover())
        this.background.addEventListener('mouseout', () => this.rollout())
        this.background.addEventListener('mousedown', () => this.mousedown(), false)
        this.background.addEventListener('pressup', () => this.pressup(), false)

        this.backgroundShadow = new Shadow(
            SceneConstants.SHADOW_COLOR,
            SceneConstants.SHADOW_OFFSET,
            SceneConstants.SHADOW_OFFSET,
            SceneConstants.SHADOW_BLUR
        )
        this.background.shadow = this.backgroundShadow

        this.textDisplay = new Text(text)
        this.textDisplay.color = SceneConstants.BUTTON_TEXT_COLOR
        this.textDisplay.textAlign = 'center'
        this.textDisplay.textBaseline = 'middle'
        this.textDisplay.mouseEnabled = false
        this.addChild(this.textDisplay)
    }

    rollover() {
        if (!this.disabled) {
            this.backgroundFill.style = this.backgroundRolloverColor
        }
    }

    rollout() {
        if (!this.disabled) {
            this.backgroundFill.style = this.backgroundColor
        }
    }

    mousedown() {
        if (!this.disabled) {
            this.regX = -SceneConstants.SHADOW_OFFSET
            this.regY = -SceneConstants.SHADOW_OFFSET
            this.setShadowPressed()
        }
    }

    pressup() {
        if (!this.disabled) {
            this.regX = 0
            this.regY = 0
            this.setShadowNormal()
        }
    }

    private setShadowNormal() {
        this.backgroundShadow.offsetX = SceneConstants.SHADOW_OFFSET
        this.backgroundShadow.offsetY = SceneConstants.SHADOW_OFFSET
        this.backgroundShadow.blur = SceneConstants.SHADOW_BLUR
    }

    private setShadowPressed() {
        this.backgroundShadow.offsetX = SceneConstants.SHADOW_PRESSED_OFFSET
        this.backgroundShadow.offsetY = SceneConstants.SHADOW_PRESSED_OFFSET
        this.backgroundShadow.blur = SceneConstants.SHADOW_PRESSED_BLUR
    }

    refreshLayout(): void {
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
        const r = w * SceneButton.MARGIN_REPORT

        const fontSize = this.width * SceneButton.WIDTH_TEXT_REPORT
        this.textDisplay.font = `${fontSize}px "${SceneConstants.TEXT_FONT}"`
        const flipSign = this.flipH ? -1 : 1
        this.textDisplay.rotation = flipSign * 45
        this.textDisplay.y = w / 2
        this.textDisplay.x = h / 2

        this.background.scaleX = flipSign
        if (this.flipH) {
            this.background.regX = this.width
        }
        const backgroundColor = this.disabled ? SceneConstants.BUTTON_BACKGROUND_DISABLED_COLOR : this.backgroundColor
        const g = this.background.graphics
            .clear()
            .beginFill(backgroundColor)

        this.backgroundFill = g.command
        g.moveTo(r, 0)
            .lineTo(w - 4 * r, 0)
            .curveTo(w, 0, w, 4 * r)
            .lineTo(w, h - r)
            .curveTo(w, h, w - r - r / 2, h)
            .lineTo(0, r + r / 2)
            .curveTo(0, 0, r, 0)
            .closePath()
            .endFill()

        if (this.disabled) {
            this.setShadowPressed()
            this.cursor = 'default'
        } else {
            this.setShadowNormal()
            this.cursor = 'pointer'
        }
        this.width = w
        this.height = h
    }
}
