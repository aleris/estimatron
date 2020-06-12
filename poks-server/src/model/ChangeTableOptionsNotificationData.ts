import { DeckKind } from './Decks'

export class ChangeTableOptionsNotificationData {
    constructor(public readonly tableName: string, public readonly deckKind: DeckKind) { }
}
