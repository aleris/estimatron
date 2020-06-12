import { Stage, Touch } from '@createjs/easeljs'
import { Ticker } from '@createjs/core'
import { Bet } from '@server/model/Bet'
import { ChangeTableOptionsData } from '@server/model/ChangeTableOptionsData'
import { ChangePlayerOptionsData } from '@server/model/ChangePlayerOptionsData'
import { JoinConfirmedNotificationData } from '@server/model/JoinConfirmedNotificationData'
import { OtherJoinedNotificationData } from '@server/model/OtherJoinedNotificationData'
import { OtherBetNotificationData } from '@server/model/OtherBetNotificationData'
import { OtherLeftNotificationData } from '@server/model/OtherLeftNotificationData'
import { RevealBetsNotificationData } from '@server/model/RevealBetsNotificationData'
import { ResetTableNotificationData } from '@server/model/ResetTableNotificationData'
import { ChangeTableOptionsNotificationData } from '@server/model/ChangeTableOptionsNotificationData'
import { ChangePlayerOptionsNotificationData } from '@server/model/ChangePlayerOptionsNotificationData'
import { SessionTable } from '@/data/SessionTable'
import { SceneLayout } from '@/display/SceneLayout'
import { TableContainer } from '@/display/TableContainer'
import { Server } from '@/Server'
import { TableOptionsDialogController } from '@/dialogs/table-options/TableOptionsDialogController'
import { PlayerOptionsDialogController } from '@/dialogs/player-options/PlayerOptionsDialogController'

export class TableController {
    private readonly sceneLayout: SceneLayout
    private readonly sessionTable: SessionTable
    private readonly tableContainer: TableContainer
    private readonly stage: Stage
    private readonly server: Server
    private readonly tableOptionsButton: HTMLElement | null
    private readonly tableOptionsDialogController: TableOptionsDialogController
    private readonly playerOptionsButton: HTMLElement | null
    private readonly playerOptionsDialogController: PlayerOptionsDialogController

    constructor(canvasElementId: string) {
        this.tableOptionsDialogController = new TableOptionsDialogController()
        this.tableOptionsDialogController.onTableOptionsChanged = this.onTableOptionsChanged.bind(this)

        this.tableOptionsButton = document.getElementById('tableOptionsButton')
        this.tableOptionsButton?.addEventListener('click', () => {
            const tableInfo = this.sessionTable.tableInfo
            this.tableOptionsDialogController.update({ tableName: tableInfo.name, deckKind: tableInfo.deckKind })
            this.playerOptionsDialogController.close()
            this.tableOptionsDialogController.toggleDialog()
        })

        this.playerOptionsDialogController = new PlayerOptionsDialogController()
        this.playerOptionsDialogController.onPlayerOptionsChanged = this.onPlayerOptionsChanged.bind(this)

        this.playerOptionsButton = document.getElementById('playerOptionsButton')
        this.playerOptionsButton?.addEventListener('click', () => {
            const playerInfo = this.sessionTable.playerInfo
            this.playerOptionsDialogController.update({ playerName: playerInfo.name, observerMode: playerInfo.observer })
            this.tableOptionsDialogController.close()
            this.playerOptionsDialogController.toggleDialog()
        })

        const canvas = document.getElementById(canvasElementId) as HTMLCanvasElement

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
        this.server.onConnectionOpened = this.onServerConnectionOpened.bind(this)
        this.server.onJoinConfirmed = this.onServerJoinConfirmed.bind(this)
        this.server.onOtherJoined = this.onServerOtherJoined.bind(this)
        this.server.onOtherBet = this.onServerOtherBet.bind(this)
        this.server.onOtherLeft = this.onServerOtherLeft.bind(this)
        this.server.onRevealBets = this.onServerRevealBets.bind(this)
        this.server.onResetTable = this.onServerResetTable.bind(this)
        this.server.onTableOptionsChanged = this.onServerTableOptionsChanged.bind(this)
        this.server.onPlayerOptionsChanged = this.onServerPlayerOptionsChanged.bind(this)
    }

    onServerConnectionOpened() {
        console.log('onConnectionOpened')
        const playerInfo = this.sessionTable.playerInfo
        const tableInfo = this.sessionTable.tableInfo
        this.server.joinTable({
            playerInfo,
            tableInfo
        })
    }

