import { BetHelper } from './Bet'

jest.mock('./Timestamp', () => ({
    Timestamp: {
        current: () => 123
    }
}))

describe(BetHelper.name, () => {
    test('noBet', () => {
        const result = BetHelper.noBet()
        expect(result).toStrictEqual({
            estimation: '~',
            timestamp: 123
        })
    })

    test('betWith', () => {
        const result = BetHelper.betWith('5')
        expect(result).toStrictEqual({
            estimation: '5',
            timestamp: 123
        })
    })

    test('hasEstimation for estimation', () => {
        const result = BetHelper.hasEstimation(BetHelper.betWith('5'))
        expect(result).toStrictEqual(true)
    })

    test('hasEstimation for no estimation', () => {
        const result = BetHelper.hasEstimation(BetHelper.noBet())
        expect(result).toStrictEqual(false)
    })

    test('hasEstimation for undefined', () => {
        const result = BetHelper.hasEstimation(undefined)
        expect(result).toStrictEqual(false)
    })

    test('isHidden for hidden', () => {
        const result = BetHelper.isHidden('#')
        expect(result).toStrictEqual(true)
    })

    test('isHidden for estimation', () => {
        const result = BetHelper.isHidden('5')
        expect(result).toStrictEqual(false)
    })

    test('isHidden for no estimation', () => {
        const result = BetHelper.isHidden('~')
        expect(result).toStrictEqual(false)
    })

    test('hide for estimation', () => {
        const result = BetHelper.hide(BetHelper.betWith('5'))
        expect(result).toStrictEqual({
            estimation: '#',
            timestamp: 123
        })
    })

    test('hide for no estimation', () => {
        const result = BetHelper.hide(BetHelper.betWith('~'))
        expect(result).toStrictEqual({
            estimation: '~',
            timestamp: 123
        })
    })

    test('hide for hidden', () => {
        const result = BetHelper.hide(BetHelper.betWith('#'))
        expect(result).toStrictEqual({
            estimation: '#',
            timestamp: 123
        })
    })

    test('hideForPlayerInfo', () => {
        const result = BetHelper.hideForPlayerInfo({
            id: 'player-id-1',
            name: 'player-name-1',
            observerMode: false,
            gone: false,
            bet: {
                estimation: '5',
                timestamp: 123
            }
        })
        expect(result).toStrictEqual({
            id: 'player-id-1',
            name: 'player-name-1',
            observerMode: false,
            gone: false,
            bet: {
                estimation: '#',
                timestamp: 123
            }
        })
    })
})
