import { Bet } from '@server/model/Bet'
import { TableOptions } from '@server/model/TableOptions'
import { PlayerOptions } from '@server/model/PlayerOptions'
import { JoinConfirmedNotificationData } from '@server/model/JoinConfirmedNotificationData'
import { OtherJoinedNotificationData } from '@server/model/OtherJoinedNotificationData'
import { JoinDeniedNotificationData, JoinDeniedReasonMessages } from '@server/model/JoinDeniedNotificationData'
import { OtherBetNotificationData } from '@server/model/OtherBetNotificationData'
import { OtherLeftNotificationData } from '@server/model/OtherLeftNotificationData'
import { RevealBetsNotificationData } from '@server/model/RevealBetsNotificationData'
import { ResetTableNotificationData } from '@server/model/ResetTableNotificationData'
import { ChangeTableOptionsNotificationData } from '@server/model/ChangeTableOptionsNotificationData'
import { ChangePlayerOptionsNotificationData } from '@server/model/ChangePlayerOptionsNotificationData'
import { SessionTable } from '@/data/SessionTable'
import { SceneLayout } from '@/display/SceneLayout'
import { TableContainer } from '@/display/TableContainer'
import { PlayerOptionsPanelController } from '@/hud-components/player-options-panel/PlayerOptionsPanelController'
import { PlayerOptionsDialogController } from '@/hud-components/player-options-dialog/PlayerOptionsDialogController'
import { TableOptionsPanelController } from '@/hud-components/table-options-panel/TableOptionsPanelController'
import { TableOptionsDialogController } from '@/hud-components/table-options-dialog/TableOptionsDialogController'
import { Notification } from '@/hud-components/notification/Notification'
import { LocalStorageRepository } from '@/data/StorageRepository'
import { LocalTablePlayer } from '@/data/LocalTablePlayer'
import { Server } from '@/pages/app/Server'
import { Stage, Ticker, Touch } from '@/createjs'

export class TableController {
    private readonly sceneLayout: SceneLayout
    private readonly sessionTable: SessionTable
    private readonly tableContainer: TableContainer
    private readonly stage: Stage
    private readonly playerOptionsPanelController: PlayerOptionsPanelController
    private readonly playerOptionsDialogController: PlayerOptionsDialogController
    private readonly tableOptionsPanelController: TableOptionsPanelController
    private readonly tableOptionsDialogController: TableOptionsDialogController
    private readonly notification: Notification
    private readonly localTablePlayer: LocalTablePlayer

    constructor(canvasElementId: string, private readonly server: Server) {
        this.notification = new Notification()

        if (!LocalStorageRepository.isAvailable) {
            this.notification.add('Local storage is disabled. Table options are not saved and player options are partially preserved using the url.')
        }

        const canvas = document.getElementById(canvasElementId) as HTMLCanvasElement

        this.sceneLayout = new SceneLayout(canvas)

        this.stage = new Stage(canvas)
        this.stage.enableMouseOver()
        if (Touch.isSupported()) {
            Touch.enable(this.stage)
        }

        this.localTablePlayer = new LocalTablePlayer()
        this.sessionTable = new SessionTable(this.localTablePlayer)

        this.tableContainer = new TableContainer(this.sceneLayout, this.sessionTable)
        this.tableContainer.onChangeMyBet = this.onChangeMyBet.bind(this)
        this.tableContainer.onRevealBetsClick = this.onRevealBetsClick.bind(this)
        this.tableContainer.onResetTableClick = this.onResetTableClick.bind(this)
        this.stage.addChild(this.tableContainer)

        this.tableOptionsPanelController = new TableOptionsPanelController(this.sessionTable)
        this.tableOptionsPanelController.onTableOptionsButtonClick = this.onTableOptionsButtonClick.bind(this)

        this.tableOptionsDialogController = new TableOptionsDialogController(this.sessionTable)
        this.tableOptionsDialogController.onClose = this.onTableOptionsClose.bind(this)

        this.playerOptionsPanelController = new PlayerOptionsPanelController(this.sessionTable)
        this.playerOptionsPanelController.onPlayerOptionsButtonClick = this.onPlayerOptionsButtonClick.bind(this)

        this.playerOptionsDialogController = new PlayerOptionsDialogController(this.sessionTable)
        this.playerOptionsDialogController.onClose = this.onPlayerOptionsClose.bind(this)

        this.refreshLayout()
        Ticker.addEventListener('tick', this.stage)

        this.server.onConnectionOpened = this.onServerConnectionOpened.bind(this)
        this.server.onJoinConfirmed = this.onServerJoinConfirmed.bind(this)
        this.server.onOtherJoined = this.onServerOtherJoined.bind(this)
        this.server.onJoinDenied = this.onServerJoinDenied.bind(this)
        this.server.onOtherBet = this.onServerOtherBet.bind(this)
        this.server.onOtherLeft = this.onServerOtherLeft.bind(this)
        this.server.onRevealBets = this.onServerRevealBets.bind(this)
        this.server.onResetTable = this.onServerResetTable.bind(this)
        this.server.onChangeTableOptions = this.onServerTableOptionsChanged.bind(this)
        this.server.onChangePlayerOptions = this.onServerPlayerOptionsChanged.bind(this)
    }

