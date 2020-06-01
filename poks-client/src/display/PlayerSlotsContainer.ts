import { Container } from '@createjs/easeljs'
import { Ease, Tween } from '@createjs/tweenjs'
import { BetHelper } from '@server/model/Bet'
import { RefreshLayout } from '@/display/RefreshLayout'
import { SceneLayout } from '@/display/SceneLayout'
import { PlayerSlot } from '@/display/PlayerSlot'
import { SceneConstants } from '@/display/SceneConstants'
import { CardShape } from '@/display/CardShape'
import { SessionTable } from '@/data/SessionTable'
import { PlayerInfo } from '@server/model/PlayerInfo'

export class PlayerSlotsContainer extends Container implements RefreshLayout {
    private static readonly CARD_MARGIN_REPORT = 0.1

    private readonly container: Container
    private readonly slots = new Array<PlayerSlot>()
    private readonly playerSlotMap = new Map<string, PlayerSlot>()
    private readonly betsMap = new Map<string, CardShape>()
    public playerSlot: PlayerSlot | null = null

    constructor(
        private readonly sceneLayout: SceneLayout,
        private readonly sessionTable: SessionTable
    ) {
        super()

        // TODO: useless inner container?
        this.container = new Container()
        this.addChild(this.container)
    }

    refreshLayout(): void {
        const players = this.sessionTable.players
        if (!players) {
            console.error('players must be set')
            return
        }
        const margin = Math.round(this.sceneLayout.cardWidth * PlayerSlotsContainer.CARD_MARGIN_REPORT)
        const slotsCount = players.length
        const availableWidth = this.sceneLayout.sceneWidth
        const availableHeight = this.sceneLayout.halfSceneHeight
        const availableSlotWidth = availableWidth / slotsCount + margin
        const slotWidth = Math.round(
            Math.min(
                Math.max(
                    SceneConstants.CARD_MIN_WIDTH,
                    Math.max(
                        Math.min(availableSlotWidth, this.sceneLayout.cardWidth),
                        availableHeight / SceneConstants.CARD_SIZE_REPORT
                    )
                ),
                this.sceneLayout.cardWidth
            )
        )
        const slotHeight = Math.round(slotWidth * SceneConstants.CARD_SIZE_REPORT)
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

            if (player.id === this.sessionTable.player?.id) {
                this.playerSlot = slot
                // console.log(this.playerSlot)
            } else {
                // when refreshing page, the state can already contain bets
                if (BetHelper.hasEstimation(player.bet)) {
                    this.createOtherPlayerBet(player, false)
                }
            }

            i++
        }
    }

    createOtherPlayerBet(player: PlayerInfo, animate: boolean) {
        const slot = this.getSlotForPlayer(player)
        if (!slot) {
            console.warn(`player ${player.id} no longer on table ${this.sessionTable.tableInfo?.id}`)
            return
        }
        const existingCardBack = this.betsMap.get(player.id)
        if (existingCardBack) {
            const existingDest = { x: slot.x + 2 * slot.width, y: -this.sceneLayout.cardHeight }
            if (animate) {
                Tween.get(existingCardBack, {override: true})
                    .to(
                        existingDest,
                        700,
                        Ease.quadOut
                    )
                    .call(() => this.removeChild(existingCardBack))
            } else {
                existingCardBack.x = existingDest.x
                existingCardBack.y = existingDest.y
            }
        }

        if (!BetHelper.hasEstimation(player.bet)) {
            return
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

        const dest = {x: slot.x, y: slot.y, rotation: 0}
        if (animate) {
            Tween.get(cardShape)
                .to(
                    dest,
                    700,
                    Ease.quadIn
                )
        } else {
            cardShape.x = dest.x
            cardShape.y = dest.y
            cardShape.rotation = dest.rotation
        }
    }

    revealBets() {
        for (let player of this.sessionTable.players) {
            const betCard = this.betsMap.get(player.id)
            if (betCard !== undefined) {
                betCard.text = player.bet.estimation
                betCard.refreshLayout()
            }
        }
        for (let card of this.betsMap.values()) {
            card.animateFlip()
        }
    }

    placeCardOnPlayerSlot(card: CardShape, player: PlayerInfo) {
        const slot = this.getSlotForPlayer(player)
        if (card !== undefined && slot !== undefined) {
            card.x = slot.x
            card.y = slot.y
            card.rotation = 0
        } else {
            console.error(`slot for player ${player.id} (${player.name}) not set on refresh layout`)
        }
    }

    private getSlotForPlayer(player: PlayerInfo): PlayerSlot | undefined {
        return this.playerSlotMap.get(player.id)
    }
}
