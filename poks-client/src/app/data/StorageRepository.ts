import { PlayerInfo } from '@server/model/PlayerInfo'
import { TableInfo } from '@server/model/TableInfo'
import { IdGenerator } from '@/app/data/IdGenerator'

export class LocalStorageRepository<T> {
    private static _isAvailable: boolean | null = null

    static get isAvailable(): boolean {
        if (this._isAvailable === null) {
            try {
                const testKey = IdGenerator.randomUniqueId()
                localStorage.setItem(testKey, '')
                localStorage.removeItem(testKey)
                this._isAvailable = true
            } catch (e) {
                this._isAvailable = false
            }
        }
        return this._isAvailable
    }

    static player = new LocalStorageRepository<PlayerInfo>('player')
    static table = new LocalStorageRepository<TableInfo>('tables')

    constructor(private repositoryKey: string) { }

    get(itemKey: string | null = null): T | undefined {
        if (!LocalStorageRepository.isAvailable) {
            return undefined
        }
        const serializedValue = localStorage.getItem(this.repositoryKey)
        if (!serializedValue) {
            return undefined
        }
        const objectValue = JSON.parse(serializedValue)
        if (itemKey === null) {
            return objectValue
        }
        const map = new Map<string, T>(objectValue)
        return map.get(itemKey)
    }

    set(value: T, itemKey: string | null = null) {
        if (!LocalStorageRepository.isAvailable) {
            return
        }
        if (null == itemKey) {
            localStorage.setItem(this.repositoryKey, JSON.stringify(value))
            return
        }
        const serializedValue = localStorage.getItem(this.repositoryKey)
        let map
        if (!serializedValue) {
            map = new Map<string, T>()
        } else {
            const objectValue = JSON.parse(serializedValue)
            map = new Map<string, T>(objectValue)
        }
        map.set(itemKey, value)
        // TODO: remove older up to max items
        const serializableMap = Array.from(map.entries())
        localStorage.setItem(this.repositoryKey, JSON.stringify(serializableMap))
    }
}
