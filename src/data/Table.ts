import { Player } from './Player'

export interface Table {
    id: string
    name: string
    players: Player[]
    me: Player
}