    private refreshLayout() {
        this.sceneLayout.updateDimensionsFromWindow()
        this.tableContainer.refreshLayout()
        this.updatePlayerOptionButtonPlayerName()
    }

    private updatePlayerOptionButtonPlayerName() {
        const textSpan = this.playerOptionsButton?.getElementsByClassName('player-options-button-label').item(0)
        if (textSpan) {
            textSpan.textContent = this.sessionTable.playerInfo.name
        }
    }

    public onWindowResize() {
        this.refreshLayout()
    }

    onChangeMyBet(bet: Bet) {
        console.log('onChangeMyBet', bet)
        this.sessionTable.updateMyBet(bet)
        this.server.bet({
            bet
        })
    }

    onRevealBetsClick() {
        console.log('onRevealBetsClick')
        this.server.revealBets()
    }

    onResetTableClick() {
        console.log('onResetTableClick')
        this.server.resetTable()
    }

    onTableOptionsChanged(options: ChangeTableOptionsData) {
        console.log('onTableOptionsChanged', options)
        this.server.changeTableOptions(options)
    }

    onPlayerOptionsChanged(options: ChangePlayerOptionsData) {
        console.log('onPlayerOptionsChanged', options)
        this.server.changePlayerOptions(options)
    }

    // handle notifications from server
    onServerJoinConfirmed(notificationData: JoinConfirmedNotificationData) {
        console.log('onJoinAccepted', notificationData)
        this.sessionTable.update(notificationData.tableInfo, notificationData.players)
        this.tableContainer.refreshLayout()
        this.updatePlayerOptionButtonPlayerName()
    }

    onServerOtherJoined(notificationData: OtherJoinedNotificationData) {
        console.log('onOtherJoined', notificationData)
        const added = this.sessionTable.addOrUpdatePlayer(notificationData.playerInfo)
        if (added) {
            this.tableContainer.refreshPlayers()
        }
        this.tableContainer.refreshPlayers()
    }

    onServerOtherBet(notificationData: OtherBetNotificationData) {
        console.log('onOtherBet', notificationData)
        const player = this.sessionTable.findPlayerById(notificationData.playerId)
        if (player) {
            player.bet = notificationData.bet
            this.tableContainer.otherPlayerBet(player)
        } else {
            console.warn(`player with ${notificationData.playerId} no longer at table ${this.tableContainer?.table?.id}`)
        }
    }

    onServerOtherLeft(notificationData: OtherLeftNotificationData) {
        console.log('notificationData', notificationData)
        const player = this.sessionTable.findPlayerById(notificationData.playerId)
        if (player === undefined) {
            console.warn(`player ${notificationData.playerId} no longer on table`)
            return
        }
        player.gone = true
        this.tableContainer.refreshPlayers()
    }

    onServerRevealBets(notificationData: RevealBetsNotificationData) {
        console.log('onRevealBets', notificationData)
        this.sessionTable.tableInfo.revealed = true
        this.sessionTable.updateBets(notificationData.players)
        this.tableContainer.revealBets()
    }

    onServerResetTable(notificationData: ResetTableNotificationData) {
        console.log('onResetTable', notificationData)
        this.sessionTable.tableInfo.revealed = false
        this.sessionTable.updateBets(notificationData.players)
        this.tableContainer.resetTable()
    }

    onServerTableOptionsChanged(notificationData: ChangeTableOptionsNotificationData) {
        this.sessionTable.tableInfo.name = notificationData.tableName
        // TODO: handle table name changed
        this.sessionTable.tableInfo.deckKind = notificationData.deckKind
        this.tableContainer.updateDeckCardsIfChanged()
    }

    onServerPlayerOptionsChanged(notificationData: ChangePlayerOptionsNotificationData) {
        const player = this.sessionTable.findPlayerById(notificationData.playerId)
        if (player !== undefined) {
            player.name = notificationData.playerName
            player.observer = notificationData.observerMode
        }
        this.updatePlayerOptionButtonPlayerName()
        this.tableContainer.refreshPlayers()
        // TODO: handle observer
    }
}
