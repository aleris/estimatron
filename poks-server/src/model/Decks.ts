export enum DeckKind {
    MountainGoat,
    Fibonacci,
    Sequential,
    TShirts
}

export interface Deck {
    name: string,
    texts: string[]
}

export class DeckRepository {
    private static readonly Fibonacci = {
        name: 'Fibonacci',
        texts: ['?', '0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '∞']
    }
    private static readonly MountainGoat = {
        name: 'Mountain Goat',
        texts: ['?', '0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '∞']
    }
    private static readonly Sequential = {
        name: 'Sequential',
        texts: ['?', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '∞']
    }
    private static readonly TShirts = {
        name: 'T-Shirts',
        texts: ['?', 'XS', 'S', 'M', 'L', 'XL', '∞']
    }

    static of(kind: DeckKind): Deck {
        switch (kind) {
            case DeckKind.Fibonacci: return this.Fibonacci
            case DeckKind.MountainGoat: return this.MountainGoat
            case DeckKind.Sequential: return this.Sequential
            case DeckKind.TShirts: return this.TShirts
            default: {
                console.error(`no such deck: ${kind}`)
                return this.Fibonacci
            }
        }
    }

    public static defaultDeckKind = DeckKind.Fibonacci

    public static get defaultDeck(): Deck {
        return this.of(this.defaultDeckKind)
    }
}
