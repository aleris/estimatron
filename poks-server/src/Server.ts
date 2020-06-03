import { ServerCommandFactory } from './commands/ServerCommandFactory'
import { TemplatedApp, default as uWS } from 'uWebSockets.js'
import { MessageInfo, Messages } from './model/Messages'
import { LeaveCommand } from './commands/LeaveCommand'
import { Table } from './Table'
import { logger } from './logger'

const HearBeatMessage = '~'

const log = logger.child({ component: 'Server' })

export class Server {
    public readonly tables = new Map<string, Table>()
    public readonly serverCommandFactory = new ServerCommandFactory(this)

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
                maxPayloadLength: 1024,
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
        log.info('Connection closed', {code, message})
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
            const command = this.serverCommandFactory.of(ws, messageData)
            const data = messageData.data
            if (data) {
                command.execute()
            } else {
                log.error(`Data missing in command`, { messageData })
            }
        } else {
            log.error(`Cannot process message, missing command kind`, { messageString })
        }
    }

    private open(req: uWS.HttpRequest) {
        log.info(`Connection opened on ${req.getUrl()}`)
    }

    private deleteUnusedTables() {
        log.debug('Deleting unused tables')
    }

    getTimestamp() {
        return new Date().getTime()
    }
}
