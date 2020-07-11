import { SceneConstants } from '@/app/display/SceneConstants'

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
                SceneConstants.CARD_MIN_WIDTH,
                Math.min(this.sceneWidth, this.sceneHeight) * SceneConstants.CARD_SCENE_REPORT
            )
        )
    }

    get cardHeight(): number {
        return Math.round(this.cardWidth * SceneConstants.CARD_SIZE_REPORT)
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
