import { PlayerInfo } from '@server/model/PlayerInfo'
import { TableInfo } from '@server/model/TableInfo'

export class Repository<T> {
    set(key: string, value: T) {
        localStorage.setItem(key, JSON.stringify(value))
    }

    get(key: string): T | undefined {
        const value = localStorage.getItem(key)
        return value === null ? undefined : JSON.parse(value)
    }
}

export class SingleObjectRepository<T> {
    private repository = new Repository<T>()

    constructor(private repositoryKey: string) { }

    get(): T | undefined {
        return this.repository.get(this.repositoryKey)
    }

    set(value: T) {
        return this.repository.set(this.repositoryKey, value)
    }
}

export class MultipleObjectRepository<T> {
    constructor(private repositoryKey: string) { }

    get(itemKey: string): T | undefined {
        const serializedValue = localStorage.getItem(this.repositoryKey)
        if (!serializedValue) {
            return undefined
        }
        const objectValue = JSON.parse(serializedValue)
        const map = new Map<string, T>(objectValue)
        return map.get(itemKey)
    }

    set(itemKey: string, value: T) {
        const serializedValue = localStorage.getItem(this.repositoryKey)
        let map
        if (!serializedValue) {
            map = new Map<string, T>()
        } else {
            const objectValue = JSON.parse(serializedValue)
            map = new Map<string, T>(objectValue)
        }
        map.set(itemKey, value)
        const serializableMap = Array.from(map.entries())
        localStorage.setItem(this.repositoryKey, JSON.stringify(serializableMap))
    }
}

export class StorageRepository {
    static player = new SingleObjectRepository<PlayerInfo>('player')
    static table = new MultipleObjectRepository<TableInfo>('tables')
}
