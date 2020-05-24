export type Estimation = string

export const NoEstimation = '~'

export interface Bet {
    timestamp: number
    estimation: Estimation
}

export class BetBuilder {
    static noBet(): Bet {
        return {
            estimation: NoEstimation,
            timestamp: this.currentTimestamp()
        }
    }

    static betWith(estimation: string) {
        return {
            estimation,
            timestamp: this.currentTimestamp()
        }
    }

    private static currentTimestamp(): number {
        return new Date().getTime()
    }
}
