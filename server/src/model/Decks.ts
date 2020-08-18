export enum DeckKind {
    Fibonacci,
    ModifiedFibonacci,
    PowersOf2,
    Sequential,
    TShirts,
    Semaphore,
    Vote
}

export interface Deck {
    id: string,
    name: string,
    texts: string[]
}

export class DeckRepository {
    private static readonly Fibonacci = {
        id: 'Fibonacci',
        name: 'Fibonacci',
        texts: ['🤔', '0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '∞', '☕']
    }
    private static readonly ModifiedFibonacci = {
        id: 'ModifiedFibonacci',
        name: 'Modified Fibonacci',
        texts: ['🤔', '0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '∞', '☕']
    }
    private static readonly PowersOf2 = {
        id: 'PowersOf2',
        name: 'Powers of 2',
        texts: ['🤔', '0', '1', '2', '4', '8', '16', '32', '64', '128', '∞', '☕']
    }
    private static readonly Sequential = {
        id: 'Sequential',
        name: 'Sequential',
        texts: ['🤔', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '∞', '☕']
    }
    private static readonly TShirts = {
        id: 'TShirts',
        name: 'T-Shirts',
        texts: ['🤔', 'XS', 'S', 'M', 'L', 'XL', '∞', '☕']
    }
    private static readonly Semaphore = {
        id: 'Semaphore',
        name: 'Semaphore',
        texts: ['🟩', '🟨', '🟥']
    }
    private static readonly Vote = {
        id: 'Vote',
        name: 'Vote',
        texts: ['👍', '🤔', '👎']
    }

    static of(kind: DeckKind): Deck {
        switch (kind) {
            case DeckKind.Fibonacci: return this.Fibonacci
            case DeckKind.ModifiedFibonacci: return this.ModifiedFibonacci
            case DeckKind.PowersOf2: return this.PowersOf2
            case DeckKind.Sequential: return this.Sequential
            case DeckKind.TShirts: return this.TShirts
            case DeckKind.Semaphore: return this.Semaphore
            case DeckKind.Vote: return this.Vote
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
