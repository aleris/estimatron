import { Container, Text } from '@/app/createjs'
import { RefreshLayout } from '@/app/display/RefreshLayout'
import { SceneLayout } from '@/app/display/SceneLayout'
import { SessionTable } from '@/app/data/SessionTable'

export class ObserversContainer extends Container implements RefreshLayout {
    private static readonly MARGIN_TOP_LEFT_REPORT = 0.01
    private static readonly VERTICAL_SPACING_REPORT = 0.005
    private static readonly TEXT_COLOR = '#fff'
    private static readonly TEXT_FONT = 'Dosis'
    private static readonly TEXT_FONT_REPORT = 0.009

    constructor(
        private readonly sceneLayout: SceneLayout,
        private readonly sessionTable: SessionTable
    ) {
        super()
    }

    refreshLayout(): void {
        this.removeAllChildren()
        const observers = this.sessionTable.players
            .filter(p => p.observerMode && p.id !== this.sessionTable.playerInfo.id)
        if (observers.length === 0) {
            return
        }

        const fontSize = Math.round(this.sceneLayout.sceneWidth * ObserversContainer.TEXT_FONT_REPORT)
        const font = `300 ${fontSize}px '${ObserversContainer.TEXT_FONT}'`
        const title = new Text('👀  Observers:', font, ObserversContainer.TEXT_COLOR)
        this.addChild(title)
        const verticalSpacing = this.sceneLayout.sceneWidth * ObserversContainer.VERTICAL_SPACING_REPORT
        const titleBounds = title.getBounds()
        let top = title.y + titleBounds.height + verticalSpacing
        let width = titleBounds.width
        for (let observer of observers) {
            const name = new Text(`• ${observer.name}`, font, ObserversContainer.TEXT_COLOR)
            name.y = top
            this.addChild(name)
            const nameBounds = name.getBounds()
            top += nameBounds.height + verticalSpacing
            width = Math.max(width, nameBounds.width)
        }
        this.y = this.sceneLayout.sceneWidth * ObserversContainer.MARGIN_TOP_LEFT_REPORT
        this.x = this.sceneLayout.sceneWidth - width - this.y
    }
}
