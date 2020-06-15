import { logger } from './logger'
import { Monitoring } from './Monitoring'
import { ServerCommandFactory } from './commands/ServerCommandFactory'
import { TemplatedApp, default as uWS } from 'uWebSockets.js'
import { MessageInfo, Messages } from './model/Messages'
import { LeaveCommand } from './commands/LeaveCommand'
import { Table } from './Table'
import { WebSocketTablePlayerInfo } from './commands/WebSocketTablePlayerInfo'
import { Timestamp } from './model/Timestamp'
import { HearBeatMessage } from './model/HearBeatMessage'

const log = logger.child({ component: 'Server' })

export class Server {
    public readonly tables = new Map<string, Table>()

    private app: TemplatedApp | null = null
    private startedOn: Date | null = null

    constructor(private readonly port: number) {
    }

    start() {
        this.startedOn = new Date()

        this.app = uWS.App()
            .get('/_admin/status', (res, req) => {
                this.adminStatus(res, req)
            })
            .get('/_admin/tables', (res, req) => {
                this.adminTables(res, req)
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
                    this.message(message, ws)
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

        const tenMinutes = 10 * 60 * 1000
        setInterval(this.deleteUnusedTables, tenMinutes)
    }

    private adminStatus(res: uWS.HttpResponse, req: uWS.HttpRequest) {
        res.end(JSON.stringify({status: 'UP', tablesSize: this.tables.size, startedOn: this.startedOn}))
    }

    private adminTables(res: uWS.HttpResponse, req: uWS.HttpRequest) {
        res.end(JSON.stringify([...this.tables], null, '  '))
    }

    private close(ws: uWS.WebSocket, code: number, message: ArrayBuffer) {
        log.info('Connection closed', {code, message:  Buffer.from(message).toString()})
        new LeaveCommand(this, ws, {}).execute()
    }

    private drain(ws: uWS.WebSocket) {
        log.warn('Drain', {getBufferedAmount: ws.getBufferedAmount()})
    }

    private message(message: ArrayBuffer, ws: uWS.WebSocket) {
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

    private open(req: uWS.HttpRequest) {
        Monitoring.recordStatsOpenedConnections()
        log.info(`Connection opened on ${req.getUrl()}`)
    }

    private deleteUnusedTables() {
        log.debug('Deleting unused tables')
    }

    private updateActivityTimestamp(ws: uWS.WebSocket) {
        const table = WebSocketTablePlayerInfo.getTable(this, ws)
        if (table !== undefined) {
            table.activityTimestamp = Timestamp.current()
        }
    }
}
