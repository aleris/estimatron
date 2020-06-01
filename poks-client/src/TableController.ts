import { Stage, Touch } from '@createjs/easeljs'
import { Ticker } from '@createjs/core'
import { Bet } from '@server/model/Bet'
import { PlayerInfo } from '@server/model/PlayerInfo'
import { JoinConfirmedNotificationData } from '@server/model/JoinConfirmedNotificationData'
import { OtherJoinedNotificationData } from '@server/model/OtherJoinedNotificationData'
import { OtherBetNotificationData } from '@server/model/OtherBetNotificationData'
import { OtherLeftNotificationData } from '@server/model/OtherLeftNotificationData'
import { RevealBetsNotificationData } from '@server/model/RevealBetsNotificationData'
import { ResetTableNotificationData } from '@server/model/ResetTableNotificationData'
import { SessionTable } from '@/data/SessionTable'
import { SceneLayout } from '@/display/SceneLayout'
import { TableContainer } from '@/display/TableContainer'
import { Server } from '@/Server'

export class TableController {
    private readonly sceneLayout: SceneLayout
    private readonly sessionTable: SessionTable
    private readonly tableContainer: TableContainer
    private readonly stage: Stage
    private readonly server: Server

    constructor() {
        const canvas = document.getElementById('table') as HTMLCanvasElement

        this.sceneLayout = new SceneLayout(canvas)

        this.stage = new Stage(canvas)
        this.stage.enableMouseOver()
        if (Touch.isSupported()) {
            Touch.enable(this.stage)
        }

        this.sessionTable = new SessionTable()

        this.tableContainer = new TableContainer(this.sceneLayout, this.sessionTable)
        this.tableContainer.onChangeMyBet = this.onChangeMyBet.bind(this)
        this.tableContainer.onRevealBetsClick = this.onRevealBetsClick.bind(this)
        this.tableContainer.onResetTableClick = this.onResetTableClick.bind(this)
        this.stage.addChild(this.tableContainer)

        this.refreshLayout()
        Ticker.addEventListener('tick', this.stage)

        this.server = new Server()
        this.server.onConnectionOpened = this.onConnectionOpened.bind(this)
        this.server.onJoinConfirmed = this.onJoinConfirmed.bind(this)
        this.server.onOtherJoined = this.onOtherJoined.bind(this)
        this.server.onOtherBet = this.onOtherBet.bind(this)
        this.server.onOtherLeft = this.onOtherLeft.bind(this)
        this.server.onRevealBets = this.onRevealBets.bind(this)
        this.server.onResetTable = this.onResetTable.bind(this)
    }

    onConnectionOpened() {
        console.log('onConnectionOpened')
        const playerInfo = this.sessionTable.getLocalPlayerOrNew()
        this.sessionTable.player = playerInfo
        const tableInfo = this.sessionTable.getLocalTableOrNew()
        this.server.joinTable({
            playerInfo,
            tableInfo
        })
    }

    private refreshLayout() {
        this.sceneLayout.updateDimensionsFromWindow()
        this.tableContainer.refreshLayout()
    }

    public onWindowResize() {
        this.refreshLayout()
    }

    onChangeMyBet(bet: Bet) {
        if (null !== this.sessionTable.player) {
            this.sessionTable.player.bet = bet
            this.server.bet({
                bet
            })
            console.log('players', this.sessionTable.players)
        } else {
            console.error('SessionTable me ref is null, not initialized?')
        }
        // this.tableContainer.refreshLayout(this.sceneLayout)
    }

    onRevealBetsClick() {
        console.log('onRevealBetsClick')
        this.server.revealBets()
    }

    onResetTableClick() {
        console.log('onResetTableClick')
        this.server.resetTable()
    }

    // handle notifications from server
    onJoinConfirmed(notificationData: JoinConfirmedNotificationData) {
        console.log('onJoinAccepted', notificationData.tableInfo, notificationData.players)
        this.sessionTable.update(notificationData.tableInfo, notificationData.players)
        this.tableContainer.refreshLayout()
    }

    onOtherJoined(notificationData: OtherJoinedNotificationData) {
        const added = this.sessionTable.addOrUpdatePlayer(notificationData.playerInfo)
        if (added) {
            this.tableContainer.refreshPlayers()
        }
        this.tableContainer.refreshPlayers()
    }

    onOtherBet(notificationData: OtherBetNotificationData) {
        const player = this.sessionTable.findPlayerById(notificationData.playerId)
        if (player) {
            player.bet = notificationData.bet
            this.tableContainer.animateOtherPlayerBet(player)
        } else {
            console.warn(`player with ${notificationData.playerId} no longer at table ${this.tableContainer?.table?.id}`)
        }
    }

    onOtherLeft(notificationData: OtherLeftNotificationData) {
        const player = this.sessionTable.findPlayerById(notificationData.playerId)
        if (player === undefined) {
            console.warn(`player ${notificationData.playerId} no longer on table`)
            return
        }
        player.gone = true
        this.tableContainer.refreshPlayers()
    }

    onRevealBets(notificationData: RevealBetsNotificationData) {
        this.sessionTable.updateBets(notificationData.players)
        this.tableContainer.revealBets()
    }

    onResetTable(notificationData: ResetTableNotificationData) {
        this.tableContainer.resetTable()
    }
}
