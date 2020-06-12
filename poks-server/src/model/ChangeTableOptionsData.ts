import { DeckKind } from './Decks'

export class ChangeTableOptionsData {
    constructor(public readonly tableName: string, public readonly deckKind: DeckKind) { }
}
