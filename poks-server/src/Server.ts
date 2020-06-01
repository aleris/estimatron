import { ServerCommandFactory } from './commands/ServerCommandFactory'
import { TemplatedApp, default as uWS } from 'uWebSockets.js'
import { MessageInfo, Messages } from './model/Messages'
import { LeaveCommand } from './commands/LeaveCommand'
import { Table } from './Table'

const HearBeatMessage = '~'

export class Server {
    public readonly tables = new Map<string, Table>()
    public readonly serverCommandFactory = new ServerCommandFactory(this)
    private readonly app: TemplatedApp

    constructor(port: number) {
        this.app = uWS.App()
            .get('/_admin', (res, req) => {
                res.end(JSON.stringify(this.tables, null, '  '));
            })
            .ws('/*', {
                /* Options */
                compression: 0,
                maxPayloadLength: 1024,
                idleTimeout: 31,
                /* Handlers */
                open: (ws, req) => {
                    console.log(`connection opened on ${req.getUrl()}`)
                },
                message: (ws, message, isBinary) => {
                    /* Ok is false if backpressure was built up, wait for drain */
                    // let ok = ws.send(message, isBinary);
                    const messageString = Buffer.from(message).toString()
                    if (messageString === HearBeatMessage) {
                        // heartbeat message, ignore
                        return
                    }
                    const messageData = JSON.parse(messageString)
                    const messageInfo = messageData as MessageInfo
                    if (messageInfo) {
                        console.log(`received command ${Messages[messageInfo.kind]}`, messageInfo)
                        const command = this.serverCommandFactory.of(ws, messageData)
                        const data = messageData.data
                        if (data) {
                            command.execute()
                        } else {
                            console.error(`data missing in command`, messageData)
                        }
                    } else {
                        console.error(`cannot process message`, messageString)
                    }
                },
                drain: (ws) => {
                    console.warn('DRAIN: ' + ws.getBufferedAmount());
                },
                close: (ws, code, message) => {
                    console.log('connection closed', code, message);
                    new LeaveCommand(this, ws, {}).execute()
                }
            })
            .listen(port, (token) => {
                if (token) {
                    console.log(`Server started. Listening on port ${port}`);
                } else {
                    console.log(`Server failed to start. Failed to listen on port ${port}`);
                }
            });

        const tenMinutes = 10 * 60 * 1000
        setInterval(this.deleteUnusedTables, tenMinutes)
    }

    private deleteUnusedTables() {
    }

    getTimestamp() {
        return new Date().getTime()
    }
}
