import { DeckKind } from './Decks'
import { id } from './id'

export class TableOptions {
    constructor(
        public readonly changedByPlayerId: id,
        public readonly name: string,
        public readonly deckKind: DeckKind
    ) { }
}
