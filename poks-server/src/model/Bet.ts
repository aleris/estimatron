import { PlayerInfo } from './PlayerInfo'

export type estimation = string

export interface Bet {
    estimation: estimation
    timestamp: number
}

export class BetHelper {
    private static readonly NoEstimation: estimation = '~'
    private static readonly HiddenEstimation: estimation = '#'

    static noBet(): Bet {
        return {
            estimation: BetHelper.NoEstimation,
            timestamp: this.currentTimestamp()
        }
    }

    static betWith(estimation: estimation) {
        return {
            estimation,
            timestamp: this.currentTimestamp()
        }
    }

    static hasEstimation(bet: Bet | undefined): boolean {
        if (bet === undefined) {
            return false
        }

        if (bet.estimation === this.NoEstimation) {
            return false
        }

        return true
    }

    private static currentTimestamp(): number {
        return new Date().getTime()
    }

    static hide(bet: Bet) {
        const hiddenEstimation = bet.estimation !== this.NoEstimation ? this.HiddenEstimation : this.NoEstimation
        return {
            estimation: hiddenEstimation,
            timestamp: bet.timestamp
        }
    }

    static hideForPlayerInfo(playerInfo: PlayerInfo) {
        return {
            ...playerInfo,
            bet: this.hide(playerInfo.bet)
        }
    }
}
