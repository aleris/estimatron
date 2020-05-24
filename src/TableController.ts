import { Player } from './data/Player'
import { SessionTable } from './data/SessionTable'
import { SessionPlayer } from './data/SessionPlayer'
import { SceneLayout } from './display/SceneLayout'
import { TableContainer } from './display/TableContainer'
import { Stage, Touch } from '@createjs/easeljs'
import { Ticker } from '@createjs/core'
import { IdGenerator } from './data/IdGenerator'
import { NameGenerator } from './data/NameGenerator'
import { Bet, BetBuilder } from './data/Bet'
import { EstimationPacks } from './data/EstimationPacks'

export class TableController {
    tableContainer: TableContainer
    stage: StageGL

    constructor(
        private readonly sceneLayout: SceneLayout,
        private readonly sessionTable: SessionTable,
        private readonly sessionPlayer: SessionPlayer
    ) {
        this.tableContainer = new TableContainer(this.sceneLayout, this.sessionTable)
        this.tableContainer.onChangeMyBet = this.onChangeMyBet.bind(this)

        this.stage = new Stage(sceneLayout.canvas)
        this.stage.enableMouseOver()
        if (Touch.isSupported()) {
            Touch.enable(this.stage)
        }

        this.stage.addChild(this.tableContainer)
    }

    async init() {
        const player = this.sessionPlayer.get()

        await this.sessionTable.init(player)
        console.log('table', this.sessionTable.table, 'players', this.sessionTable.table?.players)

        this.refreshLayout()

        for (let i = 0; i !== 5; i++) {
            setTimeout(() => {
                this.join({
                    id: IdGenerator.randomUniqueId(),
                    name: NameGenerator.randomReadableName(),
                    bet: BetBuilder.noBet()
                })
            }, 50 + i * 100);
        }

        for (let i = 1; i !== 6; i++) {
            setTimeout(() => {
                if (null !== this.sessionTable.table) {
                    this.onOtherPlayerBet(
                        this.sessionTable.table.players[i].id,
                        BetBuilder.betWith(EstimationPacks.MountainGoat.choices[3 + i])
                    )
                }
            }, 100 + i * 500);
        }
        // for (let i = 1; i !== 6; i++) {
        //     setTimeout(() => {
        //         this.onOtherPlayerBet(
        //             this.sessionTable.table.players[i].id,
        //             BetBuilder.betWith(EstimationPacks.MountainGoat.choices[5 + i])
        //         )
        //     }, 1230 + i * 130);
        // }

        // setTimeout(() => this.onRevealBets(), 5000)

        // setTimeout(() => {
        //     this.join({
        //         id: IdGenerator.randomUniqueId(),
        //         name: NameGenerator.randomReadableName(),
        //         bet: BetBuilder.noBet()
        //     })
        // }, 3000);
        //
        // setTimeout(() => {
        //     this.join({
        //         id: IdGenerator.randomUniqueId(),
        //         name: NameGenerator.randomReadableName(),
        //         bet: BetBuilder.noBet()
        //     })
        // }, 5000);


        Ticker.addEventListener('tick', this.stage)
    }

    public onWindowResize() {
        this.refreshLayout()
    }

    private refreshLayout() {
        this.sceneLayout.updateDimensionsFromWindow()
        this.tableContainer.refreshLayout()
    }

    join(player: Player) {
        const added = this.sessionTable.addPlayerIfDoesNotExists(player)
        if (added) {
            this.tableContainer.refreshPlayers()
        }
    }

    onChangeMyBet(bet: Bet) {
        if (null !== this.sessionTable.table) {
            this.sessionTable.table.me.bet = bet
            console.log('players', this.sessionTable.table.players)
        } else {
            console.error('table is null, not initialized?')
        }
        // this.tableContainer.refreshLayout(this.sceneLayout)
    }

    onOtherPlayerBet(playerId: string, bet: Bet) {
        const player = this.sessionTable.findPlayerById(playerId)
        if (player) {
            player.bet = bet
            this.tableContainer.animateOtherPlayerBet(player)
        } else {
            console.warn(`player with ${playerId} no longer at table ${this.tableContainer.table.id}`)
        }
    }

    onRevealBets() {
        this.tableContainer.revealBets()
    }
}
