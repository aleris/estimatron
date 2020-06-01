import { Bet } from './Bet'
import { id } from './id'

export interface PlayerInfo {
    id: id,
    name: string,
    bet: Bet,
    observer: boolean,
    gone: boolean
}
