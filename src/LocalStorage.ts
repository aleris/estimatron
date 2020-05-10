import { Player } from './Player'

export class Repository<T> {
    set(key: string, value: T) {
        localStorage.setItem(key, JSON.stringify(value))
    }

    get(key: string): T {
        const value = localStorage.getItem(key)
        return value === null ? null : JSON.parse(value)
    }
}

export class SingleObjectRepository<T> {
    private repository = new Repository<T>()

    constructor(private key: string) { }

    get() {
        return this.repository.get(this.key)
    }

    set(value: T) {
        return this.repository.set(this.key, value)
    }
}

export class LocalStorage {
    static player = new SingleObjectRepository<Player>('player')
}
