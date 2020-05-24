import { Container } from '@createjs/easeljs'
import { Ease, Tween } from '@createjs/tweenjs'
import { RefreshLayout } from './RefreshLayout'
import { SceneLayout } from './SceneLayout'
import { PlayerSlot } from './PlayerSlot'
import { CardConstants } from './CardConstants'
import { Player } from '../data/Player'
import { CardShape } from './CardShape'
import { SessionTable } from '../data/SessionTable'

export class PlayerSlotsContainer extends Container implements RefreshLayout {
    private static readonly CARD_MARGIN_REPORT = 0.1

    private readonly container: Container
    private readonly slots = new Array<PlayerSlot>()
    private readonly playerSlotMap = new Map<string, PlayerSlot>()
    private readonly betsMap = new Map<string, CardShape>()
    public playerSlot: PlayerSlot | null = null

    constructor(private readonly sceneLayout: SceneLayout, private readonly sessionTable: SessionTable) {
        super()

        // TODO: useless inner container?
        this.container = new Container()
        this.addChild(this.container)
    }

    getSlotForPlayer(player: Player): PlayerSlot | undefined {
        return this.playerSlotMap.get(player.id)
    }

    refreshLayout(): void {
        if (!this.sessionTable.table) {
            console.error('table not initialized')
            return
        }
        const margin = Math.round(this.sceneLayout.cardWidth * PlayerSlotsContainer.CARD_MARGIN_REPORT)
        const players = this.sessionTable.table.players
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

            if (player.id === this.sessionTable.table.me.id) {
                this.playerSlot = slot
                // console.log(this.playerSlot)
            }

           i++
        }
    }

    animateOtherPlayerBet(player: Player) {
        const slot = this.getSlotForPlayer(player)
        if (!slot) {
            console.warn(`player ${player.id} no longer on table ${this.sessionTable.table?.id}`)
            return
        }
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
                .call(() => this.removeChild(existingCardBack))
        }
        const cardShape = new CardShape(player.bet.estimation)
        cardShape.x = slot.x - 2 * slot.width
        cardShape.y = -this.sceneLayout.cardHeight
        cardShape.width = this.sceneLayout.cardWidth
        cardShape.height = this.sceneLayout.cardHeight
        cardShape.rotation = -90
        cardShape.showBack()
        cardShape.refreshLayout()
        this.addChild(cardShape)
        this.betsMap.set(player.id, cardShape)
        Tween.get(cardShape)
            .to(
                {
                    x: slot.x,
                    y: slot.y,
                    rotation: 0
                },
                700,
                Ease.quadIn
            )
    }

    revealBets() {
        for (let card of this.betsMap.values()) {
            card.animateFlip()
        }
    }
}
