import { id } from '@server/model/id'
import { DeckKind, DeckRepository } from '@server/model/Decks'
import { BetHelper } from '@server/model/Bet'
import { Bet } from '@server/model/Bet'
import { PlayerInfo } from '@server/model/PlayerInfo'
import { SceneLayout } from '@/app/display/SceneLayout'
import { RefreshLayout } from '@/app/display/RefreshLayout'
import { PositionAndRotation } from '@/app/display/PositionAndRotation'
import { CardShape } from '@/app/display/CardShape'
import { SessionTable } from '@/app/data/SessionTable'
import { PlayerSlotsContainer } from '@/app/display/PlayerSlotsContainer'
import { Container, Ease, Point, Tween } from '@/app/createjs'

export class HandOfCardsContainer extends Container implements RefreshLayout {
    public onChangeMyBet: (bet: Bet) => void = () => {}

    private static readonly START_ANGLE = -Math.PI / 2 - Math.PI / 8
    private static readonly ANGLE_SPREAD = Math.PI / 4

    private deckKind = DeckRepository.defaultDeckKind
    private readonly cards = new Array<CardShape>()
    private readonly betsByPlayerIdMap = new Map<id, CardShape>()

    public width: number = 0
    public height: number = 0
    private betCard: CardShape | null = null
    private draggedCardStart: Point | null = null
    private grabbedCard: CardShape | null = null

    constructor(
        private readonly sceneLayout: SceneLayout,
        private readonly sessionTable: SessionTable,
        private readonly playerSlotsContainer: PlayerSlotsContainer
    ) {
        super()
        this.updateCardsFromDeck(this.deckKind)
    }

    refreshLayout(): void {
        this.placeOtherPlayerCards()

        this.placeMyCards()

        this.placeMyBetCardOnPlayerSlot()
    }

    revealBets() {
        const playerCount = this.sessionTable.players.length
        const maxDelayTime = Math.min(500, 100 * playerCount)
        for (let player of this.sessionTable.players) {
            const betCard = this.betsByPlayerIdMap.get(player.id)
            if (betCard !== undefined) {
                const shouldFlip = betCard.text !== player.bet.estimation
                betCard.text = player.bet.estimation
                betCard.refreshLayout()
                if (shouldFlip) {
                    setTimeout(() => {
                        betCard.animateFlip()
                    }, Math.floor(Math.random() * maxDelayTime))
                }
            }
        }
    }

    resetBets() {
        const playerCount = this.sessionTable.players.length
        const maxDelayTime = Math.min(500, 100 * playerCount)
        for (let player of this.sessionTable.players) {
            const betCard = this.betsByPlayerIdMap.get(player.id)
            if (betCard !== undefined) {
                setTimeout(() => {
                    this.removeBetForOtherPlayer(player, true)
                }, Math.floor(Math.random() * maxDelayTime))
            }
        }

        setTimeout(() => {
            if (this.betCard !== null) {
                if (null !== this.betCard.handPosition) {
                    this.betCard.dropTo(this.betCard.handPosition)
                    this.betCard = null
                }
            }
        }, Math.floor(Math.random() * maxDelayTime))
    }

    updateCardsFromDeck(deckKind: DeckKind) {
        this.deckKind = deckKind
        const deck = DeckRepository.of(this.deckKind)
        const texts = deck.texts
        this.removeAllChildren()
        this.cards.length = 0
        this.betCard = null
        for (let i = 0; i !== texts.length; i++) {
            const estimation = texts[i]
            const cardShape = new CardShape(estimation, i)
            this.cards.push(cardShape)
            this.addChild(cardShape)
            this.addCardEvents(cardShape)
        }
    }

