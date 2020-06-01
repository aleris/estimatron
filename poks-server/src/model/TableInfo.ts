import { DeckKind } from './Decks'
import { id } from './id'

export interface TableInfo {
    id: id,
    name: string,
    deckKind: DeckKind
}
