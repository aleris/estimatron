import { Container, Point, Shadow, Shape } from '@createjs/easeljs'
import { Ease, Tween } from '@createjs/tweenjs'
import { RefreshLayout } from '@/display/RefreshLayout'
import { SceneConstants } from '@/display/SceneConstants'
import { PositionAndRotation } from '@/display/PositionAndRotation'
import { CardFront } from '@/display/CardFront'
import { CardBack } from '@/display/CardBack'
import { estimation } from '@server/model/Bet'
import { BetHelper } from '@server/model/Bet'

export enum CardSide {
    Front,
    Back
}

export class CardShape extends Container implements RefreshLayout {
    public static readonly CARD_RISE_TIME = 80
    public static readonly CARD_LOWER_TIME = 240

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
        public readonly handZIndex: number | null = null
    ) {
        super()

        this.background = new Shape()
        this.addChild(this.background)

        this.backgroundShadow = new Shadow(
            SceneConstants.SHADOW_COLOR,
            SceneConstants.SHADOW_OFFSET,
            SceneConstants.SHADOW_OFFSET,
            SceneConstants.SHADOW_BLUR
        )
        this.background.shadow = this.backgroundShadow

        this.cardFront = new CardFront(text)
        this.cardBack = new CardBack()
        this.switchFrontBackForText()
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

    switchFrontBackForText() {
        if (BetHelper.isHidden(this.text)) {
            this.showBack()
        } else {
            this.showFront()
        }
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

        this.switchFrontBackForText()
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

    public raise() {
        this.parent.setChildIndex(this, this.parent.numChildren - 1)
        Tween.get(this.backgroundShadow, { override: true })
            .to(
                {
                    offsetX: SceneConstants.SHADOW_OVER_OFFSET,
                    offsetY: SceneConstants.SHADOW_OVER_OFFSET,
                    blur: SceneConstants.SHADOW_OVER_BLUR
                },
                CardShape.CARD_RISE_TIME,
                Ease.quadOut
            )
    }

    public lower() {
        if (null !== this.handZIndex) {
            this.parent.setChildIndex(this, this.handZIndex)
        } else {
            console.error('hand z-index is null on lower')
        }
        Tween.get(this.backgroundShadow, { override: true })
            .to(
                {
                    offsetX: SceneConstants.SHADOW_OFFSET,
                    offsetY: SceneConstants.SHADOW_OFFSET,
                    blur: SceneConstants.SHADOW_BLUR
                },
                CardShape.CARD_LOWER_TIME,
                Ease.quadIn
            )
    }

    grab(pos: Point) {
        this.cardFront.cursor = 'grabbing'
        this.forceUpdateCursor()
        console.log('grab getChildIndex', this.parent.getChildIndex(this), this.parent.numChildren)
        this.parent.setChildIndex(this, this.parent.numChildren - 1)
        this.dragOffset = new Point(this.x - pos.x, this.y - pos.y)
        Tween.get(this, { override: true }).to({
                regX: this.dragOffset.x + this.center.x,
                regY: this.dragOffset.y + this.center.y,
                rotation: 0
            },
            500,
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
            CardShape.CARD_LOWER_TIME,
            Ease.quadOut
        )
        this.lower()
    }

    // see https://github.com/CreateJS/EaselJS/issues/861
    private forceUpdateCursor() {
        this.stage._testMouseOver(true)
    }
}
