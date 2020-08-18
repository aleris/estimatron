import { BetHelper } from './Bet'
import { DeckKind } from './Decks'

export function createTestTableInfo(index = 1) {
    return {
        id: `table-id-${index}`,
        name: `table-name-${index}`,
        deckKind: DeckKind.Fibonacci,
        revealed: false
    }
}

export function createTestPlayerInfo(index = 1) {
    return {
        id: `player-id-${index}`,
        name: `player-name-${index}`,
        bet: BetHelper.noBet(),
        observerMode: false,
        gone: false
    }
}
