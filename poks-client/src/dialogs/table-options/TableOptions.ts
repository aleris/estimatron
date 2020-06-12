import { DeckKind } from '@server/model/Decks'

export class TableOptions {
    constructor(public readonly tableName: string, public readonly deckKind: DeckKind) { }
}
