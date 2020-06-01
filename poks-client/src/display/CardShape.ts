import { Container, Point, Shadow, Shape } from '@createjs/easeljs'
import { Ease, Tween } from '@createjs/tweenjs'
import { RefreshLayout } from '@/display/RefreshLayout'
import { CardConstants } from '@/display/CardConstants'
import { PositionAndRotation } from '@/display/PositionAndRotation'
import { CardFront } from '@/display/CardFront'
import { CardBack } from '@/display/CardBack'
import { estimation } from '@server/model/Bet'

export enum CardSide {
    Front,
    Back
}

export class CardShape extends Container implements RefreshLayout {

    private readonly background: Shape

    private readonly backgroundShadow: Shadow

    private dragOffset: Point

    public handPosition: PositionAndRotation | null = null

    private readonly cardFront: CardFront
    private readonly cardBack: CardBack

    public center: Point
    public side = CardSide.Front

    constructor(
        public text: estimation,
        public readonly handZIndex = 0
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

        this.cardFront = new CardFront(text)
        this.cardBack = new CardBack()
        this.showFront()
    }

    showFront() {
        this.removeChild(this.cardBack)
        this.addChild(this.cardFront)
        this.side = CardSide.Front
    }

    showBack() {
        this.removeChild(this.cardFront)
        this.addChild(this.cardBack)
        this.side = CardSide.Back
    }

    flip() {
        if (this.side === CardSide.Back) {
            this.showFront()
        } else {
            this.showBack()
        }
    }

    animateFlip() {
        Tween.get(this, { override: true })
            .to(
                {
                    skewY: 90
                },
                300,
                Ease.cubicIn
            )
            .call(() => this.flip())
            .to(
                {
                    skewY: 0
                },
                300,
                Ease.cubicOut
            )
    }

    refreshLayout() {
        this.center = new Point(Math.round(this.width / 2), Math.round(this.height / 2))

        this.regX = this.center.x
        this.regY = this.height // this.center.y

        this.refreshLayoutBackground()

        this.cardFront.text = this.text
        this.cardFront.width = this.width
        this.cardFront.height = this.height
        this.cardFront.refreshLayout()

        this.cardBack.width = this.width
        this.cardBack.height = this.height
        this.cardBack.refreshLayout()

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

    public raise() {
        this.parent.setChildIndex(this, this.parent.numChildren - 1)
        Tween.get(this.backgroundShadow, { override: true })
            .to(
                {
                    offsetX: CardConstants.SHADOW_OVER_OFFSET,
                    offsetY: CardConstants.SHADOW_OVER_OFFSET,
                    blur: CardConstants.SHADOW_OVER_BLUR
                },
                CardShape.RISE_TIME,
                Ease.quadOut
            )
    }

    public lower() {
        this.parent.setChildIndex(this, this.handZIndex)
        Tween.get(this.backgroundShadow, { override: true })
            .to(
                {
                    offsetX: CardConstants.SHADOW_OFFSET,
                    offsetY: CardConstants.SHADOW_OFFSET,
                    blur: CardConstants.SHADOW_BLUR
                },
                CardConstants.LOWER_TIME,
                Ease.quadIn
            )
    }

    grab(pos: Point) {
        this.cardFront.cursor = 'grabbing'
        this.forceUpdateCursor()
        this.parent.setChildIndex(this, this.parent.numChildren - 1)
        this.dragOffset = new Point(this.x - pos.x, this.y - pos.y)
        Tween.get(this, { override: true }).to({
                regX: this.dragOffset.x + this.center.x,
                regY: this.dragOffset.y + this.center.y,
                rotation: 0
            },
            CardConstants.GRAB_ROTATE_TIME,
            Ease.quadOut
        )
        this.raise()
    }

    drag(pos: Point) {
        this.x = pos.x + this.dragOffset.x
        this.y = pos.y + this.dragOffset.y
    }

    dropTo(pos: PositionAndRotation) {
        this.cardFront.cursor = 'grab'
        this.forceUpdateCursor()
        Tween.get(this, { override: true }).to(
            {
                ...pos,
                regX: this.center.x,
                regY: this.height
            },
            CardConstants.LOWER_TIME,
            Ease.quadOut
        )
        this.lower()
    }

    // see https://github.com/CreateJS/EaselJS/issues/861
    private forceUpdateCursor() {
        this.stage._testMouseOver(true)
    }
}
