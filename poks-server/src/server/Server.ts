import { logger } from '../logger'
import { Monitoring } from '../Monitoring'
import { TemplatedApp, WebSocket, HttpRequest, HttpResponse } from 'uWebSockets.js'
import { ServerCommandFactory } from '../commands/ServerCommandFactory'
import { LeaveCommand } from '../commands/LeaveCommand'
import { TablePlayerHelper } from '../commands/TablePlayerHelper'
import { MessageInfo, Messages } from '../model/Messages'
import { Timestamp } from '../model/Timestamp'
import { HearBeatMessage } from '../model/HearBeatMessage'
import { ServerStorage } from './ServerStorage'

const log = logger.child({ component: 'Server' })

export class Server {
    private startedOn: Date | null = null
    private latestActivity: Date | null = null

    constructor(
        private readonly port: number,
        private readonly app: TemplatedApp,
        public readonly serverStorage: ServerStorage,
        public readonly cork = true
    ) { }

    start() {
        this.startedOn = new Date()
        this.latestActivity = this.startedOn

        this.serverStorage.mount()

        this.app
            .get('/_admin/status', (res, req) => {
                this.adminStatus(res, req)
            })
            .ws('/*', {
                /* Options */
                compression: 0,
                maxPayloadLength: 512,
                idleTimeout: 31,
                /* Handlers */
                open: (ws, req) => {
                    this.open(req)
                },
                message: (ws, message, isBinary) => {
                    if (this.cork) {
                        ws.cork(() => {
                            this.message(message, ws)
                        })
                    } else {
                        this.message(message, ws)
                    }
                },
                drain: (ws) => {
                    this.drain(ws)
                },
                close: (ws, code, message) => {
                    this.close(ws, code, message)
                }
            })
            .listen(this.port, (token) => {
                if (token) {
                    log.info(`Server started on ${this.startedOn}. Listening on port ${this.port}`);
                } else {
                    log.error(`Server failed to start. Failed to listen on port ${this.port}`);
                }
            });
    }

    public stop() {
        this.serverStorage.unmount()
    }

    private adminStatus(res: HttpResponse, req: HttpRequest) {
        res.end(JSON.stringify({
            status: 'UP',
            tablesCount: this.serverStorage.tablesCount,
            startedOn: this.startedOn,
            latestActivity: this.latestActivity
        }))
    }

    private close(ws: WebSocket, code: number, message: ArrayBuffer) {
        log.info('Connection closed', {code, message:  Buffer.from(message).toString()})
        new LeaveCommand(this, ws, {}).execute()
    }

    private drain(ws: WebSocket) {
        log.warn('Drain', { getBufferedAmount: ws.getBufferedAmount() })
    }

    private message(message: ArrayBuffer, ws: WebSocket) {
        const messageString = Buffer.from(message).toString()
        if (messageString === HearBeatMessage) {
            // heartbeat message, ignore
            return
        }
        const messageData = JSON.parse(messageString)
        const messageInfo = messageData as MessageInfo
        if (messageInfo) {
            log.info(`Received command ${Messages[messageInfo.kind]}`, { messageInfo })
            const command = ServerCommandFactory.of(this, ws, messageData)
            const data = messageData.data
            if (data) {
                try {
                    command.execute()
                    this.updateActivityTimestamp(ws)
                } catch (error) {
                    log.error(`Error executing command`, { messageData, error })
                }
            } else {
                log.error(`Data missing in command`, { messageData })
            }
        } else {
            log.error(`Cannot process message, missing command kind`, { messageString })
        }
    }

    private open(req: HttpRequest) {
        Monitoring.recordStatsOpenedConnections()
        log.info(`Connection opened on ${req.getUrl()}`)
    }

    private updateActivityTimestamp(ws: WebSocket) {
        this.latestActivity = new Date()
        const table = TablePlayerHelper.getTable(this, ws)
        if (table !== undefined) {
            table.activityTimestamp = Timestamp.current()
        }
    }
}
