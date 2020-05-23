import { Container } from '@createjs/easeljs'
import { Ease, Tween } from '@createjs/tweenjs'
import { RefreshLayout } from './RefreshLayout'
import { SceneLayout } from './SceneLayout'
import { Table } from '../data/Table'
import { PlayerSlot } from './PlayerSlot'
import { CardConstants } from './CardConstants'
import { Player } from '../data/Player'
import { CardBack } from './CardBack'

export class PlayerSlotsContainer extends Container implements RefreshLayout {
    private static readonly CARD_MARGIN_REPORT = 0.1

    private readonly container: Container
    private readonly slots = new Array<PlayerSlot>()
    private readonly playerSlotMap = new Map<string, PlayerSlot>()
    private readonly betsMap = new Map<string, CardBack>()
    public playerSlot: PlayerSlot

    constructor(private readonly sceneLayout: SceneLayout, private readonly table: Table) {
        super()

        this.container = new Container()
        this.addChild(this.container)
    }

    getSlotForPlayer(player: Player): PlayerSlot {
        return this.playerSlotMap.get(player.id)
    }

    refreshLayout(): void {
        const margin = Math.round(this.sceneLayout.cardWidth * PlayerSlotsContainer.CARD_MARGIN_REPORT)
        const players = this.table.players
        const slotsCount = players.length
        const availableWidth = this.sceneLayout.sceneWidth
        const availableHeight = this.sceneLayout.halfSceneHeight
        const availableSlotWidth = availableWidth / slotsCount + margin
        const slotWidth = Math.round(
            Math.min(
                Math.max(
                    CardConstants.CARD_MIN_WIDTH,
                    Math.max(
                        Math.min(availableSlotWidth, this.sceneLayout.cardWidth),
                        availableHeight / CardConstants.CARD_SIZE_REPORT
                    )
                ),
                this.sceneLayout.cardWidth
            )
        )
        const slotHeight = Math.round(slotWidth * CardConstants.CARD_SIZE_REPORT)
        const centerX = Math.round((this.sceneLayout.sceneWidth) / 2)
        const top = Math.round(availableHeight / 2 + slotHeight / 2)

        this.slots.length = 0
        this.playerSlotMap.clear()
        this.container.removeAllChildren()

        let i = 0
        for (let player of players) {
            const slot = new PlayerSlot(player)

            slot.width = slotWidth
            slot.height = slotHeight

            const sign = (i % 2 === 0) ? -1 : 1
            const halfIndex = Math.ceil(i / 2)
            slot.x = centerX + sign * halfIndex * (slotWidth + margin)
            slot.y = top
            this.container.addChild(slot)
            this.slots.push(slot)
            this.playerSlotMap.set(player.id, slot)

            slot.refreshLayout()

            if (player.id === this.table.me.id) {
                this.playerSlot = slot
                // console.log(this.playerSlot)
            }

           i++
        }
    }

    animateOtherPlayerBet(player: Player) {
        const slot = this.getSlotForPlayer(player)
        const existingCardBack = this.betsMap.get(player.id)
        if (existingCardBack) {
            Tween.get(existingCardBack, { override: true })
                .to(
                    {
                        x: slot.x + 2 * slot.width,
                        y: -this.sceneLayout.cardHeight
                    },
                    700,
                    Ease.quadOut
                )
        }
        const cardBack = new CardBack()
        cardBack.x = slot.x - 2 * slot.width
        cardBack.y = -this.sceneLayout.cardHeight
        cardBack.width = this.sceneLayout.cardWidth
        cardBack.height = this.sceneLayout.cardHeight
        cardBack.refreshLayout()
        this.addChild(cardBack)
        this.betsMap.set(player.id, cardBack)
        Tween.get(cardBack)
            .to(
                {
                    x: slot.x,
                    y: slot.y
                },
                700,
                Ease.quadIn
            )
    }
}
