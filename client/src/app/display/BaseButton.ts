import { RefreshLayout } from '@/app/display/RefreshLayout'
import { SceneConstants } from '@/app/display/SceneConstants'
import { SceneLayout } from '@/app/display/SceneLayout'
import { Container, Shadow, Shape, Text } from '@/app/createjs'

export abstract class BaseButton extends Container implements RefreshLayout {
    private readonly backgroundShadow: Shadow

    protected readonly background: Shape
    protected backgroundFill: any
    protected readonly textDisplay: Text

    public width: number = 0
    public height: number = 0
    public disabled = false

    constructor(
        public readonly sceneLayout: SceneLayout,
        public readonly text: string,
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
        if (this.disabled) {
            this.setShadowPressed()
            this.cursor = 'default'
        } else {
            this.setShadowNormal()
            this.cursor = 'pointer'
        }
    }
}
