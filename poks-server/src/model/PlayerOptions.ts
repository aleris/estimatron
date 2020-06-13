import { id } from './id'

export class PlayerOptions {
    constructor(
        public readonly id: id,
        public readonly name: string,
        public readonly observerMode: boolean
    ) { }
}
