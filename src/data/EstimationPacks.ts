export class EstimationPack {
    constructor(readonly name: string, readonly choices: string[]) { }
}

export class EstimationPacks {
    public static readonly MountainGoat = new EstimationPack(
        'Mountain Goat',
        ['?', '0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '∞', '☕']
    )

    public static readonly Fibonacci = new EstimationPack(
        'Fibonacci',
        ['?', '0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '∞']
    )

    public static readonly Sequential = new EstimationPack(
        'Sequential',
        ['?', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '∞']
    )

    public static readonly TShirts = new EstimationPack(
        'T-Shirt',
        ['?', 'XS', 'S', 'M', 'L', 'XL', '∞']
    )

    public static readonly Default = EstimationPacks.MountainGoat
}
