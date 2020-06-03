import { Bet } from './Bet'
import { id } from './id'
import { TableInfo } from './TableInfo'

export interface PlayerInfo {
    id: id,
    name: string,
    bet: Bet,
    observer: boolean,
    gone: boolean
}

export class PlayerInfoHelper {
    static nameAndId(playerInfo: PlayerInfo) {
        return `${playerInfo.name} (${playerInfo.id})`
    }
}
