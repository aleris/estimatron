export const NoEstimation = '~'

export interface Vote {
    timestamp: number
    estimation: string
}

export class VoteBuilder {
    o: Vote

    constructor() {
        this.o = {
            timestamp: new Date().getTime(),
            estimation: NoEstimation
        }
    }

    noVote(): VoteBuilder {
        this.o.estimation = NoEstimation
        return this
    }

    vote(estimation: string) {
        this.o.estimation = estimation
        return this
    }

    timestamp(timestamp: number) {
        this.o.timestamp = timestamp
        return this
    }

    currentTimestamp() {
        this.o.timestamp = new Date().getTime()
        return this
    }

    build() {
        return this.o
    }
}
