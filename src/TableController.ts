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
    sceneLayout: SceneLayout
    tableDisplay: TableContainer
    stage: StageGL

    constructor(
        private readonly sessionTable: SessionTable,
        private readonly sessionPlayer: SessionPlayer
    ) { }

    async init() {
        const player = this.sessionPlayer.get()

        await this.sessionTable.init(player)
        console.log('table', this.sessionTable.table, 'players', this.sessionTable.table.players)

        const canvas = document.getElementById('table') as HTMLCanvasElement

        this.sceneLayout = new SceneLayout(canvas)
        this.tableDisplay = new TableContainer(this.sceneLayout, this.sessionTable.table)
        this.tableDisplay.onChangeMyBet = this.onChangeMyBet.bind(this)

        window.addEventListener('resize', this.onWindowResize.bind(this), false)

        this.stage = new Stage(canvas)
        this.stage.enableMouseOver()
        if (Touch.isSupported()) {
            Touch.enable(this.stage)
        }

        this.stage.addChild(this.tableDisplay)
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
                this.onOtherPlayerBet(
                    this.sessionTable.table.players[i].id,
                    BetBuilder.betWith(EstimationPacks.MountainGoat.choices[3 + i])
                )
            }, 100 + i * 100);
        }
        for (let i = 1; i !== 6; i++) {
            setTimeout(() => {
                this.onOtherPlayerBet(
                    this.sessionTable.table.players[i].id,
                    BetBuilder.betWith(EstimationPacks.MountainGoat.choices[5 + i])
                )
            }, 1230 + i * 130);
        }

        setTimeout(() => this.onRevealBets(), 1000)

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

    private onWindowResize() {
        this.refreshLayout()
    }

    private refreshLayout() {
        this.sceneLayout.updateDimensionsFromWindow()
        this.tableDisplay.refreshLayout()
    }

    join(player: Player) {
        const added = this.sessionTable.addPlayerIfDoesNotExists(player)
        if (added) {
            this.tableDisplay.refreshPlayers()
        }
    }

    onChangeMyBet(bet: Bet) {
        this.sessionTable.table.me.bet = bet
        console.log('players', this.sessionTable.table.players)
        // this.tableDisplay.refreshLayout(this.sceneLayout)
    }

    onOtherPlayerBet(playerId: string, bet: Bet) {
        const player = this.sessionTable.findPlayerById(playerId)
        player.bet = bet
        this.tableDisplay.animateOtherPlayerBet(player)
    }

    onRevealBets() {
        this.tableDisplay.revealBets()
    }
}