    createCardForOtherPlayer(player: PlayerInfo, animate: boolean) {
        this.removeBetForOtherPlayer(player, animate)

        if (!BetHelper.hasEstimation(player.bet)) {
            return
        }

        const slot = this.playerSlotsContainer.getSlotForPlayer(player)
        if (!slot) {
            console.warn(`player ${player.id} no longer on table ${this.sessionTable.tableInfo?.id}`)
            return
        }

        const cardShape = new CardShape(player.bet.estimation)
        cardShape.width = slot.cardShapeWidth
        cardShape.height = slot.cardShapeHeight
        // cardShape.x = slot.x - 2 * cardShape.width
        // cardShape.y = -cardShape.height
        cardShape.rotation = -90
        cardShape.refreshLayout()
        cardShape.switchFrontBackForText()
        this.addChild(cardShape)
        this.betsByPlayerIdMap.set(player.id, cardShape)

        const dest = { x: slot.centerOfCardShape.x, y: slot.centerOfCardShape.y, rotation: 0 }
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

    private addCardEvents(cardShape: CardShape) {
        cardShape.addEventListener(
            'mousedown',
            (event: any) => this.grab(cardShape, new Point(event.stageX, event.stageY))
        )
        cardShape.addEventListener(
            'pressmove',
            (event: any) => this.drag(cardShape, new Point(event.stageX, event.stageY))
        )
        cardShape.addEventListener(
            'pressup',
            (event: any) => this.drop(cardShape, new Point(event.stageX, event.stageY))
        )
    }

    public updateDeckCardsIfChanged() {
        const tableInfo = this.sessionTable.tableInfo
        if (tableInfo !== null) {
            if (this.deckKind !== tableInfo.deckKind) {
                this.updateCardsFromDeck(tableInfo.deckKind)
                this.placeMyCards()
            }
        }
    }

    private acceptDropToSlot(pos: Point): boolean {
        return pos.y < this.sceneLayout.sceneHeight / 2
    }

    private placeMyCards() {
        const radius = this.sceneLayout.sceneWidth / 3
        const offsetX = this.sceneLayout.halfSceneWidth
        const offsetY = this.sceneLayout.sceneHeight
            + radius
            + this.sceneLayout.cardHeight
            - this.calculateFilledHandOfCardsHeight(this.sceneLayout, radius)
        let angle = HandOfCardsContainer.START_ANGLE
        let angleIncrement = HandOfCardsContainer.ANGLE_SPREAD / (this.cards.length - 1)
        for (let card of this.cards) {
            card.width = this.sceneLayout.cardWidth
            card.height = this.sceneLayout.cardHeight
            card.x = offsetX + Math.round(radius * Math.cos(angle))
            card.y = offsetY + Math.round(radius * Math.sin(angle))
            card.rotation = this.radiansToDegrees(angle) * 3
            card.handPosition = new PositionAndRotation(card.x, card.y, card.rotation)
            card.cursor = 'grab'

            card.refreshLayout()
            card.switchFrontBackForText()

            angle += angleIncrement
        }
    }

    private placeMyBetCardOnPlayerSlot() {
        const card = this.cards.find(card => card.text === this.sessionTable.playerInfo.bet.estimation)
        if (card === undefined) {
            return
        }
        const slot = this.playerSlotsContainer.getSlotForPlayer(this.sessionTable.playerInfo)
        if (slot === undefined) {
            console.error(`slot undefined, slot for player not set on refresh layout`)
            return
        }
        card.x = slot.x
        card.y = slot.y
        card.rotation = 0
        this.setChildIndex(card, this.numChildren - 1)
        this.betCard = card
    }

    private placeOtherPlayerCards() {
        const players = this.sessionTable.players
        if (!players) {
            console.error('players must be set')
            return
        }

        // other players bets
        for (let player of players.filter(player => player.id !== this.sessionTable.playerInfo.id)) {
            // when refreshing page, the state can already contain bets
            if (BetHelper.hasEstimation(player.bet)) {
                this.createCardForOtherPlayer(player, false)
            }
        }
    }

    private removeBetForOtherPlayer(player: PlayerInfo, animate: boolean) {
        const slot = this.playerSlotsContainer.getSlotForPlayer(player)
        if (!slot) {
            console.warn(`player ${player.id} no longer on table ${this.sessionTable.tableInfo?.id}`)
            return
        }

        const card = this.betsByPlayerIdMap.get(player.id)
        this.betsByPlayerIdMap.delete(player.id)

        if (card) {
            const dest = { x: slot.x + 2 * slot.width, y: -this.sceneLayout.cardHeight }
            if (animate) {
                Tween.get(card, {override: true})
                    .to(
                        dest,
                        700,
                        Ease.quadOut
                    )
                    .call(() => {
                        this.removeChild(card)
                    })
            } else {
                card.x = dest.x
                card.y = dest.y
            }
        }
    }

    private drag(card: CardShape, pos: Point) {
        card.drag(pos)
    }

    private grab(card: CardShape, pos: Point) {
        this.grabbedCard = card
        this.draggedCardStart = new Point(card.x, card.y)
        card.grab(pos)
    }

    private drop(card: CardShape, pos: Point) {
        card.dropTo(new PositionAndRotation(pos.x, pos.y, 0))
        this.grabbedCard = null
        this.onDropCard(card, pos)
    }

    private onDropCard(card: CardShape, pos: Point) {
        if (this.acceptDropToSlot(pos)) {
            if (null !== this.betCard && null !== this.betCard.handPosition) {
                this.betCard.dropTo(this.betCard.handPosition)
            }
            const playerSlot = this.playerSlotsContainer.playerSlot
            if (playerSlot) {
                card.dropTo(new PositionAndRotation(playerSlot.x, playerSlot.y, 0))
                this.setChildIndex(card, this.numChildren - 1)
            } else {
                console.error(`player slot not initialized`)
            }
            if (this.betCard !== card) {
                this.betCard = card
                console.log('onDropCard', this.betCard)
                this.onChangeMyBet(BetHelper.betWith(this.betCard.text))
            }
        } else {
            if (null !== card.handPosition) {
                card.dropTo(card.handPosition)
            }
            if (this.betCard === card) {
                this.onChangeMyBet(BetHelper.noBet())
                this.betCard = null
            }
        }
    }

    private calculateFilledHandOfCardsHeight(sceneLayout: SceneLayout, radius: number): number {
        const fromCenterY = radius * Math.sin(HandOfCardsContainer.START_ANGLE) + sceneLayout.cardHeight
        return Math.round(radius + fromCenterY + sceneLayout.halfCardHeight)
    }

    private radiansToDegrees(angleInRadians: number): number {
        return 90 + angleInRadians * 180 / Math.PI
    }
}
