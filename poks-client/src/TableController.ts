import { Stage, Touch } from '@createjs/easeljs'
import { Ticker } from '@createjs/core'
import { Bet } from '@server/model/Bet'
import { TableOptions } from '@server/model/TableOptions'
import { PlayerOptions } from '@server/model/PlayerOptions'
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

        this.tableOptionsDialogController = new TableOptionsDialogController(this.sessionTable)
        this.tableOptionsDialogController.onClose = this.onTableOptionsClose.bind(this)

        this.tableOptionsButton = document.getElementById('tableOptionsButton')
        this.tableOptionsButton?.addEventListener('click', () => this.onTableOptionsButtonClick())

        this.playerOptionsDialogController = new PlayerOptionsDialogController(this.sessionTable)
        this.playerOptionsDialogController.onClose = this.onPlayerOptionsClose.bind(this)

        this.playerOptionsButton = document.getElementById('playerOptionsButton')
        this.playerOptionsButton?.addEventListener('click', () => this.onPlayerOptionsButtonClick())

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

    public onWindowResize() {
        this.refreshLayout()
    }

    private refreshLayout() {
        this.sceneLayout.updateDimensionsFromWindow()
        this.tableContainer.refreshLayout()
        this.updatePlayerOptionsPanePlayerName()
        this.updateTableOptionsPaneTableName()
    }

    private onServerConnectionOpened() {
        console.log('onConnectionOpened', this.sessionTable)
        const playerInfo = this.sessionTable.playerInfo
        const tableInfo = this.sessionTable.tableInfo
        this.server.joinTable({
            playerInfo,
            tableInfo
        })
    }

    private updatePlayerOptionsPanePlayerName() {
        const textSpan = document.getElementById('playerOptionsPanePlayerName')
        if (textSpan) {
            textSpan.textContent = this.sessionTable.playerInfo.name
        }
    }

    private updateTableOptionsPaneTableName() {
        const textSpan = document.getElementById('tableOptionsPaneTableName')
        if (textSpan) {
            textSpan.textContent = this.sessionTable.tableInfo.name
        }
    }

    private onChangeMyBet(bet: Bet) {
        console.log('onChangeMyBet', bet)
        this.sessionTable.updateMyBet(bet)
        this.server.bet({
            bet
        })
    }

    private onRevealBetsClick() {
        console.log('onRevealBetsClick')
        this.server.revealBets()
    }

    private onResetTableClick() {
        console.log('onResetTableClick')
        this.server.resetTable()
    }

    private onPlayerOptionsButtonClick() {
        const playerInfo = this.sessionTable.playerInfo
        this.playerOptionsDialogController.update({
            id: this.sessionTable.playerInfo.id,
            name: playerInfo.name,
            observerMode: playerInfo.observerMode
        })
        this.tableOptionsDialogController.close()
        this.playerOptionsDialogController.open()
    }

    private onTableOptionsButtonClick() {
        const tableInfo = this.sessionTable.tableInfo
        this.tableOptionsDialogController.update({
            changedByPlayerId: this.sessionTable.playerInfo.id,
            name: tableInfo.name,
            deckKind: tableInfo.deckKind
        })
        this.playerOptionsDialogController.close()
        this.tableOptionsDialogController.open()
    }

    private onTableOptionsClose(tableOptions: TableOptions | null) {
        console.log('onTableOptionsChanged', tableOptions)
        setTimeout(() => this.tableOptionsButton?.focus(), 0)
        if (tableOptions) {
            this.server.changeTableOptions({tableOptions})
        }
    }

    private onPlayerOptionsClose(playerOptions: PlayerOptions | null) {
        console.log('onPlayerOptionsChanged', playerOptions)
        setTimeout(() => this.playerOptionsButton?.focus(), 0)
        if (playerOptions) {
            this.server.changePlayerOptions({playerOptions})
        }
    }

    // handle notifications from server
    private onServerJoinConfirmed(notificationData: JoinConfirmedNotificationData) {
        console.log('onServerJoinConfirmed', notificationData)
        this.sessionTable.update(notificationData.tableInfo, notificationData.players)
        this.tableContainer.refreshLayout()
        this.updatePlayerOptionsPanePlayerName()
        this.updateTableOptionsPaneTableName()
    }

    private onServerOtherJoined(notificationData: OtherJoinedNotificationData) {
        console.log('onServerOtherJoined', notificationData)
        const added = this.sessionTable.addOrUpdatePlayer(notificationData.playerInfo)
        if (added) {
            this.tableContainer.refreshPlayers()
        }
        this.tableContainer.refreshPlayers()
    }

    private onServerOtherBet(notificationData: OtherBetNotificationData) {
        console.log('onServerOtherBet', notificationData)
        const player = this.sessionTable.findPlayerById(notificationData.playerId)
        if (player) {
            player.bet = notificationData.bet
            this.tableContainer.otherPlayerBet(player)
        } else {
            console.warn(`player with ${notificationData.playerId} no longer at table ${this.tableContainer?.table?.id}`)
        }
    }

    private onServerOtherLeft(notificationData: OtherLeftNotificationData) {
        console.log('onServerOtherLeft', notificationData)
        const player = this.sessionTable.findPlayerById(notificationData.playerId)
        if (player === undefined) {
            console.warn(`player ${notificationData.playerId} no longer on table`)
            return
        }
        player.gone = true
        this.tableContainer.refreshPlayers()
    }

    private onServerRevealBets(notificationData: RevealBetsNotificationData) {
        console.log('onServerRevealBets', notificationData)
        this.sessionTable.tableInfo.revealed = true
        this.sessionTable.updateBets(notificationData.players)
        this.tableContainer.revealBets()
    }

    private onServerResetTable(notificationData: ResetTableNotificationData) {
        console.log('onServerResetTable', notificationData)
        this.sessionTable.tableInfo.revealed = false
        this.sessionTable.updateBets(notificationData.players)
        this.tableContainer.resetTable()
    }

    private onServerTableOptionsChanged(notificationData: ChangeTableOptionsNotificationData) {
        console.log('onServerTableOptionsChanged', notificationData)
        this.sessionTable.updateTableOptions(notificationData.tableOptions)
        this.updateTableOptionsPaneTableName()
        this.tableContainer.updateDeckCardsIfChanged()
    }

    private onServerPlayerOptionsChanged(notificationData: ChangePlayerOptionsNotificationData) {
        console.log('onServerPlayerOptionsChanged', notificationData)
        this.sessionTable.updatePlayerOptions(notificationData.playerOptions)
        this.updatePlayerOptionsPanePlayerName()
        this.tableContainer.refreshPlayers()
    }
}