    public onWindowResize() {
        this.refreshLayout()
    }

    private refreshLayout() {
        this.sceneLayout.updateDimensionsFromWindow()
        this.tableContainer.refreshLayout()
        this.playerOptionsPanelController.refresh()
        this.tableOptionsPanelController.refresh()
    }

    private onServerConnectionOpened() {
        console.log('onConnectionOpened', this.sessionTable)
        const playerInfo = this.sessionTable.playerInfo
        const tableInfo = this.sessionTable.tableInfo
        this.server.sendJoinTable({
            playerInfo,
            tableInfo
        })
    }

    private onChangeMyBet(bet: Bet) {
        console.log('onChangeMyBet', bet)
        this.sessionTable.updateMyBet(bet)
        this.server.sendBet({
            bet
        })
    }

    private onRevealBetsClick() {
        console.log('onRevealBetsClick')
        this.server.sendRevealBets()
    }

    private onResetTableClick() {
        console.log('onResetTableClick')
        this.server.sendResetTable()
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
        console.log('onChangeTableOptions', tableOptions)
        this.tableOptionsPanelController.refocusAction()
        if (tableOptions) {
            this.server.sendChangeTableOptions({tableOptions})
        }
    }

    private onPlayerOptionsClose(playerOptions: PlayerOptions | null) {
        console.log('onChangePlayerOptions', playerOptions)
        this.playerOptionsPanelController.refocusAction()
        if (playerOptions) {
            this.server.sendChangePlayerOptions({playerOptions})
        }
    }

    // handle notifications from server
    private onServerJoinConfirmed(notificationData: JoinConfirmedNotificationData) {
        console.log('onServerJoinConfirmed', notificationData)
        this.sessionTable.update(notificationData.tableInfo, notificationData.players)
        this.tableContainer.refreshLayout()
        this.playerOptionsPanelController.refresh()
        this.tableOptionsPanelController.refresh()
    }

    private onServerOtherJoined(notificationData: OtherJoinedNotificationData) {
        console.log('onServerOtherJoined', notificationData)
        const added = this.sessionTable.addOrUpdatePlayer(notificationData.playerInfo)
        if (added) {
            this.tableContainer.refreshPlayers()
        }
        this.tableContainer.refreshPlayers()
    }

    private onServerJoinDenied(notificationData: JoinDeniedNotificationData) {
        console.log('onServerJoinDenied', notificationData)
        this.notification.permanent(JoinDeniedReasonMessages[notificationData.reason])
    }

    private onServerOtherBet(notificationData: OtherBetNotificationData) {
        console.log('onServerOtherBet', notificationData)
        const player = this.sessionTable.findPlayerById(notificationData.playerId)
        if (player) {
            player.bet = notificationData.bet
            this.tableContainer.otherPlayerBet(player)
        } else {
            console.warn(`player with ${notificationData.playerId} no longer at table ${this.sessionTable.tableInfo.id}`)
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
        this.tableOptionsPanelController.refresh()
        this.tableContainer.updateDeckCardsIfChanged()
        this.localTablePlayer.update(this.sessionTable.tableInfo, this.sessionTable.playerInfo)
    }

    private onServerPlayerOptionsChanged(notificationData: ChangePlayerOptionsNotificationData) {
        console.log('onServerPlayerOptionsChanged', notificationData)
        this.sessionTable.updatePlayerOptions(notificationData.playerOptions)
        this.playerOptionsPanelController.refresh()
        this.tableContainer.refreshPlayers()
        this.localTablePlayer.update(this.sessionTable.tableInfo, this.sessionTable.playerInfo)
    }
}
