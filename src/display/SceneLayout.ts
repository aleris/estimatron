import { CardConstants } from './CardConstants'

export class SceneLayout {
    public sceneWidth: number
    public sceneHeight: number

    constructor(public readonly canvas: HTMLCanvasElement) {
        this.sceneWidth = canvas.width
        this.sceneHeight = canvas.height
    }

    get cardWidth(): number {
        return Math.round(
            Math.max(
                CardConstants.CARD_MIN_WIDTH,
                Math.min(this.sceneWidth, this.sceneHeight) * CardConstants.CARD_SCENE_REPORT
            )
        )
    }

    get cardHeight(): number {
        return Math.round(this.cardWidth * CardConstants.CARD_SIZE_REPORT)
    }

    get halfCardWidth(): number {
        return Math.round(this.cardWidth / 2)
    }

    get halfCardHeight(): number {
        return Math.round(this.cardHeight / 2)
    }

    get halfSceneWidth(): number {
        return Math.round(this.sceneWidth / 2)
    }

    get halfSceneHeight(): number {
        return Math.round(this.sceneHeight / 2)
    }

    updateDimensionsFromWindow() {
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight

        this.sceneWidth = this.canvas.width
        this.sceneHeight = this.canvas.height
    }
}
