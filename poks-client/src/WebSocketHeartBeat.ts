import { HearBeatMessage } from '@server/model/HearBeatMessage'

export class WebSocketHeartBeat {
    private intervalTimer: number | null = null

    constructor(private readonly webSocket: WebSocket) { }

    public start() {
        this.intervalTimer = window.setInterval(() => {
            this.webSocket.send(HearBeatMessage)
        }, 15000)
    }

    public stop() {
        if (this.intervalTimer !== null) {
            window.clearInterval(this.intervalTimer)
        }
    }
}
