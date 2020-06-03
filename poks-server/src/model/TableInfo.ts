import { DeckKind } from './Decks'
import { id } from './id'

export interface TableInfo {
    id: id,
    name: string,
    deckKind: DeckKind
}

export class TableInfoHelper {
    static nameAndId(tableInfo: TableInfo) {
        return `${tableInfo.name} (${tableInfo.id})`
    }
}
