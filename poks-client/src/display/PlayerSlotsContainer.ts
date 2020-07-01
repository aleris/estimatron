import { RefreshLayout } from '@/display/RefreshLayout'
import { SceneLayout } from '@/display/SceneLayout'
import { PlayerSlot } from '@/display/PlayerSlot'
import { SceneConstants } from '@/display/SceneConstants'
import { SessionTable } from '@/data/SessionTable'
import { PlayerInfo } from '@server/model/PlayerInfo'
import { Container } from '@/createjs'

export class PlayerSlotsContainer extends Container implements RefreshLayout {
    private static readonly MARGIN_REPORT = 0.15

    private readonly playerSlotMap = new Map<string, PlayerSlot>()

    constructor(
        private readonly sceneLayout: SceneLayout,
        private readonly sessionTable: SessionTable
    ) {
        super()
    }

    get playerSlot(): PlayerSlot | undefined {
        const player = this.sessionTable.playerInfo
        if (player === null) {
            console.error('player not set on session table when calling get playerSlot')
            return undefined
        }
        return this.playerSlotMap.get(player.id)
    }

    refreshLayout(): void {
        const players = this.sessionTable.players
        if (!players) {
            console.error('players are not set on session table')
            return
        }
        const margin = Math.round(this.sceneLayout.cardWidth * PlayerSlotsContainer.MARGIN_REPORT)
        const slotsCount = players.length
        const availableWidth = this.sceneLayout.sceneWidth
        const availableHeight = this.sceneLayout.halfSceneHeight
        const availableSlotWidth = availableWidth / (slotsCount + 2)
        const slotWidth = Math.round(
            Math.min(
                Math.min(
                    Math.min(availableSlotWidth, this.sceneLayout.cardWidth),
                    availableHeight / SceneConstants.CARD_SIZE_REPORT
                ),
                this.sceneLayout.cardWidth
            )
        )
        const slotHeight = Math.round(slotWidth * SceneConstants.CARD_SIZE_REPORT)
        const centerX = Math.round((this.sceneLayout.sceneWidth) / 2)
        const top = Math.round(availableHeight / 2 + slotHeight / 2)

        this.playerSlotMap.clear()
        this.removeAllChildren()

        let i = 0
        for (let player of players) {
            const isMe = player.id === this.sessionTable.playerInfo.id
            const slot = new PlayerSlot(player, isMe)

            slot.width = slotWidth
            slot.height = slotHeight

            slot.refreshLayout()

            const sign = (i % 2 === 0) ? -1 : 1
            const halfIndex = Math.ceil(i / 2)
            const adjustOther = i < 1 ? 0 : sign * (slot.width - slot.cardShapeWidth) / 4
            slot.x = centerX + sign * halfIndex * (slot.cardShapeWidth + margin) + adjustOther
            slot.y = top
            this.addChild(slot)

            this.playerSlotMap.set(player.id, slot)

            i++
        }
    }

    getSlotForPlayer(player: PlayerInfo): PlayerSlot | undefined {
        return this.playerSlotMap.get(player.id)
    }
}
