import { Generator } from '@/app/data/name/Generator'
import { fictionalPlaceNames } from '@/app/data/name/fictionalPlaceNames'

export class NameGenerator {
    private static generator = new Generator(fictionalPlaceNames)
    public static randomReadableName(): string {
        return this.generator.next()
    }
}
